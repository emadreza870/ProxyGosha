// Wire protocol: frame codec, Obfuscated2 MTProto stream, WebSocket session.
// The tproxy wire protocol is UNCHANGED (constraint 3): frame types
// OPEN 0x01 / DATA 0x02 / CLOSE 0x03 / WINDOW 0x04 / PING 0x05 / PONG 0x06,
// 8-byte frame header, tproxy-v1.<token> / tproxy-lane-v1.<token>.<id>
// subprotocols and the /api handshake bytes stay byte-exact.
// `connect` (cloudflare:sockets) is injected by the entry point so this module
// stays unit-testable outside workerd.
import { sha256, importAes, ctrAt } from "./crypto.js";
import { concat, reverse, fmtDuration, fmtBytes } from "./util.js";
import { REQUEST_LIMIT } from "./version.js";
import { STATS, DC_EMA, DC_LAST_GOOD, DC_DEMOTED, DC_DEMOTE_MS, logEvent, memoryAdd, memorySub, MEMORY } from "./telemetry.js";
import { maybeAlert } from "./alerts.js";

export const EMPTY = new Uint8Array(0);
export const WELCOME = new Uint8Array([0x11, 0, 0, 0, 0, 0, 0, 0]);

export function frame(type, id, payload) {
  const out = new Uint8Array(8 + payload.length);
  out[0] = type;
  out[1] = (id >>> 16) & 0xff;
  out[2] = (id >>> 8) & 0xff;
  out[3] = id & 0xff;
  new DataView(out.buffer).setUint32(4, payload.length, false);
  out.set(payload, 8);
  return out;
}

export function windowFrame(id, amount) {
  const payload = new Uint8Array(4);
  new DataView(payload.buffer).setUint32(0, amount, false);
  return frame(0x04, id, payload);
}

export function tagKind(tag) {
  if (tag[0] === 0xef && tag[1] === 0xef && tag[2] === 0xef && tag[3] === 0xef) return 1; // abridged
  if (tag[0] === 0xee && tag[1] === 0xee && tag[2] === 0xee && tag[3] === 0xee) return 2; // intermediate
  if (tag[0] === 0xdd && tag[1] === 0xdd && tag[2] === 0xdd && tag[3] === 0xdd) return 3; // padded intermediate
  return 0;
}

export function safeDcHeaderPrefix(bytes) {
  if (bytes[0] === 0xef) return false;
  if (bytes[4] === 0 && bytes[5] === 0 && bytes[6] === 0 && bytes[7] === 0) return false;
  if (bytes[0] === 0x47 && bytes[1] === 0x45 && bytes[2] === 0x54 && bytes[3] === 0x20) return false; // "GET "
  if (bytes[0] === 0x50 && bytes[1] === 0x4f && bytes[2] === 0x53 && bytes[3] === 0x54) return false; // "POST"
  if (bytes[0] === 0x48 && bytes[1] === 0x45 && bytes[2] === 0x41 && bytes[3] === 0x44) return false; // "HEAD"
  if (bytes[0] === 0x4f && bytes[1] === 0x50 && bytes[2] === 0x54 && bytes[3] === 0x49) return false; // "OPTI"
  if (bytes[0] === 0xee && bytes[1] === 0xee && bytes[2] === 0xee && bytes[3] === 0xee) return false;
  if (bytes[0] === 0xdd && bytes[1] === 0xdd && bytes[2] === 0xdd && bytes[3] === 0xdd) return false;
  if (bytes[0] === 0x16 && bytes[1] === 0x03 && bytes[2] === 0x01 && bytes[3] === 0x02) return false;
  return true;
}

// ---- F2: DC endpoint selection with per-isolate last-good memory ----
function ipDemoted(ip, port, now = Date.now()) {
  const until = DC_DEMOTED.get(ip + ":" + port);
  return typeof until === "number" && until > now;
}

