import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.js"],
    testTimeout: 20000,
    hookTimeout: 20000,
    // Protocol tests depend on module-level STATS/telemetry state; keep them
    // in separate processes to avoid cross-test interference.
    pool: "forks",
    poolOptions: { forks: { singleFork: false } }
  }
});
