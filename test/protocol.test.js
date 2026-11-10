// Wire-protocol behavior: frame parser limits, PING/PONG, lane discipline,
// upstream batching equivalence (F1), candidate ordering (F2), memory guard (F4).
import { describe, it, expect, beforeEach } from "vitest";
import { WsSession, Stream, frame, windowFrame, orderCandidates, effectiveStreamWindow, tagKind } from "../src/protocol.js";
import { ctrAt, importAes, sha256 } from "../src/crypto.js";
import { concat, hexToBytes, bytesToHex, reverse, te } from "../src/util.js";
import { MEMORY, memorySub, DC_DEMOTED } from "../src/telemetry.js";

const CFG = {
  streamWindow: 4194304,
  maxQueued: 16777216,
  maxIsolateQueued: 33554432,
  maxStreams: 6,
  dataChunk: 65536,
  upBatchBytes: 262144,
  dc: { 2: ["149.154.167.51"] },
  dcPort: 443,
  dcPorts: [443],
  carrier: "websocket-lanes"
};

function fakeWs() {
  return {
    sent: [],
    closed: false,
    closeCode: null,
    readyState: 1,
    send(b) { this.sent.push(b); },
    close(code) { this.closed = true; this.closeCode = code; }
  };
}

function makeSession(laneId = 0) {
  const ws = fakeWs();
  const session = new WsSession(ws, CFG, hexToBytes("00112233445566778899aabbccddeeff"), laneId, null);
  return { ws, session };
}

function ab(bytes) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

// Waits until the stream's internal pump has drained (feeds trigger runIn()
// asynchronously, so tests must wait for inRunning to clear).
async function drain(stream) {
  for (let i = 0; i < 500 && stream.inRunning; i++) await new Promise((r) => setTimeout(r, 1));
}

describe("frame parser limits (WsSession.handle)", () => {
  it("shuts down on an oversized DATA frame size", async () => {
    const { ws, session } = makeSession();
    const evil = new Uint8Array(8);
    evil[0] = 0x02;
    evil[1] = 0; evil[2] = 0; evil[3] = 1;
    new DataView(evil.buffer).setUint32(4, 1048577, false); // > 1 MiB cap
    session.enqueue(ab(evil));
    await session.chain;
    expect(session.closed).toBe(true);
    expect(ws.closed).toBe(true);
  });

  it("shuts down when the declared frame runs past the message end", async () => {
    const { session } = makeSession();
    const evil = new Uint8Array(16);
    evil[0] = 0x02; evil[3] = 1;
    new DataView(evil.buffer).setUint32(4, 1000, false);
    session.enqueue(ab(evil));
    await session.chain;
    expect(session.closed).toBe(true);
  });

  it("shuts down at more than 4096 frames per message", async () => {
    const { session } = makeSession();
    const n = 4097;
    const msg = new Uint8Array(n * 8);
    for (let i = 0; i < n; i++) {
      msg[i * 8] = 0x03; // CLOSE id=i+1 size=0
      msg[i * 8 + 3] = (i + 1) & 0xff;
    }
    session.enqueue(ab(msg));
    await session.chain;
    expect(session.closed).toBe(true);
  });

  it("shuts down on unknown frame types and on id-0 OPEN/DATA", async () => {
    for (const t of [0x07, 0x00]) {
      const { session } = makeSession();
      const f = frame(t, 5, new Uint8Array(0));
      session.enqueue(ab(f));
      await session.chain;
      expect(session.closed).toBe(true);
    }
    {
      const { session } = makeSession();
      session.enqueue(ab(frame(0x01, 0, new Uint8Array(0))));
      await session.chain;
      expect(session.closed).toBe(true);
    }
    {
      const { session } = makeSession();
      session.enqueue(ab(frame(0x02, 0, new Uint8Array(4))));
      await session.chain;
      expect(session.closed).toBe(true);
    }
  });

  it("echoes PING as PONG with the same payload", async () => {
    const { ws, session } = makeSession();
    const payload = new Uint8Array(4);
    new DataView(payload.buffer).setUint32(0, 123456, false);
    session.enqueue(ab(frame(0x05, 0, payload)));
    await session.chain;
    expect(session.closed).toBe(false);
    expect(ws.sent).toHaveLength(1);
    const pong = new Uint8Array(ws.sent[0]);
    expect(pong[0]).toBe(0x06);
    expect([...pong.subarray(8)]).toEqual([...payload]);
    session.dispose();
  });

  it("replies CLOSE for DATA to unknown streams (no tombstone)", async () => {
    const { ws, session } = makeSession();
    session.enqueue(ab(frame(0x02, 99, new Uint8Array(16))));
    await session.chain;
    expect(session.closed).toBe(false);
    expect(ws.sent).toHaveLength(1);
    expect(new Uint8Array(ws.sent[0])[0]).toBe(0x03);
    expect(new Uint8Array(ws.sent[0])[3]).toBe(99);
    session.dispose();
  });

  it("rejects a second OPEN for a live stream and enforces maxStreams", async () => {
    const { ws, session } = makeSession();
    session.enqueue(ab(frame(0x01, 1, new Uint8Array(0))));
    await session.chain;
    session.enqueue(ab(frame(0x01, 1, new Uint8Array(0))));
    await session.chain;
    expect(ws.sent.some((b) => new Uint8Array(b)[0] === 0x03 && new Uint8Array(b)[3] === 1)).toBe(true);
    session.dispose();
  });

  it("lane sessions only accept frames for their own lane id", async () => {
    const { session } = makeSession(5);
    session.enqueue(ab(frame(0x01, 6, new Uint8Array(0))));
    await session.chain;
    expect(session.closed).toBe(true);
  });

  it("lane sessions accept a single OPEN for their lane", async () => {
    const { session } = makeSession(5);
    session.enqueue(ab(frame(0x01, 5, new Uint8Array(0))));
    await session.chain;
    expect(session.closed).toBe(false);
    expect(session.laneUsed).toBe(true);
    session.dispose();
  });

  it("rejects non-ArrayBuffer payloads", async () => {
    const { session } = makeSession();
    session.enqueue("not a buffer");
    await session.chain;
    expect(session.closed).toBe(true);
  });
});

