// KDF + token engine + capability verification, incl. GOLDEN values proving a
// legacy (ADMIN_KEY-only) deployment derives byte-identical secrets/links with
// v1.2.2 (acceptance criterion).
import { describe, it, expect } from "vitest";
import { resolveConfig } from "../src/config.js";
import { buildRuntime, issueToken, verifyToken, issueCookie, verifyCookie, bridgeMode, modeSecret, COOKIE_NAME, COOKIE_TTL, derivePaths, deriveUserSecrets } from "../src/kdf.js";
import { PORT_MODE_BASE, USER_MODE_BASE, TOKEN_KIND_SESSION, TOKEN_KIND_BOOTSTRAP } from "../src/version.js";
import { hmacSign, importHmac } from "../src/crypto.js";
import { te, bytesToHex, hexToBytes, concat } from "../src/util.js";

const LEGACY_ADMIN = "golden-test-key-0123456789";
const GOLDEN_BASE = "dd2c77f9481e17ccfe6ecddefe4dcdb191";
const GOLDEN_PORT_2053 = "dde5676b6b0ac58489f5b3015623b9a2b3";
const GOLDEN_CAP_HOST = "tg.example.com";
const GOLDEN_CAP = "SGAgW_uC1SYI2yeWTDU7SUmGPnGyDVtaCDNl0wuTGcw";
const FIXED_SECRET = "00112233445566778899aabbccddeeff";

const HOST = "tg.example.com";

async function runtime(env) {
  return buildRuntime(resolveConfig(env));
}

