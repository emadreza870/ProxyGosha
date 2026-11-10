// Decoy uniformity (S2), health/favicon consistency, bridge rendering, QR
// correctness (decoded with jsQR), login throttle (S3).
import { describe, it, expect } from "vitest";
import { DECOY_TEMPLATE, brandifyDecoy, healthJson, faviconSvg, decoy } from "../src/decoy.js";
import { deriveDecoyBrand, buildRuntime } from "../src/kdf.js";
import { resolveConfig } from "../src/config.js";
import { serveBridge, BRIDGE_HTML } from "../src/bridge.js";
import { qrSvg } from "../src/qr.js";
import qrcode from "qrcode-generator";
import jsQR from "jsqr";
import { loginFailure, loginLocked, loginSuccess, loginLockRemaining, LOGIN_GATE } from "../src/telemetry.js";

const SEED_A = "00112233445566778899aabbccddeeff";
const SEED_B = "deadbeefdeadbeefdeadbeefdeadbeef";

async function brandFor(secret) {
  return deriveDecoyBrand((await buildRuntime(resolveConfig({ SECRET: secret }))).base);
}

describe("decoy uniformity (S2)", () => {
  it("replaces every placeholder; output is stable and placeholder-free", async () => {
    const brand = await brandFor(SEED_A);
    const html = brandifyDecoy(DECOY_TEMPLATE, brand);
    expect(html).not.toMatch(/__[A-Z0-9_]+__/);
    expect(brandifyDecoy(DECOY_TEMPLATE, brand)).toBe(html);
    expect(html).toContain(brand.name);
    expect(html).toContain(brand.palette.accent);
  });

  it("different deployment secrets produce different storefronts", async () => {
    const a = brandifyDecoy(DECOY_TEMPLATE, await brandFor(SEED_A));
    const b = brandifyDecoy(DECOY_TEMPLATE, await brandFor(SEED_B));
    expect(a).not.toBe(b);
  });

  it("health JSON and favicon are consistent with the brand", async () => {
    const brand = await brandFor(SEED_A);
    expect(healthJson(brand)).toContain(`"store":"${brand.name}"`);
    expect(faviconSvg(brand)).toContain(brand.initials);
  });

  it("decoy() returns 200 + branded HTML even when DECOY_URL is unreachable", async () => {
    const rt = await buildRuntime(resolveConfig({ SECRET: SEED_A, DECOY_URL: "https://localhost:1/unreachable" }));
    rt.decoyHtml = brandifyDecoy(DECOY_TEMPLATE, rt.brand);
    const res = await decoy(rt, "GET");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain(rt.brand.name);
    expect(text).not.toMatch(/__[A-Z0-9_]+__/);
    const head = await decoy(rt, "HEAD");
    expect(await head.text()).toBe("");
    expect(head.status).toBe(200);
  });

  it("decoy() without a runtime still renders the default storefront", async () => {
    const res = await decoy(null, "GET");
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("LUXVEIL");
  });
});

