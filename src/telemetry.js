// In-isolate telemetry, bounded memory, privacy preserving.
// Never records client IPs, tokens or secrets. Resets on isolate recycle.
// F7 adds: possible-CPU/recycle indicator, per-DC connect latency EMA,
// global queued-bytes accounting used by the memory guard (F4).

export const ISOLATE_START = Date.now();

export const STATS = {
  sessions: 0,         // WebSocket proxy sessions created in this isolate
  sessionsActive: 0,   // currently open in this isolate
  streams: 0,          // MTProto streams opened in this isolate
  dcAttempts: 0,       // outbound TCP connects to Telegram DCs
  dcFails: 0,          // failed DC connects
  bytesUp: 0,          // client -> Telegram bytes (approximate)
  bytesDown: 0,        // Telegram -> client bytes (approximate)
  wsRejects: 0,        // WebSocket handshakes rejected (bad/expired token)
  panelViews: 0,
  statusViews: 0,
  cpuSuspect: 0,       // sessions killed by an abrupt socket event (see note in /status)
  alerted: 0           // optional webhook alerts sent (only when ALERT_URL is set)
};

// Per-DC connect latency (ms), exponential moving average, used for IP ordering.
export const DC_EMA = Object.create(null);   // dcKey -> ms
// Last-known-good {ip, port, at, demotedUntil} per DC+port, per isolate (F2a).
export const DC_LAST_GOOD = new Map();       // dcKey -> {ip, port, at}
export const DC_DEMOTED = new Map();         // "ip:port" -> demotedUntil (ms epoch)
export const DC_DEMOTE_MS = 60000;

// R1: ephemeral per-user session counters (isolate memory only, label -> count).
export const USER_SESSIONS = Object.create(null);

// F4: isolate-wide queued-bytes guard (all sessions share the 128 MB isolate).
export const MEMORY = {
  queued: 0,
  cap: 33554432,
  get pressure() { return this.cap > 0 ? this.queued / this.cap : 0; }
};

export function memoryAdd(bytes) { MEMORY.queued += bytes; }
export function memorySub(bytes) { MEMORY.queued = Math.max(0, MEMORY.queued - bytes); }

const LOG = [];
const LOG_LIMIT = 120;

export function logEvent(event, detail) {
  try {
    LOG.push({ t: Date.now(), event: String(event).slice(0, 24), detail: String(detail || "").slice(0, 120) });
    if (LOG.length > LOG_LIMIT) LOG.splice(0, LOG.length - LOG_LIMIT);
  } catch (_) { /* logging must never throw */ }
}

export function logSnapshot(limit = 60) {
  return LOG.slice(-limit).reverse();
}

// Coarse GLOBAL login throttle (S3): no IP storage, isolate-wide backoff.
// After ADMIN_FAIL_THRESHOLD consecutive failures the whole admin surface is
// locked with doubling delay up to ADMIN_LOCK_MAX_MS. Deliberately coarse:
// a distributed probe can lock everyone out of THIS isolate's panel, but it
// never reveals whether a key exists and costs the attacker nothing to us.
export const LOGIN_GATE = {
  fails: 0,
  lockedUntil: 0,
  threshold: 5,
  baseLockMs: 30000,
  maxLockMs: 900000
};

export function loginLocked(now = Date.now()) {
  return now < LOGIN_GATE.lockedUntil;
}

export function loginFailure(now = Date.now()) {
  LOGIN_GATE.fails += 1;
  if (LOGIN_GATE.fails >= LOGIN_GATE.threshold) {
    const over = LOGIN_GATE.fails - LOGIN_GATE.threshold;
    const lock = Math.min(LOGIN_GATE.baseLockMs * (2 ** Math.min(over, 10)), LOGIN_GATE.maxLockMs);
    LOGIN_GATE.lockedUntil = now + lock;
  }
}

export function loginSuccess() {
  LOGIN_GATE.fails = 0;
  LOGIN_GATE.lockedUntil = 0;
}

export function loginLockRemaining(now = Date.now()) {
  return Math.max(0, LOGIN_GATE.lockedUntil - now);
}
