// Request handlers: carrier entry, session/WebSocket endpoints, admin auth
// (S3), DC probe, optional alerting (R5). Every failure on the carrier paths
// returns exactly the same response as any unknown path (S2): the decoy.
import { VERSION, HTTPS_PORTS, TOKEN_KIND_BOOTSTRAP, TOKEN_KIND_SESSION } from "./version.js";
import { resolveConfig } from "./config.js";
import { buildRuntime, issueToken, verifyToken, issueCookie, verifyCookie, bridgeMode, modeSecret, COOKIE_NAME } from "./kdf.js";
import { decoy, brandifyDecoy, DECOY_TEMPLATE, healthJson, faviconSvg } from "./decoy.js";
import { WELCOME, WsSession } from "./protocol.js";
import { serveBridge } from "./bridge.js";
import { serveSetup, serveLogin, servePanel, serveStatus, serveLatency } from "./pages.js";
import { STATS, logEvent, loginLocked, loginFailure, loginSuccess, loginLockRemaining, USER_SESSIONS } from "./telemetry.js";
import { requestHost, safeEqual } from "./util.js";
import { connect as cfConnect } from "cloudflare:sockets";

let cachedRuntime = null;
let cachedKey = null;

function runtimeCacheKey(env) {
  const parts = [];
  for (const k of ["SECRET", "ADMIN_KEY", "KEY_EPOCH", "HOSTNAME", "EXTRA_HOSTS", "DECOY_URL", "CARRIER", "MAX_STREAMS", "SESSION_PATH", "WS_PATH", "DEBUG", "UP_BATCH_BYTES", "DATA_CHUNK", "MAX_QUEUED", "MAX_ISOLATE_QUEUED", "DC_OVERRIDE", "USER_SECRETS", "LEGACY_PORT_SECRETS", "ALERT_URL", "BOOTSTRAP_TTL", "SESSION_TTL"]) {
    parts.push(k + "=" + (typeof env?.[k] === "string" ? env[k] : ""));
  }
  return parts.join("|");
}

export async function getRuntime(env) {
  const key = runtimeCacheKey(env);
  if (cachedRuntime && cachedKey === key) return withResolvedCarrier(cachedRuntime);
  const resolved = resolveConfig(env);
  const runtime = await buildRuntime(resolved);
  if (runtime) {
    // Pre-build the branded decoy once per runtime (S2): zero per-request work.
    runtime.decoyHtml = brandifyDecoy(DECOY_TEMPLATE, runtime.brand);
    runtime.healthJson = healthJson(runtime.brand);
    runtime.faviconSvg = faviconSvg(runtime.brand);
    cachedRuntime = runtime;
    cachedKey = key;
  }
  return withResolvedCarrier(runtime);
}

// F6: CARRIER=auto heuristic. Documented, deterministic per isolate:
//   - default stays "websocket-lanes" (one WebSocket per MTProto stream: every
//     invocation gets its own CPU/subrequest budget, best for heavy media);
//   - once the isolate has served >= AUTO_LANE_THRESHOLD sessions (request
//     budget pressure on the 100k/day free limit), new bridge pages are issued
//     "websocket" (all streams multiplexed in one request).
// Only used when CARRIER=auto; any explicit choice is honored unchanged.
const AUTO_LANE_THRESHOLD = 500;

function withResolvedCarrier(runtime) {
  if (!runtime) return runtime;
  runtime.carrierResolved = runtime.carrier === "auto"
    ? (STATS.sessions >= AUTO_LANE_THRESHOLD ? "websocket" : "websocket-lanes")
    : runtime.carrier;
  return runtime;
}

export function hostAllowed(cfg, host) {
  if (!/^[a-z0-9.-]+$/.test(host) || host.includes("..")) return false;
  if (cfg.hosts.length === 0 || cfg.hosts.includes("*") || (cfg.hosts.length === 1 && cfg.hosts[0] === "proxy.example.com")) {
    return true;
  }
  return cfg.hosts.includes(host) || (cfg.extraHosts || []).includes(host);
}

// ---- session / ws endpoints (S2: uniform decoy on every failure) ----

export async function serveSession(request, cfg, host) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ") || auth.length <= 7) return decoy(cfg);
  const token = auth.substring(7);
  if (request.method === "DELETE") {
    if (!(await verifyToken(cfg, token, TOKEN_KIND_SESSION, host))) return decoy(cfg);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
  if (request.method !== "POST") return decoy(cfg);
  if (request.headers.get("cookie")) return decoy(cfg);
  if ((request.headers.get("content-type") || "").toLowerCase() !== "application/octet-stream") return decoy(cfg);
  // The handshake body is a fixed 9 bytes. Reject an oversized declared body
  // before buffering it: isolate memory (128 MB) is shared by every session.
  const declaredLength = parseInt(request.headers.get("content-length") || "", 10);
  if (Number.isFinite(declaredLength) && declaredLength > 4096) return decoy(cfg);
  const verified = await verifyToken(cfg, token, TOKEN_KIND_BOOTSTRAP, host);
  if (!verified) return decoy(cfg);
  const body = new Uint8Array(await request.arrayBuffer());
  if (body.length !== 9) return decoy(cfg);
  if (body[0] !== 0x10 || body[1] !== 0 || body[2] !== 0 || body[3] !== 0) return decoy(cfg);
  if (body[4] !== 0 || body[5] !== 0 || body[6] !== 0 || body[7] !== 1 || body[8] !== 1) return decoy(cfg);
  const sessionToken = await issueToken(cfg, TOKEN_KIND_SESSION, cfg.sessionTtl, verified.mode, host);
  return new Response(WELCOME, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Session-Token": sessionToken,
      "X-Down-Cursor": "0",
      "X-Carrier-Mode": cfg.carrierResolved || cfg.carrier
    }
  });
}