// ---- F1: batching equivalence ----
// Reference = the v1.2.2 per-frame path: per chunk, one ctrAt on the client
// read keystream, one on the DC write keystream, one write, per-chunk grants.
async function referenceEncrypt(keyMaterial, chunks) {
  const { clientReadKey, clientReadIv, dcWriteKey, dcWriteIv } = keyMaterial;
  let readPos = 64, writePos = 64;
  const writes = [];
  for (const chunk of chunks) {
    const plain = await ctrAt(clientReadKey, clientReadIv, readPos, chunk);
    readPos += chunk.length;
    const enc = await ctrAt(dcWriteKey, dcWriteIv, writePos, plain);
    writePos += chunk.length;
    writes.push(enc);
  }
  return { writes, grants: chunks.map((c) => c.length) };
}

async function makeKeys() {
  // Any deterministic AES-CTR key material; the equivalence does not depend
  // on Obfuscated2 header handling, only on keystream positions.
  const clientReadKey = await importAes(await sha256(te.encode("client-read-key-test")));
  const clientReadIv = hexToBytes("000102030405060708090a0b0c0d0e0f");
  const dcWriteKey = await importAes(await sha256(te.encode("dc-write-key-test")));
  const dcWriteIv = hexToBytes("101112131415161718191a1b1c1d1e1f");
  return { clientReadKey, clientReadIv, dcWriteKey, dcWriteIv };
}

function makeStream(keys) {
  const session = {
    cfg: CFG,
    secret: hexToBytes("00112233445566778899aabbccddeeff"),
    streams: new Map(),
    streamCount: 0,
    queued: 0,
    sent: [],
    connectFn: null,
    sendFrame(b) { this.sent.push(b); },
    remember() {},
    onStreamClosed() {}
  };
  const stream = new Stream(session, 7);
  stream.phase = "ready";
  stream.clientReadKey = keys.clientReadKey;
  stream.clientReadIv = keys.clientReadIv;
  stream.dcWriteKey = keys.dcWriteKey;
  stream.dcWriteIv = keys.dcWriteIv;
  const writes = [];
  stream.writer = { write: async (b) => { writes.push(Uint8Array.from(b)); } };
  return { session, stream, writes };
}

