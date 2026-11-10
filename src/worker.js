// Worker entry point. Single fetch handler; routing order is chosen so that
// every failure path returns the SAME response as an unknown path (S2): the
// decoy storefront. Errors are logged by name only (S8), never with request
// data.
import { VERSION, HTTPS_PORTS, PORT_MODE_BASE, USER_MODE_BASE, LEGACY_SESSION_PATH, LEGACY_WS_PATH, TOKEN_KIND_BOOTSTRAP } from "./version.js";
import { getRuntime, hostAllowed, serveSession, serveWebSocket, resolveAdmin, probeDcs } from "./handlers.js";
import { decoy } from "./decoy.js";
import { serveBridge } from "./bridge.js";
import { bridgeMode, issueToken, issueCookie, verifyCookie, COOKIE_NAME, COOKIE_TTL } from "./kdf.js";
import { serveSetup, serveLogin, servePanel, serveStatus, serveLatency, pageHeaders, bi, bilingualPage } from "./pages.js";
import { STATS, logEvent, loginLocked, loginFailure, loginSuccess, loginLockRemaining } from "./telemetry.js";
import { requestHost, safeEqual, b64uEncode } from "./util.js";
import { maybeAlert } from "./alerts.js";

function randomNonce() {
  return b64uEncode(crypto.getRandomValues(new Uint8Array(18)));
}

function strongKeySuggestion() {
  // 24 chars from a 62-char alphabet => ~143 bits of entropy.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function hexSecretSuggestion() {
  return [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sameOriginForm(request, url) {
  // CSRF guard for POST forms: Origin host must match the request host.
  const origin = request.headers.get("origin") || "";
  if (!origin) return false;
  try {
    return requestHost(request, url) === new URL(origin).host.toLowerCase().replace(/\.$/, "").split(":")[0] ||
      requestHost(request, url) === new URL(origin).hostname;
  } catch (_) {
    return false;
  }
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const host = requestHost(request, url);
      const rawHost = String(request.headers.get("host") || url.host || "");
      const portMatch = /:([0-9]+)$/.exec(rawHost);
      const port = portMatch ? portMatch[1] : (url.port || "");
      const lang = url.searchParams.get("lang") === "fa" ? "fa" : "en";

      let cfg = null;
      try {
        cfg = await getRuntime(env);
      } catch (e) {
        logEvent("cfg_error", e && e.name ? e.name : "unknown");
      }

      // Unconfigured worker: setup page on "/" only, decoy everywhere else.
      if (!cfg) {
        if (url.pathname === "/" && (request.method === "GET" || request.method === "HEAD")) {
          return serveSetup(null, host, lang, request.method, randomNonce(), { adminKey: strongKeySuggestion(), secret: hexSecretSuggestion() });
        }
        return decoy(null, request.method);
      }

      // ---- auth-independent static-ish surfaces (brand-consistent, S2) ----
      if (request.method === "GET" || request.method === "HEAD") {
        if (url.pathname === "/robots.txt") {
          return new Response(request.method === "HEAD" ? null : "User-agent: *\nAllow: /\nDisallow: /panel\nDisallow: /login\n", {
            status: 200,
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" }
          });
        }
        if (url.pathname === "/favicon.ico") {
          return new Response(request.method === "HEAD" ? null : cfg.faviconSvg, {
            status: 200,
            headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" }
          });
        }
        if (url.pathname === "/health" || url.pathname === "/status") {
          return new Response(request.method === "HEAD" ? null : cfg.healthJson, {
            status: 200,
            headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-cache" }
          });
        }
      }

      // ---- login / logout (S3) ----
      if (url.pathname === "/login") {
        if (request.method === "GET" || request.method === "HEAD") {
          if (loginLocked()) return decoy(cfg, request.method);
          return serveLogin(cfg, host, lang, randomNonce());
        }
        if (request.method === "POST") {
          if (loginLocked()) return decoy(cfg, request.method);
          if (!sameOriginForm(request, url)) return decoy(cfg, request.method);
          const form = await request.formData().catch(() => null);
          const key = form ? String(form.get("key") || "") : "";
          if (!cfg.adminKey || !key || !safeEqual(key, cfg.adminKey)) {
            loginFailure();
            logEvent("login_fail", "form");
            return serveLogin(cfg, host, lang, randomNonce(), "bad");
          }
          loginSuccess();
          logEvent("login_ok", "form");
          const { value, maxAge } = await issueCookie(cfg, host);
          return new Response(null, {
            status: 303,
            headers: {
              "Location": "/panel",
              "Set-Cookie": `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`
            }
          });
        }
        return decoy(cfg, request.method);
      }
      if (url.pathname === "/logout" && request.method === "POST") {
        if (sameOriginForm(request, url)) {
          return new Response(null, {
            status: 303,
            headers: { "Location": "/login", "Set-Cookie": `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0` }
          });
        }
        return decoy(cfg, request.method);
      }

      // ---- admin surface: /panel (cookie) or /<ADMIN_KEY> (deprecated URL key) ----
      const admin = await resolveAdmin(url, request, cfg, host);
      if (admin && (request.method === "GET" || request.method === "HEAD")) {
        const nonce = randomNonce();
        if (admin.kind === "status") {
          const wantsProbe = url.searchParams.get("probe") === "1";
          const probe = wantsProbe ? await probeDcs(cfg) : null;
          return serveStatus(cfg, host, lang, wantsProbe, probe, nonce, admin.via);
        }
        if (admin.kind === "latency") {
          return serveLatency(cfg, host, lang, nonce);
        }
        return servePanel(cfg, host, port, lang, nonce, admin.via);
      }

      // Setup page for SECRET-only deployments (no ADMIN_KEY yet): explains how
      // to add one. Never reveals the configured secret.
      if (!cfg.adminKey && url.pathname === "/setup" && (request.method === "GET" || request.method === "HEAD")) {
        return serveSetup(cfg, host, lang, request.method, randomNonce(), { adminKey: strongKeySuggestion(), secret: hexSecretSuggestion() });
      }

      if (!hostAllowed(cfg, host)) return decoy(cfg, request.method);

      // ---- carrier bridge ----
      if (url.pathname === "/" && request.method === "GET") {
        const bridges = url.searchParams.getAll("bridge");
        if (bridges.length === 0) return decoy(cfg, request.method);
        const keys = Array.from(url.searchParams.keys());
        if (keys.length !== 1 || keys[0] !== "bridge" || bridges.length !== 1) return decoy(cfg, request.method);
        const mode = await bridgeMode(cfg, host, bridges[0], port);
        if (mode < 0) return decoy(cfg, request.method);
        const bootstrap = await issueToken(cfg, TOKEN_KIND_BOOTSTRAP, cfg.bootstrapTtl, mode, host);
        return serveBridge(cfg, host, mode, port, randomNonce(), bootstrap, cfg.carrierResolved || cfg.carrier);
      }

      // ---- carrier endpoints: derived paths (+ legacy paths for one release) ----
      if (url.pathname === cfg.sessionPath || url.pathname === LEGACY_SESSION_PATH) {
        return serveSession(request, cfg, host);
      }
      if (url.pathname === cfg.wsPath || url.pathname === LEGACY_WS_PATH) {
        return serveWebSocket(request, cfg, host, port);
      }

      return decoy(cfg, request.method);
    } catch (e) {
      // S8: log the error class only; client-visible behavior unchanged.
      logEvent("error", e && e.name ? e.name : "unknown");
      try {
        return await decoy(null, request.method);
      } catch (_) {
        return new Response("Service Unavailable", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    }
  }
};
