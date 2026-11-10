// Runtime key material, token engine, capability verification and deployment
// fingerprints. Implements S1 (SECRET-first + legacy), S2 (derived paths +
// decoy brand), S4 (host-bound tokens, KEY_EPOCH), S5 (port isolation data),
// S7 (seal-free new-mode KDF).
import { KDF_DOMAIN, TOKEN_DOMAIN, TOKEN_KIND_BOOTSTRAP, TOKEN_KIND_SESSION, HTTPS_PORTS, PORT_MODE_BASE, USER_MODE_BASE, USER_MODE_LIMIT, LEGACY_SEAL_B64, CREDIT_NAME, CREDIT_MAIL } from "./version.js";
import { sha256, importHmac, hmacSign, hmacVerify, parseSecret } from "./crypto.js";
import { concat, te, bytesToHex, b64uEncode, b64uDecodeStrict } from "./util.js";
import { adminKeyIssues } from "./config.js";

// ---- legacy seal (S7): decoded once, ONLY for the v1.2.2 legacy derivation ----
let sealCache = null;
async function legacySealBytes() {
  if (sealCache) return sealCache;
  const raw = atob(LEGACY_SEAL_B64);
  const data = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
  const salt = concat(TOKEN_DOMAIN, Uint8Array.of(0x50, 0x47, 0x01));
  const out = new Uint8Array(data.length);
  let stream = new Uint8Array(0);
  for (let block = 0; stream.length < data.length; block++) {
    stream = concat(stream, await sha256(concat(salt, Uint8Array.of(block))));
  }
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ stream[i];
  sealCache = out;
  return out;
}

export { CREDIT_NAME, CREDIT_MAIL };

// ---- decoy brand derivation (S2): deterministic per deployment secret ----
const BRAND_NAMES = ["LUXVEIL", "VELOURA", "AURELLE", "SARTORIA", "NOVELLE", "MAISONOIR", "ELYSANE", "VELVETTE"];
const PALETTES = [
  { accent: "#92400e", dark: "#7c3309", light: "#fef3c7" },
  { accent: "#155e75", dark: "#0e4a5f", light: "#cffafe" },
  { accent: "#4d7c0f", dark: "#3f6212", light: "#ecfccb" },
  { accent: "#86198f", dark: "#701a75", light: "#fae8ff" },
  { accent: "#9f1239", dark: "#881337", light: "#ffe4e6" },
  { accent: "#3730a3", dark: "#312e81", light: "#e0e7ff" }
];
const PRODUCT_SETS = [
  [["Wool Blend Overcoat", "Outerwear", "$385.00", ""], ["Relaxed Fit Blazer", "Tailoring", "$265.00", ""], ["Merino Turtleneck", "Knitwear", "$145.00", "$195.00"], ["Leather Crossbody Bag", "Accessories", "$220.00", ""]],
  [["Cashmere Cardigan", "Knitwear", "$410.00", ""], ["Silk Evening Dress", "Occasion", "$520.00", ""], ["Linen Wide Trousers", "Tailoring", "$175.00", "$220.00"], ["Suede Tote Bag", "Accessories", "$295.00", ""]],
  [["Trench Coat", "Outerwear", "$450.00", "$530.00"], ["Pleated Midi Skirt", "Occasion", "$190.00", ""], ["Ribbed Sweater Vest", "Knitwear", "$120.00", ""], ["Satin Scarf", "Accessories", "$85.00", ""]],
  [["Double-Breasted Coat", "Outerwear", "$540.00", ""], ["Velvet Blazer", "Tailoring", "$380.00", "$460.00"], ["Alpaca Crewneck", "Knitwear", "$210.00", ""], ["Chain Shoulder Bag", "Accessories", "$330.00", ""]]
];
const CITY_NAMES = [["London", "Dubai", "Paris"], ["Milan", "Doha", "Vienna"], ["Zurich", "Istanbul", "Rome"], ["Madrid", "Dusseldorf", "Lisbon"]];

function pick(list, byte) { return list[byte % list.length]; }

export async function deriveDecoyBrand(base) {
  const seed = await sha256(concat(KDF_DOMAIN, te.encode("decoy-brand\0"), base));
  const brand = pick(BRAND_NAMES, seed[0]);
  const palette = PALETTES[seed[1] % PALETTES.length];
  const products = PRODUCT_SETS[seed[2] % PRODUCT_SETS.length];
  const cities = CITY_NAMES[seed[3] % CITY_NAMES.length];
  const initials = brand.slice(0, 2);
  return { name: brand, initials, palette, products, cities };
}

