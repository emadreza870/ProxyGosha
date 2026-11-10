// Optional alerting hook (R5). Completely inert unless the operator sets
// ALERT_URL (https:// only). Rate limited per alert type; payloads contain
// event names and counts only — never IPs, tokens or secrets.
import { VERSION } from "./version.js";
import { STATS, logEvent } from "./telemetry.js";

const ALERT_LAST = Object.create(null);
const ALERT_MIN_INTERVAL_MS = 300000;

export async function maybeAlert(cfg, type, detail) {
  if (!cfg || !cfg.alertUrl) return;
  const now = Date.now();
  if (now - (ALERT_LAST[type] || 0) < ALERT_MIN_INTERVAL_MS) return;
  ALERT_LAST[type] = now;
  try {
    await fetch(cfg.alertUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app: "ProxyGosha", version: VERSION, type, detail: String(detail).slice(0, 200), at: new Date().toISOString() })
    });
    STATS.alerted++;
    logEvent("alert_sent", type);
  } catch (e) {
    logEvent("alert_fail", e && e.name ? e.name : "unknown");
  }
}
