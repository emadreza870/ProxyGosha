// Environment resolution + validation. Every variable the code reads is listed
// in KNOWN_ENV so /status can flag unknown/invalid settings (R4).
import { HTTPS_PORTS } from "./version.js";

export const CONFIG = {
  hostnames: ["*"],
  debug: false,
  dc: {
    1: ["149.154.175.50", "149.154.175.53", "149.154.175.54"],
    2: ["149.154.167.51", "149.154.167.50", "149.154.167.40", "149.154.167.41"],
    3: ["149.154.175.100", "149.154.175.101"],
    4: ["149.154.167.91", "149.154.167.92", "149.154.167.90"],
    5: ["91.108.56.156", "91.108.56.165", "91.108.56.170"],
    203: ["91.105.192.110"]
  },
  dcPort: 443,
  dcPorts: [443, 80, 5222],
  carrier: "websocket-lanes",
  sessionPath: "",              // empty => derived from secret (S2)
  wsPath: "",
  batchBytes: 2097152,          // bridge -> carrier max batch (unchanged)
  upBatchBytes: 262144,         // F1: 256 KiB DC-bound coalescing
  bootstrapTtl: 3600,           // 1 hour
  sessionTtl: 21600,            // S4: 6 hours (was 86400); bridge refreshes on reconnect
  maxStreams: 6,
  maxQueued: 16777216,
  maxIsolateQueued: 33554432,   // F4: 32 MB isolate-wide guard
  streamWindow: 4194304,
  dataChunk: 65536
};

export const KNOWN_ENV = [
  "ADMIN_KEY", "SECRET", "KEY_EPOCH", "EXTRA_HOSTS", "DECOY_URL", "CARRIER",
  "HOSTNAME", "MAX_STREAMS", "SESSION_PATH", "WS_PATH", "DEBUG",
  "UP_BATCH_BYTES", "DATA_CHUNK", "MAX_ISOLATE_QUEUED", "MAX_QUEUED",
  "SESSION_TTL", "DC_OVERRIDE", "USER_SECRETS", "LEGACY_PORT_SECRETS", "ALERT_URL", "BOOTSTRAP_TTL"
];

// ADMIN_KEY entropy checks (S1). Returns a list of human-readable warnings.
// <16 chars is rejected earlier (admin disabled); 16-23 chars gets a warning.
const COMMON_PATTERNS = ["password", "passwd", "123456", "qwerty", "admin", "letmein", "iloveyou", "proxygosha", "telegram", "aaaaaaaa"];

export function adminKeyIssues(key) {
  const issues = [];
  if (!key) return issues;
  if (key.length < 16) { issues.push("too short (<16): rejected"); return issues; }
  if (key.length < 24) issues.push("shorter than the recommended 24 characters");
  const classes = /[a-z]/.test(key) + /[A-Z]/.test(key) + /[0-9]/.test(key) + /[^A-Za-z0-9]/.test(key);
  if (classes < 2) issues.push("uses fewer than 2 character classes (dictionary-like)");
  if (new Set(key).size < Math.min(10, Math.ceil(key.length / 3))) issues.push("low character variety");
  const lower = key.toLowerCase();
  for (const p of COMMON_PATTERNS) if (lower.includes(p)) { issues.push(`contains a common pattern ("${p}")`); break; }
  if (/^(.)\1+$/.test(key) || /^(0123|1234|abcd|aaaa)/i.test(key)) issues.push("looks sequential");
  return issues;
}

function parsePortList(value) {
  return String(value).split(/[,\s]+/).map((v) => parseInt(v, 10)).filter((v) => Number.isInteger(v) && v > 0 && v < 65536);
}