// ---- derived deployment paths (S2) ----
export async function derivePaths(base) {
  const pathKey = await sha256(concat(KDF_DOMAIN, te.encode("path-key\0"), base));
  const sessionMac = await hmacSign(await importHmac(pathKey, ["sign"]), te.encode("session-path"));
  const wsMac = await hmacSign(await importHmac(pathKey, ["sign"]), te.encode("ws-path"));
  return {
    sessionPath: "/s/" + bytesToHex(sessionMac.subarray(0, 4)),
    wsPath: "/w/" + bytesToHex(wsMac.subarray(0, 4))
  };
}

// ---- per-user secrets (R1): HMAC-derived from short labels ----
export async function deriveUserSecrets(base, labels) {
  if (!base || !labels || !labels.length) return [];
  const userKey = await sha256(concat(KDF_DOMAIN, te.encode("user-key\0"), base));
  const hmac = await importHmac(userKey, ["sign", "verify"]);
  const out = [];
  for (const label of labels.slice(0, USER_MODE_LIMIT)) {
    const secret = (await hmacSign(hmac, te.encode("tgweb-user-secret-v1\n" + label))).subarray(0, 16);
    out.push({
      label,
      secret,
      secretHex: "dd" + bytesToHex(secret),
      keys: [
        await importHmac(secret, ["verify"]),
        await importHmac(concat(Uint8Array.of(0xdd), secret), ["verify"])
      ]
    });
  }
  return out;
}

// ---- runtime construction ----
export async function buildRuntime(cfg) {
  const adminKey = cfg.adminKey && cfg.adminKey.length >= 16 ? cfg.adminKey : "";
  let base = parseSecret(cfg.secretHex);
  const secretDerived = !base && !!adminKey; // legacy mode: SECRET not set, ADMIN_KEY present
  if (secretDerived) {
    // v1.2.2 byte-exact legacy derivation. The seal bytes are consumed ONLY
    // here; new deployments set SECRET and never depend on them (S1, S7).
    const seal = await legacySealBytes();
    base = (await sha256(concat(te.encode("proxygosha-secret-from-admin-v2\n"), seal, te.encode("\n" + adminKey)))).slice(0, 16);
  }
  if (!base) return null;

  const keyEpoch = cfg.keyEpoch || "";
  // Token key (S4): v3 mixes KEY_EPOCH for mass revocation; seal bytes are gone (S7).
  const tokenKey = await importHmac(
    await sha256(concat(KDF_DOMAIN, te.encode("token-key\0"), te.encode(keyEpoch + "\0"), base)),
    ["sign", "verify"]
  );
  const cookieKey = await sha256(concat(KDF_DOMAIN, te.encode("cookie-key\0"), base));

  const portSecrets = {};
  for (const p of HTTPS_PORTS) {
    let sBytes;
    if (p === 443) {
      sBytes = base;
    } else {
      // Same derivation as v1.2.2 (base-only, seal-free already): port secrets
      // are identical across legacy/new modes for the same base secret.
      sBytes = (await sha256(concat(te.encode("proxygosha-port-secret-v1\n"), base, te.encode("\n" + p)))).slice(0, 16);
    }
    portSecrets[p] = {
      secret: sBytes,
      secretHex: "dd" + bytesToHex(sBytes),
      keys: [
        await importHmac(sBytes, ["verify"]),
        await importHmac(concat(Uint8Array.of(0xdd), sBytes), ["verify"])
      ]
    };
  }

  const bridgeKeys = [
    await importHmac(base, ["verify"]),
    await importHmac(concat(Uint8Array.of(0xdd), base), ["verify"])
  ];

  const userSecrets = await deriveUserSecrets(base, cfg.userLabels);
  const brand = await deriveDecoyBrand(base);
  const derived = await derivePaths(base);

  const hosts = Array.isArray(cfg.hostnames)
    ? cfg.hostnames.map((value) => String(value).trim().toLowerCase()).filter(Boolean)
    : [];

  return {
    base,
    baseHex: "dd" + bytesToHex(base),
    portSecrets,
    bridgeKeys,
    userSecrets,
    adminKey,
    adminIssues: adminKeyIssues(cfg.adminKey),
    secretDerived,
    keyEpoch,
    keyEpochFingerprint: bytesToHex((await sha256(te.encode("epoch\0" + keyEpoch))).subarray(0, 4)),
    cookieKey,
    tokenKey,
    hosts,
    extraHosts: cfg.extraHosts || [],
    brand,
    decoyHtml: null, // built lazily by decoy.js
    sessionPath: cfg.sessionPath || derived.sessionPath,
    wsPath: cfg.wsPath || derived.wsPath,
    sessionPathDerived: !cfg.sessionPath,
    wsPathDerived: !cfg.wsPath,
    dc: cfg.effectiveDc,
    dcPort: cfg.dcPort,
    dcPorts: cfg.dcPorts,
    dcOverrideApplied: !!cfg.dcOverride,
    debug: cfg.debug,
    decoyUrl: cfg.decoyUrl,
    alertUrl: cfg.alertUrl,
    carrier: cfg.carrier,
    envIssues: cfg.issues,
    unknownEnv: cfg.unknown,
    legacyPortSecrets: cfg.legacyPortSecrets,
    streamWindow: cfg.streamWindow,
    maxQueued: cfg.maxQueued,
    maxIsolateQueued: cfg.maxIsolateQueued,
    maxStreams: cfg.maxStreams,
    dataChunk: cfg.dataChunk,
    upBatchBytes: cfg.upBatchBytes,
    bootstrapTtl: cfg.bootstrapTtl,
    sessionTtl: cfg.sessionTtl,
    batchBytes: cfg.batchBytes
  };
}