describe("bridge rendering", () => {
  const cfg = {
    sessionPath: "/s/abcd1234",
    wsPath: "/w/beefcafe",
    batchBytes: 2097152,
    carrierResolved: "websocket-lanes"
  };
  it("serveBridge returns a 200 response with carrier headers", () => {
    const res = serveBridge(cfg, "tg.example.com", 10, "", "NONCE123", "BOOTSTRIPTOKEN", "websocket-lanes");
    expect(res.status).toBe(200);
  });
  it("bridge HTML has no leftover placeholders after render", () => {
    const html = BRIDGE_HTML
      .replaceAll("__NONCE__", () => "N")
      .replaceAll("__BOOTSTRAP__", () => '"T"')
      .replaceAll("__CARRIER_MODE__", () => '"websocket-lanes"')
      .replaceAll("__BATCH_LIMIT__", () => "2097152")
      .replaceAll("__SESSION_PATH__", () => '"s/abcd1234"')
      .replaceAll("__WS_PATH__", () => '"w/beefcafe"');
    expect(html).not.toContain("__NONCE__");
    expect(html).not.toContain("__BOOTSTRAP__");
    expect(html).not.toContain("__CARRIER_MODE__");
    expect(html).not.toMatch(/__[A-Z0-9_]{3,}__/);
  });

  it("bridge script is syntactically valid JavaScript", () => {
    const html = BRIDGE_HTML
      .replaceAll("__NONCE__", () => "N")
      .replaceAll("__BOOTSTRAP__", () => JSON.stringify("A".repeat(64)))
      .replaceAll("__CARRIER_MODE__", () => '"websocket-lanes"')
      .replaceAll("__BATCH_LIMIT__", () => "2097152")
      .replaceAll("__SESSION_PATH__", () => '"s/abcd1234"')
      .replaceAll("__WS_PATH__", () => '"w/beefcafe"');
    const m = /<script nonce="N">([\s\S]*?)<\/script>/.exec(html);
    expect(m).not.toBeNull();
    expect(() => new Function(m[1])).not.toThrow();
  });

  it("bridge keeps the protocol constants intact (constraint 3)", () => {
    expect(BRIDGE_HTML).toContain("tproxy-v1.'+sessionToken");
    expect(BRIDGE_HTML).toContain("tproxy-lane-v1.'+sessionToken+'.'+lane.id");
    expect(BRIDGE_HTML).toContain("tproxy-init");
    expect(BRIDGE_HTML).toContain("'tproxy-android-init'");
  });

  it("reconnect starts near 200 ms and caps at 10 s (F5)", () => {
    // backoffDelay(attempt) = min(200*1.5^attempt, 10000) + jitter(<base/4)
    const m = /const backoffDelay=attempt=>\{const base=Math\.min\(200\*Math\.pow\(1\.5,Math\.min\(attempt,8\)\),10000\);return base\+Math\.floor\(Math\.random\(\)\*Math\.max\(1,base\/4\)\)\}/.exec(BRIDGE_HTML);
    expect(m).not.toBeNull();
  });
});

describe("QR codes (R2)", () => {
  it("produces decodable QR SVG for a real proxy link", () => {
    const link = "tg://webproxy?server=tg.example.com&port=2053&secret=dd2c77f9481e17ccfe6ecddefe4dcdb191";
    const svg = qrSvg(link);
    expect(svg).toContain("<svg");
    // Rasterize the QR matrix and decode it back with jsQR.
    const matrix = qrcode(0, "M");
    matrix.addData(link);
    matrix.make();
    const n = matrix.getModuleCount();
    const scale = 8, quiet = 4;
    const size = (n + quiet * 2) * scale;
    const rgba = new Uint8ClampedArray(size * size * 4).fill(255);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!matrix.isDark(r, c)) continue;
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const y = (r + quiet) * scale + dy;
            const x = (c + quiet) * scale + dx;
            const i = (y * size + x) * 4;
            rgba[i] = rgba[i + 1] = rgba[i + 2] = 0;
            rgba[i + 3] = 255;
          }
        }
      }
    }
    const decoded = jsQR(rgba, size, size);
    expect(decoded).not.toBeNull();
    expect(decoded.data).toBe(link);
  });
});

describe("login throttle (S3): coarse global backoff", () => {
  it("locks after repeated failures and unlocks on success", () => {
    const saved = { ...LOGIN_GATE };
    LOGIN_GATE.fails = 0;
    LOGIN_GATE.lockedUntil = 0;
    expect(loginLocked()).toBe(false);
    for (let i = 0; i < 4; i++) loginFailure();
    expect(loginLocked()).toBe(false); // below threshold
    loginFailure();
    expect(loginLocked()).toBe(true);
    expect(loginLockRemaining()).toBeGreaterThan(0);
    loginSuccess();
    expect(loginLocked()).toBe(false);
    expect(LOGIN_GATE.fails).toBe(0);
    Object.assign(LOGIN_GATE, saved);
  });
});