export async function serveWebSocket(request, cfg, host, port) {
  if (request.method !== "GET") return decoy(cfg);
  if ((request.headers.get("upgrade") || "").toLowerCase() !== "websocket") return decoy(cfg);
  if (request.headers.get("authorization")) return decoy(cfg);
  const offered = (request.headers.get("sec-websocket-protocol") || "").split(",").map((value) => value.trim()).filter(Boolean);
  if (offered.length !== 1) return decoy(cfg);
  const protocol = offered[0];
  let token = "";
  let laneId = 0;
  if (protocol.startsWith("tproxy-v1.")) {
    token = protocol.substring(10);
  } else if (protocol.startsWith("tproxy-lane-v1.")) {
    const rest = protocol.substring(15);
    const dot = rest.lastIndexOf(".");
    if (dot <= 0 || !/^[1-9][0-9]{0,7}$/.test(rest.substring(dot + 1))) return decoy(cfg);
    token = rest.substring(0, dot);
    laneId = parseInt(rest.substring(dot + 1), 10);
    if (laneId > 0xffffff) return decoy(cfg);
  } else {
    return decoy(cfg);
  }
  const verified = await verifyToken(cfg, token, TOKEN_KIND_SESSION, host);
  if (!verified) {
    // A real WebSocket upgrade with an invalid/expired token is either a
    // forgery attempt or a client whose token expired - worth a log line.
    STATS.wsRejects++;
    logEvent("ws_reject", "invalid or expired session token");
    return decoy(cfg);
  }
  const secret = await modeSecret(cfg, verified.mode, host, port);
  if (!secret) return decoy(cfg);
  // R1: ephemeral per-user session counter (never persisted).
  if (verified.mode >= 20 && verified.mode < 36) {
    const user = cfg.userSecrets[verified.mode - 20];
    if (user) USER_SESSIONS[user.label] = (USER_SESSIONS[user.label] || 0) + 1;
  }
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];
  server.binaryType = "arraybuffer";
  server.accept();
  const session = new WsSession(server, cfg, secret, laneId, cfConnect);
  server.addEventListener("message", (event) => session.enqueue(event.data));
  // F7: abrupt close/error while active is our (weak) proxy for CPU-limit or
  // isolate-recycle kills; counted for the status page only.
  server.addEventListener("close", () => { if (!session.closed) STATS.cpuSuspect++; session.dispose(); });
  server.addEventListener("error", () => { if (!session.closed) STATS.cpuSuspect++; session.dispose(); });
  return new Response(null, {
    status: 101,
    webSocket: client,
    headers: {
      "Sec-WebSocket-Protocol": protocol
    }
  });
}

// ---- admin surface (S3) ----

function cookieValue(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return "";
}

// Resolves the admin surface a request targets. Preference: valid cookie on
// /panel[...], then the deprecated URL key /<key>[...]. Throttling policy:
// failed URL-key attempts with admin-key-shaped paths feed the same coarse
// global backoff as failed logins (S3, no IP storage). While locked, every
// admin path is silently camouflaged (returns null -> decoy).
export async function resolveAdmin(url, request, cfg, host) {
  if (!cfg.adminKey) return null;
  let path = "";
  try { path = decodeURIComponent(url.pathname.slice(1)); } catch (_) { return null; }
  if (path.endsWith("/")) path = path.slice(0, -1);

  const cookie = cookieValue(request, COOKIE_NAME);
  if (cookie && (path === "panel" || path === "panel/status" || path === "panel/latency")) {
    if (await verifyCookie(cfg, host, cookie)) {
      if (path === "panel/status") return { kind: "status", via: "cookie" };
      if (path === "panel/latency") return { kind: "latency", via: "cookie" };
      return { kind: "panel", via: "cookie" };
    }
    return null;
  }

  if (path && path !== "login") {
    // Admin-key shaped paths: <key> or <key>/status
    if (/^[A-Za-z0-9_-]{16,128}(\/status)?$/.test(path)) {
      if (loginLocked()) return null; // silently camouflaged while locked
      if (safeEqual(path, cfg.adminKey)) { loginSuccess(); return { kind: "panel", via: "url" }; }
      if (safeEqual(path, cfg.adminKey + "/status")) { loginSuccess(); return { kind: "status", via: "url" }; }
      loginFailure();
    }
  }
  return null;
}

export { resolveAdmin as panelRoute };

// ---- DC probe (admin-only, on demand) ----
export async function probeDcs(cfg) {
  const keys = Object.keys(cfg.dc).map(Number).sort((a, b) => a - b);
  const results = [];
  const probeOne = async (key) => {
    const ips = Array.isArray(cfg.dc[key]) ? cfg.dc[key] : [cfg.dc[key]];
    const ip = ips[Math.floor(Math.random() * ips.length)];
    const started = Date.now();
    let socket = null;
    try {
      socket = cfConnect({ hostname: ip, port: cfg.dcPort || 443 }, { secureTransport: "off" });
      socket.closed.catch(() => {});
      await Promise.race([socket.opened, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2500))]);
      try { await socket.close(); } catch (_) {}
      results.push({ dc: key, ip, ok: true, ms: Date.now() - started });
    } catch (_) {
      if (socket) { try { socket.close().catch(() => {}); } catch (_) {} }
      results.push({ dc: key, ip, ok: false, ms: Date.now() - started });
    }
  };
  for (let i = 0; i < keys.length; i += 3) {
    await Promise.all(keys.slice(i, i + 3).map(probeOne));
  }
  logEvent("dc_probe", results.map((r) => "DC" + r.dc + (r.ok ? ":ok" : ":fail")).join(" "));
  return results;
}

// ---- optional alerting lives in alerts.js (imported by protocol.js) ----