// The capability the Telegram client computes: HMAC(secret, context).
async function capabilityFor(secretBytes, context) {
  const mac = await hmacSign(await importHmac(secretBytes, ["sign"]), te.encode("tdesktop-web-proxy-bridge-v1\n" + context));
  let text = "";
  for (const b of mac) text += String.fromCharCode(b);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

describe("legacy golden values (v1.2.2 compatibility)", () => {
  it("derives the byte-identical base secret from ADMIN_KEY alone", async () => {
    const rt = await runtime({ ADMIN_KEY: LEGACY_ADMIN });
    expect(rt.secretDerived).toBe(true);
    expect(rt.baseHex).toBe(GOLDEN_BASE);
  });

  it("derives the byte-identical per-port secrets", async () => {
    const rt = await runtime({ ADMIN_KEY: LEGACY_ADMIN });
    expect(rt.portSecrets[2053].secretHex).toBe(GOLDEN_PORT_2053);
    expect(rt.portSecrets[443].secretHex).toBe(GOLDEN_BASE);
  });

  it("SECRET-based (new mode) deployments do not depend on ADMIN_KEY", async () => {
    const a = await runtime({ SECRET: FIXED_SECRET, ADMIN_KEY: "some-other-admin-key-entirely-99" });
    const b = await runtime({ SECRET: FIXED_SECRET });
    expect(a.baseHex).toBe("dd" + FIXED_SECRET);
    expect(b.baseHex).toBe("dd" + FIXED_SECRET);
    expect(a.secretDerived).toBe(false);
    expect(a.baseHex).toBe(b.baseHex);
  });
});

describe("token engine (S4: host binding, KEY_EPOCH, TTL)", () => {
  it("issues and verifies a session token", async () => {
    const rt = await runtime({ SECRET: FIXED_SECRET });
    const tok = await issueToken(rt, TOKEN_KIND_SESSION, 3600, 0, HOST);
    const v = await verifyToken(rt, tok, TOKEN_KIND_SESSION, HOST);
    expect(v).not.toBeNull();
    expect(v.mode).toBe(0);
  });

  it("rejects a valid token presented for a different host", async () => {
    const rt = await runtime({ SECRET: FIXED_SECRET });
    const tok = await issueToken(rt, TOKEN_KIND_SESSION, 3600, 0, HOST);
    expect(await verifyToken(rt, tok, TOKEN_KIND_SESSION, "evil.example.net")).toBeNull();
  });

  it("rejects expired tokens and wrong kinds", async () => {
    const rt = await runtime({ SECRET: FIXED_SECRET });
    const expired = await issueToken(rt, TOKEN_KIND_SESSION, -10, 0, HOST);
    expect(await verifyToken(rt, expired, TOKEN_KIND_SESSION, HOST)).toBeNull();
    const ok = await issueToken(rt, TOKEN_KIND_BOOTSTRAP, 3600, 0, HOST);
    expect(await verifyToken(rt, ok, TOKEN_KIND_SESSION, HOST)).toBeNull();
  });

  it("KEY_EPOCH mass-revokes previously issued tokens", async () => {
    const rtA = await runtime({ SECRET: FIXED_SECRET, KEY_EPOCH: "1" });
    const rtB = await runtime({ SECRET: FIXED_SECRET, KEY_EPOCH: "2" });
    const tok = await issueToken(rtA, TOKEN_KIND_SESSION, 3600, 0, HOST);
    expect(await verifyToken(rtA, tok, TOKEN_KIND_SESSION, HOST)).not.toBeNull();
    expect(await verifyToken(rtB, tok, TOKEN_KIND_SESSION, HOST)).toBeNull();
    expect(rtA.keyEpochFingerprint).not.toBe(rtB.keyEpochFingerprint);
  });

  it("mangles garbage tokens safely", async () => {
    const rt = await runtime({ SECRET: FIXED_SECRET });
    for (const bad of ["", "abc", "!!!!", "AAAA".repeat(20), "a", ".."]) {
      expect(await verifyToken(rt, bad, TOKEN_KIND_SESSION, HOST)).toBeNull();
    }
  });
});

describe("admin cookie (S3)", () => {
  it("round-trips for the issuing host only", async () => {
    const rt = await runtime({ SECRET: FIXED_SECRET, ADMIN_KEY: "admin-key-for-tests-123456" });
    const { value, maxAge } = await issueCookie(rt, HOST);
    expect(maxAge).toBe(COOKIE_TTL);
    expect(await verifyCookie(rt, HOST, value)).toBe(true);
    expect(await verifyCookie(rt, "other.example.com", value)).toBe(false);
  });

  it("rejects expired and malformed cookies", async () => {
    const rt = await runtime({ SECRET: FIXED_SECRET, ADMIN_KEY: "admin-key-for-tests-123456" });
    const now = Date.now();
    const { value } = await issueCookie(rt, HOST, now);
    expect(await verifyCookie(rt, HOST, value, now + (COOKIE_TTL + 5) * 1000)).toBe(false);
    expect(await verifyCookie(rt, HOST, "garbage")).toBe(false);
    expect(await verifyCookie(rt, HOST, "123.x")).toBe(false);
  });
});

describe("bridgeMode (S5 strict isolation + golden capability + R1 users)", () => {
  it("accepts the v1.2.2 golden capability on 443 with mode 10", async () => {
    const rt = await runtime({ ADMIN_KEY: LEGACY_ADMIN });
    expect(await bridgeMode(rt, GOLDEN_CAP_HOST, GOLDEN_CAP, "")).toBe(PORT_MODE_BASE);
  });

  it("strict: a 443 capability is rejected on other ports", async () => {
    const rt = await runtime({ ADMIN_KEY: LEGACY_ADMIN });
    expect(await bridgeMode(rt, GOLDEN_CAP_HOST, GOLDEN_CAP, "2053")).toBe(-1);
    expect(await bridgeMode(rt, GOLDEN_CAP_HOST, GOLDEN_CAP, "8443")).toBe(-1);
  });

  it("strict: each port accepts only its own secret (padded and bare forms)", async () => {
    const rt = await runtime({ ADMIN_KEY: LEGACY_ADMIN });
    const cap443 = await capabilityFor(rt.portSecrets[443].secret, HOST);
    const dd443 = concat(Uint8Array.of(0xdd), rt.portSecrets[443].secret);
    const cap443dd = await capabilityFor(dd443, HOST);
    const cap2053 = await capabilityFor(rt.portSecrets[2053].secret, `${HOST}:2053`);
    const cap2053bare = await capabilityFor(rt.portSecrets[2053].secret, HOST);
    expect(await bridgeMode(rt, HOST, cap443, "")).toBe(PORT_MODE_BASE);
    expect(await bridgeMode(rt, HOST, cap443dd, "")).toBe(PORT_MODE_BASE);
    expect(await bridgeMode(rt, HOST, cap2053, "2053")).toBe(PORT_MODE_BASE + 1);
    expect(await bridgeMode(rt, HOST, cap2053bare, "2053")).toBe(PORT_MODE_BASE + 1);
    // cross-port attempts fail in strict mode
    expect(await bridgeMode(rt, HOST, cap443, "2053")).toBe(-1);
    expect(await bridgeMode(rt, HOST, cap2053, "")).toBe(-1);
  });

  it("legacy flag restores v1.2.2 cross-port fallbacks", async () => {
    const rt = await runtime({ ADMIN_KEY: LEGACY_ADMIN, LEGACY_PORT_SECRETS: "1" });
    const cap443 = await capabilityFor(rt.portSecrets[443].secret, HOST);
    const cap2053 = await capabilityFor(rt.portSecrets[2053].secret, `${HOST}:2053`);
    // 443/base secret presented on port 2053 works again
    expect(await bridgeMode(rt, HOST, cap443, "2053")).toBe(PORT_MODE_BASE);
    // port-2053 secret presented on 443 works again
    expect(await bridgeMode(rt, HOST, cap2053, "")).toBe(PORT_MODE_BASE + 1);
  });

  it("rejects malformed capabilities and wrong hosts", async () => {
    const rt = await runtime({ ADMIN_KEY: LEGACY_ADMIN });
    expect(await bridgeMode(rt, HOST, "short", "")).toBe(-1);
    expect(await bridgeMode(rt, HOST, "!!!invalid!!!", "")).toBe(-1);
    const cap = await capabilityFor(rt.portSecrets[443].secret, HOST);
    expect(await bridgeMode(rt, "other.example.com", cap, "")).toBe(-1);
  });

  it("per-user secrets verify with their own mode (R1)", async () => {
    const rt = await runtime({ SECRET: FIXED_SECRET, USER_SECRETS: "alice,bob" });
    expect(rt.userSecrets).toHaveLength(2);
    expect(rt.userSecrets[0].label).toBe("alice");
    const capAlice = await capabilityFor(rt.userSecrets[0].secret, `${HOST}:2053`);
    const mode = await bridgeMode(rt, HOST, capAlice, "2053");
    expect(mode).toBe(USER_MODE_BASE);
    const secret = await modeSecret(rt, mode, HOST, "2053");
    expect(bytesToHex(secret)).toBe(bytesToHex(rt.userSecrets[0].secret));
    // user capabilities are host+port independent
    const capBob443 = await capabilityFor(rt.userSecrets[1].secret, HOST);
    expect(await bridgeMode(rt, HOST, capBob443, "")).toBe(USER_MODE_BASE + 1);
  });

  it("modeSecret resolves port modes and rejects unknown modes", async () => {
    const rt = await runtime({ SECRET: FIXED_SECRET });
    expect(bytesToHex(await modeSecret(rt, PORT_MODE_BASE + 1, HOST, "2053"))).toBe(rt.portSecrets[2053].secretHex.slice(2));
    expect(await modeSecret(rt, 3, HOST, "")).toBeNull(); // removed generator modes
    expect(await modeSecret(rt, 200, HOST, "")).toBeNull();
  });
});

describe("derived deployment paths (S2)", () => {
  it("derives per-deployment paths and keeps them deterministic", async () => {
    const a = await runtime({ SECRET: FIXED_SECRET });
    const b = await runtime({ SECRET: FIXED_SECRET });
    const c = await runtime({ SECRET: "ffffffffffffffffffffffffffffffff" });
    expect(a.sessionPath).toMatch(/^\/s\/[0-9a-f]{8}$/);
    expect(a.wsPath).toMatch(/^\/w\/[0-9a-f]{8}$/);
    expect(a.sessionPath).toBe(b.sessionPath);
    expect(a.sessionPath).not.toBe(c.sessionPath);
    expect(a.sessionPath).not.toBe("/api/v1/session");
    const explicit = await runtime({ SECRET: FIXED_SECRET, SESSION_PATH: "/my/session", WS_PATH: "my/ws" });
    expect(explicit.sessionPath).toBe("/my/session");
    expect(explicit.wsPath).toBe("/my/ws");
  });

  it("derivePaths is exposed for tests and deterministic", async () => {
    const rt = await runtime({ SECRET: FIXED_SECRET });
    const p = await derivePaths(rt.base);
    expect(p.sessionPath).toBe(rt.sessionPath);
  });
});

describe("ADMIN_KEY entropy checks (S1)", () => {
  it("flags weak keys", async () => {
    const rt = await runtime({ SECRET: FIXED_SECRET, ADMIN_KEY: "password123" });
    expect(rt.adminIssues.length).toBeGreaterThan(0);
  });
  it("accepts strong keys without warnings", async () => {
    const rt = await runtime({ SECRET: FIXED_SECRET, ADMIN_KEY: "vT8xQ2mZpL7wRn3kJs9bFd4y" });
    expect(rt.adminIssues).toEqual([]);
  });
});

describe("per-user secret derivation (R1)", () => {
  it("is deterministic, 16 bytes, dd-prefixed and label-bound", async () => {
    const rt = await runtime({ SECRET: FIXED_SECRET, USER_SECRETS: "alice" });
    const again = await deriveUserSecrets(rt.base, ["alice"]);
    expect(bytesToHex(again[0].secret)).toBe(bytesToHex(rt.userSecrets[0].secret));
    expect(rt.userSecrets[0].secretHex).toMatch(/^dd[0-9a-f]{32}$/);
    expect(rt.userSecrets[0].secret).toHaveLength(16);
  });
});