// ---- token engine (S4): MAC input now binds the deployment host ----
export async function issueToken(cfg, kind, ttl, mode, host) {
  const nonce = new Uint8Array(16);
  new DataView(nonce.buffer).setUint32(0, Math.floor(Date.now() / 1000) + ttl, false);
  nonce[4] = typeof mode === "number" && mode >= 0 && mode <= 255 ? mode : 0;
  crypto.getRandomValues(nonce.subarray(5));
  const mac = await hmacSign(cfg.tokenKey, concat(TOKEN_DOMAIN, Uint8Array.of(kind), nonce, te.encode(host)));
  return b64uEncode(concat(nonce, mac));
}

export async function verifyToken(cfg, token, kind, host) {
  const raw = b64uDecodeStrict(token);
  if (!raw || raw.length !== 48) return null;
  const nonce = raw.subarray(0, 16);
  const mac = raw.subarray(16);
  const ok = await hmacVerify(cfg.tokenKey, mac, concat(TOKEN_DOMAIN, Uint8Array.of(kind), nonce, te.encode(host)));
  if (!ok) return null;
  const expires = new DataView(nonce.buffer, nonce.byteOffset, 4).getUint32(0, false);
  if (expires < Math.floor(Date.now() / 1000)) return null;
  return { nonce, mode: nonce[4] };
}

// ---- admin cookie (S3): HMAC-signed, host-bound, short-lived ----
export const COOKIE_NAME = "pg_panel";
export const COOKIE_TTL = 6 * 3600; // seconds

export async function issueCookie(cfg, host, now = Date.now()) {
  const exp = Math.floor(now / 1000) + COOKIE_TTL;
  const mac = await hmacSign(await importHmac(cfg.cookieKey, ["sign"]), te.encode(`pg-admin-cookie-v1\n${host}\n${exp}`));
  return { value: `${exp}.${b64uEncode(mac)}`, maxAge: COOKIE_TTL };
}

