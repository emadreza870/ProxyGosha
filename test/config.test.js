// Environment resolution + validation (R4) and admin key entropy (S1).
import { describe, it, expect } from "vitest";
import { resolveConfig, adminKeyIssues, KNOWN_ENV } from "../src/config.js";
import { HTTPS_PORTS } from "../src/version.js";

describe("resolveConfig", () => {
  it("defaults are sane and free-plan friendly", () => {
    const c = resolveConfig({});
    expect(c.maxStreams).toBe(6);
    expect(c.sessionTtl).toBe(21600); // S4: 6h
    expect(c.upBatchBytes).toBe(262144); // F1: 256 KiB
    expect(c.carrier).toBe("websocket-lanes");
    expect(c.issues).toEqual([]);
  });

  it("collects issues for invalid numeric env vars instead of throwing", () => {
    const c = resolveConfig({ MAX_STREAMS: "banana", UP_BATCH_BYTES: "-5" });
    expect(c.maxStreams).toBe(6);
    expect(c.upBatchBytes).toBe(262144);
    expect(c.issues.some((i) => i.startsWith("MAX_STREAMS"))).toBe(true);
    expect(c.issues.some((i) => i.startsWith("UP_BATCH_BYTES"))).toBe(true);
  });

  it("validates DC_OVERRIDE JSON strictly", () => {
    const ok = resolveConfig({ DC_OVERRIDE: '{"2":["149.154.167.50","2400:cb00::1"],"203":["91.105.192.110"]}' });
    expect(ok.dcOverride).not.toBeNull();
    expect(ok.effectiveDc[2]).toEqual(["149.154.167.50", "2400:cb00::1"]);
    const bad = resolveConfig({ DC_OVERRIDE: '{"x":[' });
    expect(bad.dcOverride).toBeNull();
    expect(bad.issues.some((i) => i.startsWith("DC_OVERRIDE"))).toBe(true);
    const junk = resolveConfig({ DC_OVERRIDE: '{"999999":["1.2.3.4"]}' });
    expect(junk.dcOverride).toBeNull();
  });

  it("parses USER_SECRETS labels, sanitizes and dedupes", () => {
    const c = resolveConfig({ USER_SECRETS: "Alice, bob , c!har" });
    expect(c.userLabels).toEqual(["alice", "bob", "char"]); // labels are sanitized to [a-z0-9_-]
    expect(c.issues.some((i) => i.startsWith("USER_SECRETS"))).toBe(false);
    const d = resolveConfig({ USER_SECRETS: "alice, alice" });
    expect(d.userLabels).toEqual(["alice"]);
    expect(d.issues.some((i) => i.includes("duplicate"))).toBe(true);
  });

  it("accepts CARRIER=auto (F6) and rejects unknown carriers", () => {
    expect(resolveConfig({ CARRIER: "auto" }).carrier).toBe("auto");
    expect(resolveConfig({ CARRIER: "websocket" }).carrier).toBe("websocket");
    expect(resolveConfig({ CARRIER: "smoke-signals" }).carrier).toBe("websocket-lanes");
    expect(resolveConfig({ CARRIER: "smoke-signals" }).issues.length).toBe(1);
  });

  it("flags unknown env variables for the status page", () => {
    const c = resolveConfig({ ADMIN_KEY: "k".repeat(24), AD_TAG: "12345678901234567890123456789012", GENERATOR_ENABLED: "true" });
    expect(c.unknown).toContain("AD_TAG");
    expect(c.unknown).toContain("GENERATOR_ENABLED");
  });

  it("records LEGACY_PORT_SECRETS flag", () => {
    expect(resolveConfig({}).legacyPortSecrets).toBe(false);
    expect(resolveConfig({ LEGACY_PORT_SECRETS: "1" }).legacyPortSecrets).toBe(true);
  });

  it("path validation rejects traversal and keeps valid paths", () => {
    expect(resolveConfig({ SESSION_PATH: "../evil" }).sessionPath).toBe("");
    expect(resolveConfig({ SESSION_PATH: "../evil" }).issues.length).toBeGreaterThan(0);
    expect(resolveConfig({ WS_PATH: "ws/custom" }).wsPath).toBe("/ws/custom");
  });

  it("every documented variable is in KNOWN_ENV", () => {
    for (const v of ["ADMIN_KEY", "SECRET", "KEY_EPOCH", "EXTRA_HOSTS", "DECOY_URL", "CARRIER", "HOSTNAME", "MAX_STREAMS", "SESSION_PATH", "WS_PATH", "DEBUG"]) {
      expect(KNOWN_ENV).toContain(v);
    }
  });
});

describe("adminKeyIssues (S1)", () => {
  it("rejects <16 chars outright (buildRuntime gate)", () => {
    expect(adminKeyIssues("short")[0]).toContain("too short");
  });
  it("warns for 16-23 char keys", () => {
    expect(adminKeyIssues("a1b2c3d4e5f6g7h8").some((i) => i.includes("24"))).toBe(true);
  });
  it("warns for dictionary-like keys", () => {
    expect(adminKeyIssues("my-password-1234567890").some((i) => i.includes("common pattern"))).toBe(true);
  });
  it("warns for low-variety keys", () => {
    expect(adminKeyIssues("aaaaaaaaaaaaaaaaaaaaaaaa").some((i) => i.includes("variety") || i.includes("classes"))).toBe(true);
  });
  it("passes strong keys", () => {
    expect(adminKeyIssues("vT8xQ2mZpL7wRn3kJs9bFd4y")).toEqual([]);
  });
});

describe("built-in DC list", () => {
  it("keeps the official front-ends", () => {
    const c = resolveConfig({});
    expect(Object.keys(c.dc).map(Number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 203]);
    expect(c.dc[2]).toContain("149.154.167.51");
    expect(HTTPS_PORTS).toEqual([443, 2053, 2083, 2087, 2096, 8443]);
  });
});