// Resolves and validates every env var. Never throws: problems are collected
// into `issues` and surfaced on /status; invalid values fall back to defaults.
export function resolveConfig(env) {
  const issues = [];
  const unknown = [];
  if (env && typeof env === "object") {
    for (const k of Object.keys(env)) {
      if (k.startsWith("CF_") || k.startsWith("__") || k === "nodejs_") continue;
      if (!KNOWN_ENV.includes(k)) unknown.push(k);
    }
  }
  const str = (name) => (typeof env?.[name] === "string" ? env[name] : "");
  const num = (name, def, min, max) => {
    const raw = str(name).trim();
    if (!raw) return def;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < min || n > max) {
      issues.push(`${name}: invalid value "${raw.slice(0, 24)}", using default ${def}`);
      return def;
    }
    return n;
  };

  const secretHex = str("SECRET").trim();
  const adminKey = str("ADMIN_KEY").trim();
  const keyEpoch = str("KEY_EPOCH").trim();
  const debug = env?.DEBUG === "true" || env?.DEBUG === "1";
  const decoyUrl = str("DECOY_URL").trim();
  const alertUrl = str("ALERT_URL").trim();
  if (alertUrl && !/^https:\/\//.test(alertUrl)) {
    issues.push("ALERT_URL: ignored, must be an https:// URL");
  }

  let hostnames = [];
  if (str("HOSTNAME").trim()) {
    hostnames = str("HOSTNAME").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  } else {
    hostnames = CONFIG.hostnames.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
  }

  const maxStreams = num("MAX_STREAMS", CONFIG.maxStreams, 1, 32);
  const bootstrapTtl = num("BOOTSTRAP_TTL", CONFIG.bootstrapTtl, 60, 86400);
  const sessionTtl = num("SESSION_TTL" , CONFIG.sessionTtl, 600, 86400); // hidden tuning knob
  if (str("SESSION_TTL").trim()) issues.push("SESSION_TTL: non-standard override in use");

  let sessionPath = "";
  let wsPath = "";
  const rawSession = str("SESSION_PATH").trim();
  const rawWs = str("WS_PATH").trim();
  if (rawSession) {
    sessionPath = rawSession.startsWith("/") ? rawSession : "/" + rawSession;
    if (!/^\/[A-Za-z0-9._~/-]{1,64}$/.test(sessionPath) || sessionPath.includes("..")) {
      issues.push("SESSION_PATH: invalid path, ignoring");
      sessionPath = "";
    }
  }
  if (rawWs) {
    wsPath = rawWs.startsWith("/") ? rawWs : "/" + rawWs;
    if (!/^\/[A-Za-z0-9._~/-]{1,64}$/.test(wsPath) || wsPath.includes("..")) {
      issues.push("WS_PATH: invalid path, ignoring");
      wsPath = "";
    }
  }

  const extraHosts = str("EXTRA_HOSTS")
    .split(/[,\s]+/)
    .map((value) => value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/[:/].*$/, "").replace(/\.$/, ""))
    .filter((value) => /^[a-z0-9.-]+$/.test(value) && !value.includes(".."));

  const carrierEnv = str("CARRIER").trim().toLowerCase();
  let carrier = CONFIG.carrier;
  if (carrierEnv === "websocket" || carrierEnv === "websocket-lanes" || carrierEnv === "auto") carrier = carrierEnv;
  else if (carrierEnv) issues.push(`CARRIER: unknown value "${carrierEnv.slice(0, 24)}", using default`);

  const upBatchBytes = num("UP_BATCH_BYTES", CONFIG.upBatchBytes, 16384, 1048576);
  const dataChunk = num("DATA_CHUNK", CONFIG.dataChunk, 16384, 262144);
  const maxQueued = num("MAX_QUEUED", CONFIG.maxQueued, 1048576, 67108864);
  const maxIsolateQueued = num("MAX_ISOLATE_QUEUED", CONFIG.maxIsolateQueued, 4194304, 134217728);

  let dcOverride = null;
  const rawOverride = str("DC_OVERRIDE").trim();
  if (rawOverride) {
    try {
      const parsed = JSON.parse(rawOverride);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("object expected");
      const clean = {};
      for (const [dcKey, ips] of Object.entries(parsed)) {
        const dcNum = parseInt(dcKey, 10);
        if (!Number.isInteger(dcNum) || dcNum < 1 || dcNum > 3000) throw new Error(`bad DC id ${dcKey}`);
        const list = (Array.isArray(ips) ? ips : [ips]).map((s) => String(s).trim()).filter(Boolean);
        if (!list.length) throw new Error(`DC ${dcKey}: empty list`);
        for (const ip of list) {
          if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip) && !/^[0-9a-fA-F:]{2,45}$/.test(ip)) throw new Error(`DC ${dcKey}: bad address ${ip.slice(0, 20)}`);
        }
        clean[dcNum] = list;
      }
      if (!Object.keys(clean).length) throw new Error("empty object");
      dcOverride = clean;
    } catch (e) {
      issues.push(`DC_OVERRIDE: invalid (${String(e.message).slice(0, 60)}), using built-in DC list`);
    }
  }

  const userSecretsRaw = str("USER_SECRETS").trim();
  let userLabels = [];
  if (userSecretsRaw) {
    userLabels = userSecretsRaw.split(",").map((s) => s.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "")).filter(Boolean).slice(0, USER_LABEL_MAX);
    if (!userLabels.length) issues.push("USER_SECRETS: set but no valid labels found (labels: a-z 0-9 _ -)");
    else if (new Set(userLabels).size !== userLabels.length) issues.push("USER_SECRETS: duplicate labels removed");
    userLabels = [...new Set(userLabels)];
  }

  const legacyPortSecrets = env?.LEGACY_PORT_SECRETS === "true" || env?.LEGACY_PORT_SECRETS === "1";

  return {
    secretHex, adminKey, keyEpoch, debug, decoyUrl, alertUrl, hostnames, extraHosts,
    maxStreams, bootstrapTtl, sessionTtl, sessionPath, wsPath, carrier,
    upBatchBytes, dataChunk, maxQueued, maxIsolateQueued,
    dc: CONFIG.dc, dcPort: CONFIG.dcPort, dcPorts: CONFIG.dcPorts,
    dcOverride, userLabels, legacyPortSecrets,
    issues, unknown: unknown.slice(0, 16),
    effectiveDc: dcOverride || CONFIG.dc
  };
}

export const USER_LABEL_MAX = 16;

export function dcList(cfg) {
  return cfg.effectiveDc;
}