export async function verifyCookie(cfg, host, cookieValue, now = Date.now()) {
  if (typeof cookieValue !== "string") return false;
  const dot = cookieValue.indexOf(".");
  if (dot <= 0) return false;
  const exp = cookieValue.slice(0, dot);
  if (!/^[0-9]{10}$/.test(exp)) return false;
  if (parseInt(exp, 10) < Math.floor(now / 1000)) return false;
  const expected = await hmacSign(await importHmac(cfg.cookieKey, ["sign"]), te.encode(`pg-admin-cookie-v1\n${host}\n${exp}`));
  const given = b64uDecodeStrict(cookieValue.slice(dot + 1));
  if (!given || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given[i] ^ expected[i];
  return diff === 0;
}

// ---- capability verification (S5/S6) ----
// Strict mode (default): a port accepts ONLY its own secret; user secrets are
// accepted everywhere (they replace the connection secret). Legacy cross-port
// fallbacks run only when LEGACY_PORT_SECRETS is enabled. Total HMAC verifies
// are hard-capped and every loop exits on first match (S6).
const VERIFY_BUDGET = 24;

function bridgeContexts(host, port) {
  return port === 443 ? [te.encode("tdesktop-web-proxy-bridge-v1\n" + host)] : [
    te.encode(`tdesktop-web-proxy-bridge-v1\n${host}:${port}`),
    te.encode("tdesktop-web-proxy-bridge-v1\n" + host)
  ];
}

export async function bridgeMode(cfg, host, capability, port) {
  const provided = b64uDecodeStrict(capability);
  if (!provided || provided.length !== 32) return -1;

  const incomingPort = port ? parseInt(port, 10) : 443;
  let budget = VERIFY_BUDGET;

  // Strict pass 1: this port's own secret.
  if (HTTPS_PORTS.includes(incomingPort) && cfg.portSecrets?.[incomingPort]) {
    const keys = cfg.portSecrets[incomingPort].keys;
    for (const ctx of bridgeContexts(host, incomingPort)) {
      for (const key of keys) {
        if (budget-- <= 0) return -1;
        if (await crypto.subtle.verify("HMAC", key, provided, ctx)) {
          return PORT_MODE_BASE + HTTPS_PORTS.indexOf(incomingPort);
        }
      }
    }
  }

  // Strict pass 2: per-user secrets (R1).
  for (let i = 0; i < cfg.userSecrets.length; i++) {
    const user = cfg.userSecrets[i];
    for (const ctx of bridgeContexts(host, incomingPort)) {
      for (const key of user.keys) {
        if (budget-- <= 0) return -1;
        if (await crypto.subtle.verify("HMAC", key, provided, ctx)) {
          return USER_MODE_BASE + i;
        }
      }
    }
  }

  // Legacy pass (opt-in via LEGACY_PORT_SECRETS=1): v1.2.2 fallback branches.
  // Accepts the 443/base secret on every port and any port secret on 443.
  if (cfg.legacyPortSecrets) {
    const candidatePorts = [];
    if (port && port !== "443" && port !== "80") candidatePorts.push(port);
    for (const p of HTTPS_PORTS) if (p !== 443 && !candidatePorts.includes(String(p))) candidatePorts.push(String(p));
    const candidateHosts = [host, ...candidatePorts.map((p) => `${host}:${p}`)];

    for (const h of candidateHosts) {
      const context = te.encode("tdesktop-web-proxy-bridge-v1\n" + h);
      for (const key of cfg.bridgeKeys) {
        if (budget-- <= 0) return -1;
        if (await crypto.subtle.verify("HMAC", key, provided, context)) {
          return PORT_MODE_BASE; // 443/base secret presented on a non-443 port
        }
      }
    }

    if (cfg.portSecrets) {
      for (let idx = 0; idx < HTTPS_PORTS.length; idx++) {
        const p = HTTPS_PORTS[idx];
        if (p === incomingPort) continue;
        const keys = cfg.portSecrets[p].keys;
        const contexts = [
          te.encode(`tdesktop-web-proxy-bridge-v1\n${host}:${p}`),
          te.encode("tdesktop-web-proxy-bridge-v1\n" + host)
        ];
        for (const ctx of contexts) {
          for (const key of keys) {
            if (budget-- <= 0) return -1;
            if (await crypto.subtle.verify("HMAC", key, provided, ctx)) {
              if (!port || port === "443" || port === String(p)) {
                return PORT_MODE_BASE + idx;
              }
            }
          }
        }
      }
    }
  }

  return -1;
}

// Secret used for the MTProto obfuscation layer, resolved from the token mode.
export async function modeSecret(cfg, mode, host, port) {
  if (mode >= PORT_MODE_BASE && mode < PORT_MODE_BASE + HTTPS_PORTS.length) {
    const portNum = HTTPS_PORTS[mode - PORT_MODE_BASE];
    return cfg.portSecrets?.[portNum]?.secret || cfg.base;
  }
  if (mode >= USER_MODE_BASE && mode < USER_MODE_BASE + USER_MODE_LIMIT) {
    return cfg.userSecrets[mode - USER_MODE_BASE]?.secret || null;
  }
  if (mode === 0) return cfg.base;
  return null;
}

export { TOKEN_KIND_BOOTSTRAP, TOKEN_KIND_SESSION };