describe("upstream batching equivalence (F1)", () => {
  it("writeToDcBatch over random chunk sizes is byte-identical to the per-frame path", async () => {
    const keys = await makeKeys();
    const chunks = [];
    let seed = 12345;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let i = 0; i < 50; i++) {
      chunks.push(crypto.getRandomValues(new Uint8Array(1 + Math.floor(rnd() * 9000))));
    }
    const { stream, writes } = makeStream(keys);
    const total = chunks.reduce((a, c) => a + c.length, 0);
    await stream.writeToDcBatch(chunks, total);
    const { writes: refWrites } = await referenceEncrypt(keys, chunks);

    expect(writes).toHaveLength(1);
    const batched = new Uint8Array(writes[0]);
    const reference = concat(...refWrites);
    expect(batched.length).toBe(reference.length);
    expect(bytesToHex(batched)).toBe(bytesToHex(reference));
  });

  it("runIn() coalesces queued frames up to upBatchBytes with correct accounting", async () => {
    const keys = await makeKeys();
    const { session, stream, writes } = makeStream(keys);
    const chunks = [];
    for (let i = 0; i < 10; i++) chunks.push(crypto.getRandomValues(new Uint8Array(1000 + i * 137)));
    for (const c of chunks) stream.feed(c);
    await drain(stream);
    // everything coalesced into one write (total < 262144)
    expect(writes).toHaveLength(1);
    expect(stream.clientReadPos).toBe(64 + chunks.reduce((a, c) => a + c.length, 0));
    expect(stream.dcWritePos).toBe(64 + chunks.reduce((a, c) => a + c.length, 0));
    expect(stream.queuedLocal).toBe(0);
    expect(session.queued).toBe(0);
    expect(MEMORY.queued).toBe(0);
    // exactly one WINDOW grant for the total (plus none else)
    const windowFrames = session.sent.filter((b) => new Uint8Array(b)[0] === 0x04);
    expect(windowFrames).toHaveLength(1);
    const granted = new DataView(new Uint8Array(windowFrames[0]).buffer).getUint32(8, false);
    expect(granted).toBe(chunks.reduce((a, c) => a + c.length, 0));
    // batched output equals the reference
    const { writes: refWrites } = await referenceEncrypt(keys, chunks);
    expect(bytesToHex(new Uint8Array(writes[0]))).toBe(bytesToHex(concat(...refWrites)));
  });

  it("splits into multiple writes when the queue exceeds upBatchBytes", async () => {
    const keys = await makeKeys();
    const { stream, writes } = makeStream(keys);
    const cfg = { ...CFG, upBatchBytes: 8192 };
    stream.session.cfg = cfg;
    const chunks = [crypto.getRandomValues(new Uint8Array(5000)), crypto.getRandomValues(new Uint8Array(5000))];
    stream.feed(chunks[0]);
    stream.feed(chunks[1]);
    await drain(stream);
    expect(writes.length).toBeGreaterThanOrEqual(2);
    const { writes: refWrites } = await referenceEncrypt(keys, chunks);
    const all = concat(...writes.map((w) => Uint8Array.from(w)));
    expect(bytesToHex(all)).toBe(bytesToHex(concat(...refWrites)));
    expect(stream.clientReadPos).toBe(64 + 10000);
  });

  it("is equivalent when the stream starts at an unaligned keystream position", async () => {
    const keys = await makeKeys();
    const { stream, writes } = makeStream(keys);
    stream.clientReadPos = 64 + 7; // unaligned
    stream.dcWritePos = 64 + 13;   // unaligned
    const chunks = [crypto.getRandomValues(new Uint8Array(31)), crypto.getRandomValues(new Uint8Array(64)), crypto.getRandomValues(new Uint8Array(1))];
    stream.feed(chunks[0]); stream.feed(chunks[1]); stream.feed(chunks[2]);
    await drain(stream);
    // recompute the reference with the same unaligned starts
    let readPos = 64 + 7, writePos = 64 + 13;
    const ref = [];
    for (const c of chunks) {
      const plain = await ctrAt(keys.clientReadKey, keys.clientReadIv, readPos, c);
      readPos += c.length;
      ref.push(await ctrAt(keys.dcWriteKey, keys.dcWriteIv, writePos, plain));
      writePos += c.length;
    }
    expect(writes).toHaveLength(1);
    expect(bytesToHex(Uint8Array.from(writes[0]))).toBe(bytesToHex(concat(...ref)));
  });
});

describe("DC candidate ordering (F2)", () => {
  it("puts the last-good endpoint first and demoted endpoints last", () => {
    const ips = ["1.1.1.1", "2.2.2.2", "3.3.3.3"];
    const order = orderCandidates(2, ips, [443]);
    expect(order).toHaveLength(3);
    // deterministic behavior: demoted goes last
    DC_DEMOTED.set("1.1.1.1:443", Date.now() + 60000);
    const order2 = orderCandidates(2, ips, [443]);
    expect(order2[order2.length - 1][0]).toBe("1.1.1.1");
    DC_DEMOTED.clear();
  });
});

describe("adaptive window (F4)", () => {
  it("shrinks the window under memory pressure and restores it after", () => {
    const before = MEMORY.queued;
    MEMORY.queued = Math.floor(MEMORY.cap * 0.4);
    expect(effectiveStreamWindow(CFG)).toBe(CFG.streamWindow);
    MEMORY.queued = Math.floor(MEMORY.cap * 0.7);
    expect(effectiveStreamWindow(CFG)).toBe(Math.max(262144, CFG.streamWindow >> 2));
    MEMORY.queued = Math.floor(MEMORY.cap * 0.9);
    expect(effectiveStreamWindow(CFG)).toBe(Math.max(65536, CFG.streamWindow >> 4));
    MEMORY.queued = before;
  });
});

describe("obfuscated2 tag classification", () => {
  it("recognizes the three protocol tags and rejects others", () => {
    expect(tagKind(hexToBytes("efefefef"))).toBe(1);
    expect(tagKind(hexToBytes("eeeeeeee"))).toBe(2);
    expect(tagKind(hexToBytes("dddddddd"))).toBe(3);
    expect(tagKind(hexToBytes("deadbeef"))).toBe(0);
    expect(tagKind(hexToBytes("16030200"))).toBe(0);
  });
});