export function orderCandidates(dcKey, ips, ports, now = Date.now()) {
  const attempts = [];
  for (const port of ports) for (const ip of ips) attempts.push([ip, port]);
  // Random shuffle spreads load across front-ends...
  for (let i = attempts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [attempts[i], attempts[j]] = [attempts[j], attempts[i]];
  }
  // ...then last-good (not demoted) jumps the queue...
  const last = DC_LAST_GOOD.get(dcKey);
  if (last && !ipDemoted(last.ip, last.port, now)) {
    const idx = attempts.findIndex(([ip, port]) => ip === last.ip && port === last.port);
    if (idx > 0) attempts.unshift(attempts.splice(idx, 1)[0]);
  }
  // ...and demoted endpoints go last.
  attempts.sort((a, b) => Number(ipDemoted(a[0], a[1], now)) - Number(ipDemoted(b[0], b[1], now)));
  return attempts;
}

// Staggered parallel connect (F2b): attempt 1 immediately, attempt 2 after
// STAGGER_MS, max 2 in flight, first success wins, losers always closed.
// Worst case ~ STAGGER_MS + TIMEOUT_MS, far below the v1.2.2 sequential worst
// case. Each connect() is one subrequest (max 3 used here of 50) and at most 2
// sockets occupy the 6 "connecting" slots.
const CONNECT_TIMEOUT_MS = 3000;
const CONNECT_STAGGER_MS = 400;

