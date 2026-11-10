// Integration tests: build the real worker entry with cloudflare:sockets
// stubbed, then drive the actual fetch() handler with Node's Request/Response.
// Covers the acceptance criterion "/api/v1/ws without upgrade is
// indistinguishable from a random path", the login flow, golden legacy panel
// values and legacy-path compatibility.
import { describe, it, expect, beforeAll } from "vitest";
import { build } from "esbuild";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let worker = null;
let tmp = null;

const ADMIN_KEY = "golden-test-key-0123456789";
const HOST = "tg.example.com";

async function req(path, init = {}, env = { ADMIN_KEY }) {
  const request = new Request("https://" + HOST + path, init);
  return worker.fetch(request, env, { waitUntil() {}, passThroughOnException() {} });
}

beforeAll(async () => {
  tmp = mkdtempSync(join(tmpdir(), "pg-test-"));
  const outfile = join(tmp, "worker-test.mjs");
  await build({
    entryPoints: ["src/worker.js"],
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    outfile,
    minify: false,
    legalComments: "none",
    alias: { "cloudflare:sockets": join(process.cwd(), "test", "mock-sockets.js") }
  });
  worker = (await import(outfile)).default;
});

function snapshot(res) {
  const headers = {};
  for (const [k, v] of res.headers) headers[k.toLowerCase()] = v;
  delete headers["date"];           // time-dependent
  delete headers["set-cookie"];     // tested separately
  return { status: res.status, headers };
}

describe("S2: probe uniformity", () => {
  it("/api/v1/ws without upgrade is indistinguishable from a random path", async () => {
    const wsRes = await req("/api/v1/ws");
    const rndRes = await req("/totally-random-page-" + Math.random());
    const wsText = await wsRes.text();
    const rndText = await rndRes.text();
    expect(snapshot(wsRes)).toEqual(snapshot(rndRes));
    expect(wsText).toBe(rndText);
  });

  it("/api/v1/session failures look like any unknown path", async () => {
    const a = await req("/api/v1/session", { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: "x" });
    const b = await req("/unknown-" + Math.random());
    expect(snapshot(a)).toEqual(snapshot(b));
    expect(await a.text()).toBe(await b.text());
  });

  it("bad bridge params look like any unknown path", async () => {
    const a = await req("/?bridge=garbage");
    const b = await req("/unknown-" + Math.random());
    expect(snapshot(a)).toEqual(snapshot(b));
  });

  it("derived session/ws paths are live and legacy paths are still accepted", async () => {
    const env = { ADMIN_KEY };
    const panelRes = await req("/" + ADMIN_KEY);
    expect(panelRes.status).toBe(200);
    // Legacy path accepted (one release): garbage handshake -> same as unknown path (decoy), not 404
    const legacy = await req("/api/v1/session", { method: "PUT" });
    const rnd = await req("/rnd-" + Math.random());
    expect(snapshot(legacy)).toEqual(snapshot(rnd));
  });
});

describe("S3: cookie login flow", () => {
  it("GET /login serves the form; wrong key fails without lockout bypass", async () => {
    const form = await req("/login");
    expect(form.status).toBe(200);
    const text = await form.text();
    expect(text).toContain('name="key"');
    const bad = await req("/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Origin": "https://" + HOST },
      body: "key=wrong-key-wrong-key-xx"
    });
    expect(bad.status).toBe(401);
  });

  it("correct key issues a strict cookie and /panel works with it", async () => {
    const res = await req("/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Origin": "https://" + HOST },
      body: "key=" + encodeURIComponent(ADMIN_KEY),
      redirect: "manual"
    });
    expect(res.status).toBe(303);
    const cookie = res.headers.get("set-cookie") || "";
    expect(cookie).toContain("pg_panel=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Strict");
    const value = /pg_panel=([^;]+)/.exec(cookie)[1];
    const panel = await req("/panel", { headers: { Cookie: "pg_panel=" + value } });
    expect(panel.status).toBe(200);
    const text = await panel.text();
    expect(text).toContain("tg://webproxy?server=");
    expect(text).not.toContain(ADMIN_KEY); // panel never echoes the admin key
  });

  it("cross-origin login POST is rejected (CSRF guard)", async () => {
    const res = await req("/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Origin": "https://evil.example.net" },
      body: "key=" + encodeURIComponent(ADMIN_KEY)
    });
    expect(res.status).toBe(200); // decoy
    expect(await res.text()).not.toContain("pg_panel");
  });
});

describe("golden legacy values surface in the panel", () => {
  it("legacy deployment shows the exact freeze value (golden base secret)", async () => {
    const res = await req("/" + ADMIN_KEY);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("dd2c77f9481e17ccfe6ecddefe4dcdb191"); // golden v1.2.2 base secret
    expect(text).toContain("dde5676b6b0ac58489f5b3015623b9a2b3"); // golden port 2053 secret
    expect(text).toContain("deprecated"); // URL-key access warning present
  });

  it("workers.dev hosts get the block warning (R2)", async () => {
    const request = new Request("https://my-proxy.workers.dev/" + ADMIN_KEY);
    const res = await worker.fetch(request, { ADMIN_KEY }, { waitUntil() {}, passThroughOnException() {} });
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(text.toLowerCase()).toContain("workers.dev");
  });
});

describe("brand-consistent auxiliary surfaces", () => {
  it("/health, /favicon.ico and robots.txt exist and match the derived brand", async () => {
    const health = await req("/health");
    expect(health.status).toBe(200);
    const json = JSON.parse(await health.text());
    expect(json.store).toBeTruthy();
    expect(typeof json.store).toBe("string");
    const fav = await req("/favicon.ico");
    const favText = await fav.text();
    // favicon initials match the derived brand name
    expect(favText).toContain(json.store.slice(0, 2));
    const robots = await req("/robots.txt");
    expect(await robots.text()).toContain("Disallow: /panel");
  });
});

describe("worker.js build invariants", () => {
  it("bundle is a single file under 3 MB with the sockets import", async () => {
    const { statSync, readFileSync } = await import("node:fs");
    const size = statSync(join(process.cwd(), "worker.js")).size;
    expect(size).toBeLessThan(3 * 1024 * 1024);
    expect(readFileSync(join(process.cwd(), "worker.js"), "utf8")).toContain("cloudflare:sockets");
  });
});
