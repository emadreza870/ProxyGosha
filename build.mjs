// Build: bundle src/worker.js (+ dependencies) into the single pasteable
// worker.js. cloudflare:sockets stays external (resolved by workerd).
// Placeholder substitution happens at response time and is verified by tests
// (decoy uniformity + bridge render tests), not here: the templates are part
// of the bundle by design.
import { build } from "esbuild";
import { writeFileSync } from "node:fs";

const MAX_SIZE = 3 * 1024 * 1024; // acceptance: comfortably under 3 MB
const checkOnly = process.argv.includes("--check-only");

const result = await build({
  entryPoints: ["src/worker.js"],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  outfile: "worker.js",
  external: ["cloudflare:sockets"],
  minify: false,
  keepNames: true,
  legalComments: "none",
  banner: {
    js: "// ProxyGosha v1.3.0 — built artifact (esbuild). Source: src/ · Telegram WEB proxy for Cloudflare Workers."
  },
  write: false
});

const output = result.outputFiles[0].text;
const size = Buffer.byteLength(output);

if (size > MAX_SIZE) {
  console.error(`BUILD FAILED: worker.js is ${size} bytes (> ${MAX_SIZE} limit)`);
  process.exit(1);
}
if (!output.includes("cloudflare:sockets")) {
  console.error("BUILD FAILED: cloudflare:sockets import missing");
  process.exit(1);
}

if (!checkOnly) {
  writeFileSync("worker.js", output);
  console.log(`worker.js written: ${(size / 1024).toFixed(1)} KB`);
} else {
  console.log(`check-only OK: worker.js would be ${(size / 1024).toFixed(1)} KB`);
}