async function connectOnce(connectFn, ip, port, timeoutMs) {
  const socket = connectFn({ hostname: ip, port }, { secureTransport: "off" });
  socket.closed.catch(() => {});
  let timer = null;
  try {
    await Promise.race([
      socket.opened,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("connect timeout")), timeoutMs); })
    ]);
    return socket;
  } catch (e) {
    try { socket.close().catch(() => {}); } catch (_) {}
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function connectDc(connectFn, dcKey, ips, ports) {
  const candidates = orderCandidates(dcKey, ips, ports).slice(0, 3);
  const started = Date.now();
  let firstError = null;
  let inFlight = 0;

  return await new Promise((resolve) => {
    let settled = false;
    let launched = 0;
    const finish = (socket, err) => {
      if (settled) return;
      settled = true;
      if (socket) {
        DC_LAST_GOOD.set(dcKey, { ip: socket._pgIp, port: socket._pgPort, at: Date.now() });
        const ms = Date.now() - started;
        DC_EMA[dcKey] = DC_EMA[dcKey] === undefined ? ms : Math.round(DC_EMA[dcKey] * 0.7 + ms * 0.3);
        resolve(socket);
      } else {
        resolve(null);
      }
    };
    const launch = () => {
      if (settled || launched >= candidates.length) return;
      const [ip, port] = candidates[launched++];
      inFlight++;
      STATS.dcAttempts++;
      connectOnce(connectFn, ip, port, CONNECT_TIMEOUT_MS).then((socket) => {
        inFlight--;
        if (settled) { try { socket.close().catch(() => {}); } catch (_) {} return; }
        socket._pgIp = ip; socket._pgPort = port;
        finish(socket, null);
      }).catch((err) => {
        inFlight--;
        DC_DEMOTED.set(ip + ":" + port, Date.now() + DC_DEMOTE_MS);
        STATS.dcFails++;
        if (!firstError) firstError = err;
        if (inFlight === 0 && launched >= candidates.length) finish(null, firstError);
        else if (launched < candidates.length) launch();
      });
    };
    launch();
    if (candidates.length > 1) setTimeout(() => { if (!settled && inFlight > 0 && launched < candidates.length) launch(); }, CONNECT_STAGGER_MS);
  });
}

// ---- adaptive window (F4): shrink stream credit while the isolate is stressed ----
export function effectiveStreamWindow(cfg) {
  const pressure = MEMORY.pressure; // 0..1 of isolate queue cap
  if (pressure < 0.5) return cfg.streamWindow;
  if (pressure < 0.8) return Math.max(262144, cfg.streamWindow >> 2);
  return Math.max(65536, cfg.streamWindow >> 4);
}

export class Stream {
  constructor(session, id) {
    this.session = session;
    this.id = id;
    STATS.streams++;
    session.streamCount++;
    this.phase = "header";
    this.header = new Uint8Array(64);
    this.headerLength = 0;
    this.dead = false;
    this.socket = null;
    this.writer = null;
    this.reader = null;
    this.inQueue = [];
    this.inRunning = false;
    this.queuedLocal = 0;
    this.recvOutstanding = 0;
    this.sendCredit = effectiveStreamWindow(session.cfg);
    this.creditResolve = null;
    this.clientReadKey = null;
    this.clientReadIv = null;
    this.clientWriteKey = null;
    this.clientWriteIv = null;
    this.dcWriteKey = null;
    this.dcWriteIv = null;
    this.dcReadKey = null;
    this.dcReadIv = null;
    this.clientReadPos = 64;
    this.clientWritePos = 0;
    this.dcWritePos = 64;
    this.dcReadPos = 0;
  }

  // F3: avoid the per-frame copy when the payload already owns its whole
  // underlying buffer (single-frame message). Subarrays sharing a larger
  // message buffer are still copied, so no whole-batch ArrayBuffer is pinned.
  feed(payload) {
    if (this.dead || !payload.length) return;
    this.recvOutstanding += payload.length;
    if (this.recvOutstanding > this.session.cfg.streamWindow + 65536) {
      this.kill(true);
      return;
    }
    const ownsBuffer = payload.byteOffset === 0 && payload.byteLength === payload.buffer.byteLength;
    const stored = ownsBuffer ? payload : payload.slice();
    this.inQueue.push(stored);
    this.queuedLocal += stored.length;
    this.session.queued += stored.length;
    memoryAdd(stored.length);
    if (MEMORY.queued > this.session.cfg.maxIsolateQueued || this.session.queued > this.session.cfg.maxQueued) {
      logEvent("mem_guard", `isolate=${Math.round(MEMORY.queued / 1048576)}MB session=${Math.round(this.session.queued / 1048576)}MB`);
      this.kill(true);
      return;
    }
    this.runIn();
  }

  async runIn() {
    if (this.inRunning || this.dead) return;
    this.inRunning = true;
    try {
      // Yield one microtask so every frame of the current WebSocket message
      // (fed synchronously by handle()) is already queued when the first
      // batch is pulled — this is what makes upstream coalescing effective.
      await Promise.resolve();
      while (!this.dead && this.inQueue.length) {
        let payload = this.inQueue[0];
        if (this.phase === "header") {
          const need = 64 - this.headerLength;
          const take = Math.min(need, payload.length);
          this.header.set(payload.subarray(0, take), this.headerLength);
          this.headerLength += take;
          payload = payload.subarray(take);
          this.takeAccounting(take);
          if (payload.length) this.inQueue[0] = payload;
          else this.inQueue.shift();
          if (this.headerLength === 64) {
            await this.init();
            this.grant(64);
          }
          continue;
        }
        // F1: real upstream coalescing. Concatenate queued payloads up to
        // upBatchBytes, run ctrAt twice over the batch, write once, grant once.
        this.inQueue.shift();
        let total = payload.length;
        const batch = [payload];
        const limit = this.session.cfg.upBatchBytes;
        while (this.inQueue.length && total < limit) {
          const next = this.inQueue[0];
          if (total + next.length > limit) break;
          batch.push(next);
          total += next.length;
          this.inQueue.shift();
        }
        this.takeAccounting(total);
        await this.writeToDcBatch(batch, total);
      }
    } catch (e) {
      logEvent("stream_err", e && e.name ? e.name : "unknown");
      this.kill(true);
    } finally {
      this.inRunning = false;
      if (!this.dead && this.inQueue.length) this.runIn();
    }
  }

  takeAccounting(bytes) {
    this.queuedLocal -= bytes;
    this.session.queued = Math.max(0, this.session.queued - bytes);
    memorySub(bytes);
  }

  async init() {
    const header = this.header;
    const readKey = await sha256(concat(header.subarray(8, 40), this.session.secret));
    const readIv = header.slice(40, 56);
    this.clientReadKey = await importAes(readKey);
    this.clientReadIv = readIv;
    const tail = await ctrAt(this.clientReadKey, readIv, 56, header.subarray(56, 64));
    const tag = tail.subarray(0, 4);
    if (!tagKind(tag)) throw new Error("bad tag");
    const dcId = new DataView(tail.buffer, tail.byteOffset + 4, 2).getInt16(0, true);
    const dcKey = Math.abs(dcId);
    const address = this.session.cfg.dc[dcKey];
    if (!address) throw new Error("bad dc");

    const candidateIps = Array.isArray(address) ? address : [address];
    const candidatePorts = Array.isArray(this.session.cfg.dcPorts) ? this.session.cfg.dcPorts : [this.session.cfg.dcPort || 443];

    const reversed = reverse(header.subarray(8, 56));
    const writeKey = await sha256(concat(reversed.subarray(0, 32), this.session.secret));
    const clientWriteIv = reversed.slice(32, 48);

    // FAST MODE: choose the DC obfuscation material so the DC encrypts with
    // exactly the keystream the client expects; DC->client bytes are forwarded
    // untouched (zero re-encryption on the heavy download direction).
    const dcKeyMaterial = reverse(concat(writeKey, clientWriteIv)); // 48 bytes
    this.dcWriteKey = await importAes(dcKeyMaterial.slice(0, 32));
    this.dcWriteIv = dcKeyMaterial.slice(32, 48);
    if (this.dead) return;
    this.clientReadPos = 64;
    this.clientWritePos = 0;
    this.dcWritePos = 64;
    this.dcReadPos = 0;

    const socket = await connectDc(this.session.connectFn, dcKey, candidateIps, candidatePorts);
    if (!socket) {
      logEvent("dc_fail", `dc=${dcKey}`);
      maybeAlert(this.session.cfg, "dc_fail", "dc=" + dcKey);
      throw new Error("failed to connect to DC");
    }
    this.socket = socket;
    if (this.dead) {
      try { await socket.close(); } catch (_) {}
      return;
    }
    this.writer = socket.writable.getWriter();
    this.reader = socket.readable.getReader();

    const dcHeader = new Uint8Array(64);
    let safe = false;
    for (let i = 0; i < 16 && !safe; i++) {
      crypto.getRandomValues(dcHeader.subarray(0, 8));
      safe = safeDcHeaderPrefix(dcHeader);
    }
    if (!safe) dcHeader.set([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0], 0);
    dcHeader.set(dcKeyMaterial, 8);
    dcHeader.set(tag, 56);
    const dcView = new DataView(dcHeader.buffer);
    dcView.setInt16(60, dcId, true);
    dcView.setUint16(62, 0, true);
    const encryptedTail = await ctrAt(this.dcWriteKey, this.dcWriteIv, 56, dcHeader.subarray(56, 64));
    dcHeader.set(encryptedTail, 56);
    await this.writer.write(dcHeader);
    if (this.dead) return;
    this.phase = "ready";
    this.pump().catch(() => this.kill(true));
  }

  // F1: byte-identical to the old per-frame path (proven by test): one ctrAt
  // over clientRead keystream, one over dcWrite keystream, one write, one
  // WINDOW grant for the total.
  async writeToDcBatch(batch, total) {
    if (this.dead || !total) return;
    let plain;
    if (batch.length === 1) {
      plain = await ctrAt(this.clientReadKey, this.clientReadIv, this.clientReadPos, batch[0]);
    } else {
      const joined = new Uint8Array(total);
      let offset = 0;
      for (const part of batch) { joined.set(part, offset); offset += part.length; }
      plain = await ctrAt(this.clientReadKey, this.clientReadIv, this.clientReadPos, joined);
    }
    this.clientReadPos += total;
    if (this.dead) return;
    const encrypted = await ctrAt(this.dcWriteKey, this.dcWriteIv, this.dcWritePos, plain);
    this.dcWritePos += total;
    await this.writer.write(encrypted);
    this.grant(total);
  }

  async pump() {
    const reader = this.reader;
    try {
      while (!this.dead) {
        if (this.sendCredit <= 0) {
          await this.waitCredit();
          continue;
        }
        const result = await reader.read();
        if (result.done) break;
        const value = result.value;
        let offset = 0;
        while (offset < value.length && !this.dead) {
          if (this.sendCredit <= 0) {
            await this.waitCredit();
            continue;
          }
          const size = Math.min(value.length - offset, this.sendCredit, this.session.cfg.dataChunk);
          if (size <= 0) continue;
          // Fast mode: bytes from the DC are already encrypted for the client.
          const chunk = value.subarray(offset, offset + size);
          this.sendCredit -= size;
          this.session.sendFrame(frame(0x02, this.id, chunk));
          offset += size;
        }
      }
    } catch (_) {}
    this.kill(true);
  }

  waitCredit() {
    if (this.dead || this.sendCredit > 0) return Promise.resolve();
    return new Promise((resolve) => {
      this.creditResolve = resolve;
    });
  }

  addCredit(amount) {
    if (this.dead) return;
    this.sendCredit = Math.min(0xffffffff, this.sendCredit + amount);
    if (this.creditResolve) {
      const resolve = this.creditResolve;
      this.creditResolve = null;
      resolve();
    }
  }

  grant(amount) {
    if (this.dead || amount <= 0) return;
    this.recvOutstanding = Math.max(0, this.recvOutstanding - amount);
    this.session.sendFrame(windowFrame(this.id, amount));
  }

  kill(notify) {
    if (this.dead) return;
    this.dead = true;
    this.session.streams.delete(this.id);
    this.session.remember(this.id);
    this.session.queued = Math.max(0, this.session.queued - this.queuedLocal);
    memorySub(this.queuedLocal);
    this.queuedLocal = 0;
    this.inQueue.length = 0;
    if (this.creditResolve) {
      const resolve = this.creditResolve;
      this.creditResolve = null;
      resolve();
    }
    if (this.writer) {
      try { this.writer.releaseLock(); } catch (_) {}
      this.writer = null;
    }
    if (this.reader) {
      try { this.reader.cancel().catch(() => {}); this.reader.releaseLock(); } catch (_) {}
      this.reader = null;
    }
    if (this.socket) {
      try { this.socket.close().catch(() => {}); } catch (_) {}
      this.socket = null;
    }
    if (notify && !this.session.closed) this.session.sendFrame(frame(0x03, this.id, EMPTY));
    this.session.onStreamClosed(this.id);
  }
}

export class WsSession {
  constructor(ws, cfg, secret, laneId = 0, connectFn = null) {
    this.laneId = laneId;
    this.laneUsed = false;
    this.ws = ws;
    this.cfg = cfg;
    this.secret = secret;
    this.connectFn = connectFn;
    this.streams = new Map();
    this.closed = false;
    this.queued = 0;
    this.tombstones = new Set();
    this.tombstoneOrder = [];
    this.chain = Promise.resolve();
    this.lastPong = Date.now();
    this.openedAt = Date.now();
    this.bytesUp = 0;
    this.bytesDown = 0;
    this.streamCount = 0;
    STATS.sessions++;
    STATS.sessionsActive++;
    logEvent("session_open", `lane=${laneId} carrier=${cfg.carrierResolved || cfg.carrier}`);

    this.keepAliveTimer = laneId ? null : setInterval(() => {
      if (this.closed || !this.ws || this.ws.readyState !== 1) {
        if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
        return;
      }
      if (Date.now() - this.lastPong > 90000) {
        this.shutdown("pong watchdog");
        return;
      }
      try {
        const pingPayload = new Uint8Array(4);
        new DataView(pingPayload.buffer).setUint32(0, Math.floor(Date.now() / 1000), false);
        this.sendFrame(frame(0x05, 0, pingPayload));
      } catch (_) {}
    }, 25000);
  }

  sendFrame(bytes) {
    if (this.closed) return;
    try {
      this.ws.send(bytes);
      this.bytesDown += bytes.length;
      STATS.bytesDown += bytes.length;
    } catch (_) {
      this.dispose();
    }
  }

  onStreamClosed(id) {
    if (!this.laneId || this.closed || id !== this.laneId) return;
    this.dispose();
    try { if (this.ws.readyState === 1) this.ws.close(1000, "done"); } catch (_) {}
  }

  remember(id) {
    if (this.tombstones.has(id)) return;
    if (this.tombstoneOrder.length === 4096) this.tombstones.delete(this.tombstoneOrder.shift());
    this.tombstones.add(id);
    this.tombstoneOrder.push(id);
  }

  enqueue(data) {
    this.chain = this.chain.then(() => this.handle(data)).catch((e) => {
      if (e && e.name) logEvent("session_err", e.name);
      this.shutdown();
    });
  }

  async handle(data) {
    if (this.closed) return;
    if (!(data instanceof ArrayBuffer)) {
      this.shutdown();
      return;
    }
    const bytes = new Uint8Array(data);
    if (bytes.length === 0 || bytes.length > REQUEST_LIMIT) {
      this.shutdown();
      return;
    }
    this.bytesUp += bytes.length;
    STATS.bytesUp += bytes.length;
    const view = new DataView(data);
    let offset = 0;
    let frames = 0;
    while (offset < bytes.length) {
      if (bytes.length - offset < 8 || ++frames > 4096) {
        this.shutdown();
        return;
      }
      const type = bytes[offset];
      const id = (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
      const size = view.getUint32(offset + 4, false);
      const end = offset + 8 + size;
      if (size > 1048576 || end > bytes.length) {
        this.shutdown();
        return;
      }
      const payload = bytes.subarray(offset + 8, end);
      offset = end;
      if (this.laneId && id !== this.laneId) {
        this.shutdown();
        return;
      }
      if (type === 0x01) {
        // OPEN frame
        if (id === 0 || size !== 0) {
          this.shutdown();
          return;
        }
        if (this.laneId) {
          if (this.laneUsed) { this.shutdown(); return; }
          this.laneUsed = true;
          this.streams.set(id, new Stream(this, id));
          continue;
        }
        if (this.streams.has(id) || this.tombstones.has(id) || this.streams.size >= this.cfg.maxStreams) {
          this.sendFrame(frame(0x03, id, EMPTY));
          continue;
        }
        this.streams.set(id, new Stream(this, id));
      } else if (type === 0x02) {
        // DATA frame
        if (id === 0 || size === 0) {
          this.shutdown();
          return;
        }
        const stream = this.streams.get(id);
        if (stream) stream.feed(payload);
        else if (!this.tombstones.has(id)) this.sendFrame(frame(0x03, id, EMPTY));
      } else if (type === 0x03) {
        // CLOSE frame
        if (id === 0 || size !== 0) {
          this.shutdown();
          return;
        }
        const stream = this.streams.get(id);
        if (stream) stream.kill(false);
      } else if (type === 0x04) {
        // WINDOW frame (credit grant)
        if (id === 0 || size !== 4) {
          this.shutdown();
          return;
        }
        const stream = this.streams.get(id);
        if (stream) stream.addCredit(new DataView(payload.buffer, payload.byteOffset, 4).getUint32(0, false));
      } else if (type === 0x05) {
        // PING frame from client -> PONG echo (max 4-byte payload to keep the
        // proxy from being usable as a reflection amplifier).
        if (id === 0) {
          if (size > 64) {
            this.shutdown();
            return;
          }
          this.sendFrame(frame(0x06, 0, payload));
        }
      } else if (type === 0x06) {
        // PONG from client (keepalive acknowledgment)
        if (id !== 0) {
          this.shutdown();
          return;
        }
        this.lastPong = Date.now();
      } else {
        this.shutdown();
        return;
      }
    }
  }

  dispose() {
    if (this.closed) return;
    this.closed = true;
    STATS.sessionsActive = Math.max(0, STATS.sessionsActive - 1);
    logEvent("session_close", `${fmtDuration(Date.now() - this.openedAt)} streams=${this.streamCount} up=${fmtBytes(this.bytesUp)} down=${fmtBytes(this.bytesDown)}`);
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    for (const stream of Array.from(this.streams.values())) stream.kill(false);
    this.streams.clear();
    this.tombstones.clear();
    this.tombstoneOrder.length = 0;
    this.queued = 0;
  }

  shutdown(reason) {
    logEvent("session_kill", reason || "protocol");
    if (reason === "pong watchdog") maybeAlert(this.cfg, "session_kill", reason);
    this.dispose();
    try {
      if (this.ws.readyState === 1) this.ws.close(1011, "closed");
    } catch (_) {}
  }
}
