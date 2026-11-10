// Admin pages: bilingual (EN/FA) shell, setup, login, panel, status, latency.
// R2: nonce'd inline script for copy buttons and the latency tester; inline
// server-generated SVG QR codes; clearer workers.dev warning.
import { VERSION, CREDIT_NAME, CREDIT_MAIL, HTTPS_PORTS } from "./version.js";
import { escapeHtml, fmtBytes, fmtDuration } from "./util.js";
import { STATS, ISOLATE_START, LOGIN_GATE, MEMORY, DC_EMA, DC_LAST_GOOD, logSnapshot, logEvent, USER_SESSIONS } from "./telemetry.js";
import { healthJson, faviconSvg } from "./decoy.js";
import { qrSvg } from "./qr.js";

export const PAGE_STYLE = "body{font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;max-width:760px;margin:0 auto;padding:16px;background:#f6f7f9;color:#1d2330;line-height:1.8}h1{font-size:21px;margin:8px 0 4px}h2{font-size:16px;margin-top:28px}.card{background:#fff;border-radius:12px;padding:12px 16px;margin:10px 0;box-shadow:0 1px 3px rgba(0,0,0,.08)}a.btn{display:block;text-align:center;background:#2a9df4;color:#fff;text-decoration:none;padding:10px;border-radius:10px;margin:6px 0;font-weight:bold}code,textarea{direction:ltr;text-align:left;font-family:ui-monospace,Consolas,monospace;font-size:12px}textarea{width:100%;height:58px;box-sizing:border-box;border:1px solid #ccd;border-radius:8px;padding:6px}textarea.one{height:34px}.muted{color:#667;font-size:13px}.warn{background:#fff4e5;border-inline-start:4px solid #f0a020}.bad{background:#fdecea;border-inline-start:4px solid #d84a3f}footer.credit{margin:32px 0 8px;text-align:center;font-size:12px;color:#889;direction:ltr}footer.credit a{color:#667}ol{padding-inline-start:22px;margin:4px 0}nav.lang{text-align:end;font-size:14px}nav.lang label{cursor:pointer;padding:4px 10px;border-radius:8px;color:#2a6fd6}"
  + ".fa{display:none}#l-fa:checked~main{direction:rtl;font-family:Tahoma,system-ui,sans-serif}#l-fa:checked~main .en{display:none}#l-fa:checked~main span.fa{display:inline}#l-fa:checked~main div.fa,#l-fa:checked~main p.fa,#l-fa:checked~main ol.fa,#l-fa:checked~main h1.fa,#l-fa:checked~main h2.fa{display:block}#l-en:checked~main nav label[for=l-en],#l-fa:checked~main nav label[for=l-fa]{background:#e3eefc;font-weight:bold}"
  + "pre{background:#f0f2f5;padding:8px;border-radius:8px;overflow-x:auto;font-size:11px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:4px 8px;border-bottom:1px solid #e5e7eb;text-align:start;vertical-align:top}th{font-weight:600;white-space:nowrap}.ok{color:#177245}.badc{color:#b33}a.plain{color:#2a6fd6}button.copy{cursor:pointer;border:1px solid #ccd;background:#eef2ff;border-radius:8px;padding:4px 12px;font-size:12px}details.qr{margin:6px 0}details.qr svg{width:160px;height:160px;background:#fff;border:1px solid #e5e7eb;border-radius:8px}";

export function bi(en, fa) {
  return `<span class="en">${en}</span><span class="fa">${fa}</span>`;
}

export function bilingualPage(title, lang, body, nonce, extraScript = "") {
  const fa = lang === "fa";
  const credit = `<footer class="credit">ProxyGosha &middot; ${escapeHtml(CREDIT_NAME)} &middot; <a href="mailto:${escapeHtml(CREDIT_MAIL)}">${escapeHtml(CREDIT_MAIL)}</a></footer>`;
  const script = extraScript ? `<script nonce="${escapeHtml(nonce)}">${extraScript}</script>` : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><style>${PAGE_STYLE}</style></head><body>
<input type="radio" name="l" id="l-en" hidden${fa ? "" : " checked"}><input type="radio" name="l" id="l-fa" hidden${fa ? " checked" : ""}>
<main><nav class="lang"><label for="l-en">English</label> <label for="l-fa">فارسی</label></nav>
${body}
${credit}
</main>${script}</body></html>`;
}

export function pageHeaders(nonce) {
  const csp = [
    "default-src 'none'",
    "style-src 'unsafe-inline'",
    "script-src 'nonce-" + nonce + "'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "connect-src 'self'",
    "img-src 'self'"
  ].join("; ");
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "Strict-Transport-Security": "max-age=31536000",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": csp
  };
}

const COPY_SCRIPT = `document.addEventListener('click',function(e){var b=e.target.closest('[data-copy]');if(!b)return;var t=b.getAttribute('data-copy');function done(){var o=b.textContent;b.textContent=b.getAttribute('data-done')||'Copied';setTimeout(function(){b.textContent=o},1200)}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,function(){fallback(t,done)})}else fallback(t,done);function fallback(t,cb){var a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');cb()}catch(e){}document.body.removeChild(a)}});`;

export function serveSetup(cfg, host, lang, method, nonce, suggestions) {
  if (method !== "GET" && method !== "HEAD") return null;
  const { adminKey, secret } = suggestions;
  const secretState = cfg && !cfg.secretDerived
    ? `<div class="card ok">${bi(
        "SECRET is already configured on this worker — its value is never shown here. The suggestion below is a fresh random value you can ignore.",
        "SECRET روی این ورکر از قبل تنظیم شده — مقدارش اینجا هرگز نمایش داده نمی‌شود. مقدار پیشنهادی زیر تصادفی جدید است و می‌توانید نادیده بگیرید."
      )}</div>`
    : "";
  const legacyNote = cfg && cfg.secretDerived
    ? `<div class="card warn">${bi(
        "You are in legacy mode: secrets are derived from ADMIN_KEY. Generate a SECRET below and set it to freeze your current links, then rotate ADMIN_KEY safely.",
        "شما در حالت قدیمی هستید: سکرت‌ها از ADMIN_KEY ساخته می‌شوند. یک SECRET از زیر بسازید و تنظیم کنید تا لینک‌های فعلی ثابت بمانند، بعد می‌توانید ADMIN_KEY را عوض کنید."
      )}</div>`
    : "";
  const body = `<h1>${bi("Proxy setup", "راه‌اندازی پروکسی")}</h1>${secretState}${legacyNote}
<div class="card">
<ol class="en"><li>In the Cloudflare dashboard, open <b>Workers &amp; Pages</b> → this Worker → <b>Settings</b> → <b>Variables and Secrets</b>.</li>
<li>Add <code>ADMIN_KEY</code> with the admin key below (24+ mixed characters recommended).</li>
<li>Add <code>SECRET</code> with the 32-hex secret below. This decouples your proxy secrets from ADMIN_KEY.</li>
<li>(Optional, for mass token revocation) Add <code>KEY_EPOCH</code>, e.g. <code>1</code>. Changing it instantly invalidates all issued carrier tokens.</li>
<li>Click <b>Deploy</b>, then open the panel address below.</li></ol>
<ol class="fa"><li>در داشبورد کلودفلر: <b>Workers &amp; Pages</b> ← این ورکر ← <b>Settings</b> ← <b>Variables and Secrets</b></li>
<li>متغیر <code>ADMIN_KEY</code> را با کلید زیر بسازید (ترکیب ۲۴+ کاراکتر توصیه می‌شود).</li>
<li>متغیر <code>SECRET</code> را با مقدار ۳۲ حرفی hex زیر بسازید. با این کار سکرت‌های پروکسی از ADMIN_KEY مستقل می‌شوند.</li>
<li>(اختیاری، برای ابطال توکن‌ها) متغیر <code>KEY_EPOCH</code> را مثلاً <code>1</code> بگذارید. تغییر آن همه توکن‌های صادرشده را باطل می‌کند.</li>
<li><b>Deploy</b> را بزنید و سپس آدرس پنل را باز کنید.</li></ol>
${bi("Suggested ADMIN_KEY", "ADMIN_KEY پیشنهادی")}:<textarea class="one" readonly>${escapeHtml(adminKey)}</textarea>
${bi("Suggested SECRET (paste as-is)", "SECRET پیشنهادی (همین را کپی کنید)")}:<textarea class="one" readonly>${escapeHtml(secret)}</textarea>
${bi("Login page", "صفحه ورود")}:<textarea class="one" readonly>https://${escapeHtml(host)}/login</textarea></div>
<p class="muted">${bi(
    "Keep ADMIN_KEY private; it unlocks the panel. SECRET is the actual proxy secret — treat it as the sensitive one. Do not share the panel address with users.",
    "ADMIN_KEY را خصوصی نگه دارید؛ کلید ورود به پنل است. SECRET سکرت واقعی پروکسی است — حساس‌تر است. آدرس پنل را با کاربران به اشتراک نگذارید."
  )}</p>`;
  return new Response(bilingualPage("Setup", lang, body, nonce, COPY_SCRIPT), { status: 200, headers: pageHeaders(nonce) });
}

export function serveLogin(cfg, host, lang, nonce, error = "") {
  const body = `<h1>${bi("Panel sign-in", "ورود به پنل")}</h1>
${error ? `<div class="card bad">${bi("Wrong key.", "کلید اشتباه است.")}</div>` : ""}
<div class="card">
<form method="post" action="/login">
${bi("ADMIN_KEY", "کلید مدیر")}: <input type="password" name="key" autocomplete="current-password" style="width:100%;padding:8px;border:1px solid #ccd;border-radius:8px" required>
<button type="submit" style="margin-top:8px;padding:8px 18px;border-radius:8px;background:#2a9df4;color:#fff;border:0;cursor:pointer">${bi("Sign in", "ورود")}</button>
</form></div>
<p class="muted">${bi(
    "Cookie-based sign-in (HttpOnly, Secure, SameSite=Strict). Putting the key in the URL still works but is deprecated: it leaks into browser history and server logs.",
    "ورود مبتنی بر کوکی (HttpOnly، Secure، SameSite=Strict). قرار دادن کلید در آدرس هنوز کار می‌کند اما منسوخ است: در تاریخچه مرورگر و لاگ‌ها باقی می‌ماند."
  )}</p>`;
  return new Response(bilingualPage("Sign in", lang, body, nonce), { status: error ? 401 : 200, headers: pageHeaders(nonce) });
}

export async function servePanel(cfg, host, port, lang, nonce, via) {
  STATS.panelViews++;
  logEvent("panel_view", host);
  const statusHref = "/panel/status";
  const secret = cfg.baseHex;
  const deprecated = via === "url"
    ? `<div class="card warn">${bi(
        "You opened the panel with the key in the URL. This still works but is deprecated — use the login page instead so the key never lands in browser history or logs.",
        "پنل را با کلید داخل آدرس باز کرده‌اید. این روش هنوز کار می‌کند اما منسوخ است — به‌جای آن از صفحه ورود استفاده کنید تا کلید در تاریخچه و لاگ‌ها ثبت نشود."
      )}</div>`
    : "";
  const legacyWarn = cfg.secretDerived
    ? `<div class="card warn"><b>${bi("Legacy secret mode", "حالت قدیمی سکرت")}</b> — ${bi(
        "Your proxy secrets are derived from ADMIN_KEY. A weak ADMIN_KEY can be brute-forced offline because the secret is shared with every user. To freeze your current links and decouple: set the SECRET variable below to this exact value, then you may rotate ADMIN_KEY freely:",
        "سکرت‌های پروکسی شما از ADMIN_KEY مشتق می‌شوند. یک ADMIN_KEY ضعیف می‌تواند آفلاین brute-force شود چون سکرت با همه کاربران مشترک است. برای ثابت نگه داشتن لینک‌ها و مستقل کردن آن‌ها، متغیر SECRET را دقیقاً برابر این مقدار تنظیم کنید، بعد می‌توانید ADMIN_KEY را عوض کنید:"
      )}<textarea class="one" readonly>${escapeHtml(secret)}</textarea></div>`
    : "";
  const adminWarn = cfg.adminIssues.length
    ? `<div class="card bad"><b>${bi("ADMIN_KEY weakness", "ضعف ADMIN_KEY")}</b><ul style="margin:4px 22px">${cfg.adminIssues.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>${bi(
        "Use a longer, mixed-character key. Set a fixed SECRET first so changing ADMIN_KEY does not break links.",
        "از کلید طولانی‌تر با ترکیب کاراکتر استفاده کنید. اول SECRET ثابت را تنظیم کنید تا تغییر ADMIN_KEY لینک‌ها را نشکند."
      )}</div>`
    : "";
  const userSection = cfg.userSecrets.length
    ? `<h2>${bi("Per-user links", "لینک‌های اختصاصی کاربران")}</h2><div class="card muted">${bi(
        "Each user gets a unique secret derived from their label. The secret works on every port. Revoke one by removing its label from the USER_SECRETS environment variable and redeploying; revocation applies to new connections. Session counters are per-isolate and reset on recycle.",
        "هر کاربر سکرت یکتای مشتق‌شده از برچسب خودش را دارد. این سکرت روی همه پورت‌ها کار می‌کند. برای ابطال، برچسب را از متغیر USER_SECRETS حذف کنید و دوباره دیپلوی کنید؛ ابطال در اتصال‌های جدید اعمال می‌شود. شمارنده نشست‌ها مخصوص همین ایزوله است و با بازیافت صفر می‌شود."
      )}</div>${cfg.userSecrets.map((u) => {
        const link = "tg://webproxy?server=" + encodeURIComponent(host) + "&secret=" + u.secretHex;
        const count = USER_SESSIONS[u.label] || 0;
        return `<div class="card"><b>${escapeHtml(u.label)}</b> <span class="muted">${bi("sessions (this isolate)", "نشست‌ها (این ایزوله)")}: ${count}</span><a class="btn" href="${escapeHtml(link)}">${bi("Connect in Telegram", "اتصال در تلگرام")}</a><textarea readonly>${escapeHtml(link)}</textarea><button class="copy" type="button" data-copy="${escapeHtml(u.secretHex)}" data-done="${bi("Copied", "کپی شد")}">${bi("Copy secret", "کپی سکرت")}</button><details class="qr"><summary>${bi("QR code", "کد QR")}</summary>${qrSvg(link)}</details></div>`;
      }).join("")}`
    : "";
  const hosts = [];
  for (const h of [host, ...(cfg.extraHosts || [])]) if (h && !hosts.includes(h)) hosts.push(h);
  const sections = hosts.map((h) => {
    const workersDev = h.endsWith(".workers.dev");
    const items = HTTPS_PORTS.map((p) => {
      const pSecret = cfg.portSecrets?.[p]?.secretHex || secret;
      const link = "tg://webproxy?server=" + encodeURIComponent(h) + (p !== 443 ? "&port=" + p : "") + "&secret=" + pSecret;
      return `<div class="card"><b>${bi("Port", "پورت")} ${p}</b>${p === 443 ? " " + bi("(default)", "(پیش‌فرض)") : ""}<a class="btn" href="${escapeHtml(link)}">${bi("Connect in Telegram", "اتصال در تلگرام")}</a><textarea readonly>${escapeHtml(link)}</textarea><button class="copy" type="button" data-copy="${escapeHtml(link)}" data-done="${bi("Copied", "کپی شد")}">${bi("Copy link", "کپی لینک")}</button> <button class="copy" type="button" data-copy="${escapeHtml(pSecret)}" data-done="${bi("Copied", "کپی شد")}">${bi("Copy secret", "کپی سکرت")}</button><details class="qr"><summary>${bi("QR code", "کد QR")}</summary>${qrSvg(link)}</details></div>`;
    }).join("");
    const note = workersDev
      ? `<div class="card bad"><b>${bi("workers.dev addresses are usually blocked", "آدرس‌های workers.dev معمولاً فیلترند")}</b> — ${bi(
          "they are filtered in Iran and many other regions and some ports may not open. Attach a custom domain to this Worker for reliable service.",
          "در ایران و خیلی از کشورهای دیگر فیلتر هستند و ممکن است بعضی پورت‌ها باز نشوند. برای سرویس پایدار یک دامنه شخصی به این ورکر وصل کنید."
        )}</div>`
      : "";
    const manualItems = HTTPS_PORTS.map((p) => {
      const s = cfg.portSecrets?.[p]?.secretHex || secret;
      return `<div style="margin:6px 0"><b>${bi("Port", "پورت")} ${p}</b>${p === 443 ? " " + bi("(default)", "(پیش‌فرض)") : ""}:<textarea class="one" readonly>${escapeHtml(s)}</textarea></div>`;
    }).join("");
    const manual = `<div class="card"><b>${bi("Manual entry", "ورود دستی")}</b> — ${bi(
        "in Telegram's proxy settings, add a new proxy of type <b>WEB</b>. Each port accepts ONLY its own secret:",
        "در تنظیمات پروکسی تلگرام یک پروکسی جدید از نوع <b>WEB</b> اضافه کنید. هر پورت فقط سکرت خودش را می‌پذیرد:"
      )}<br>
${bi("Server", "سرور")}:<textarea class="one" readonly>${escapeHtml(h)}</textarea>
<div style="margin-top:8px"><b>${bi("Ports &amp; Secrets", "پورت‌ها و سکرت‌ها")}:</b></div>
${manualItems}</div>`;
    return `<h2>${escapeHtml(h)}</h2>${note}${manual}${items}`;
  }).join("");
  const latencyHref = "/panel/latency";
  const logoutForm = `<div class="card"><form method="post" action="/logout" style="display:inline"><button type="submit" style="padding:6px 14px;border-radius:8px;background:#eef2ff;border:1px solid #ccd;cursor:pointer">${bi("Sign out", "خروج")}</button></form> <a class="plain" href="${escapeHtml(statusHref)}">${bi("Status &amp; logs", "وضعیت و لاگ‌ها")}</a> <a class="plain" href="${escapeHtml(latencyHref)}">${bi("Latency test", "تست تأخیر")}</a></div>`;
  const body = `<h1>${bi("Proxy panel", "پنل پروکسی")}</h1>
${deprecated}${legacyWarn}${adminWarn}
<div class="card">${bi(
    "Tap <b>Connect in Telegram</b> to add the proxy. Each port has its own secret and strict isolation is on: a secret only works on its own port. If a port does not connect, try another one.",
    "روی «اتصال در تلگرام» بزنید تا پروکسی اضافه شود. هر پورت سکرت خودش را دارد و جداسازی سختگیرانه فعال است: هر سکرت فقط روی پورت خودش کار می‌کند. اگر یک پورت وصل نشد، پورت دیگری را امتحان کنید."
  )}</div>
<div class="card warn">${bi(
    "Do not share this page. Share only the links, or the server, port and matching secret.",
    "این صفحه را با کسی به اشتراک نگذارید. فقط لینک‌ها یا سرور، پورت و سکرت مربوطه را بفرستید."
  )}</div>
${logoutForm}
${userSection}
${sections}`;
  return new Response(bilingualPage("Panel", lang, body, nonce, COPY_SCRIPT), { status: 200, headers: pageHeaders(nonce) });
}

const LATENCY_SCRIPT = `document.addEventListener('click',function(e){if(!e.target.closest('#run-latency'))return;e.preventDefault();var out=document.getElementById('latency-out');out.innerHTML='';var hosts=JSON.parse(document.getElementById('latency-hosts').textContent);var i=0;function next(){if(i>=hosts.length){return}var h=hosts[i++];var ports=[443,2053,2083,2087,2096,8443];var row=document.createElement('div');row.textContent=h;out.appendChild(row);var done=0;ports.forEach(function(p){var t0=performance.now();var ctrl=new AbortController();var to=setTimeout(function(){ctrl.abort()},6000);fetch('https://'+h+':'+p+'/health',{mode:'no-cors',cache:'no-store',signal:ctrl.signal,redirect:'error'}).then(function(){clearTimeout(to);add(h,p,Math.round(performance.now()-t0),true)}).catch(function(){clearTimeout(to);add(h,p,Math.round(performance.now()-t0),false)}).finally(function(){if(++done===ports.length)setTimeout(next,50)})})}function add(h,p,ms,ok){var s=document.createElement('span');s.style.marginInlineStart='12px';s.style.fontFamily='monospace';s.textContent=(ok?'\\u2713 ':'\\u2717 ')+p+': '+ms+'ms';s.style.color=ok?'#177245':'#b33';out.lastChild.appendChild(s)}next();});`;

export function serveLatency(cfg, host, lang, nonce) {
  const hosts = [host, ...(cfg.extraHosts || [])].filter(Boolean);
  const body = `<h1>${bi("Latency test", "تست تأخیر")}</h1>
<div class="card muted">${bi(
    "Measures the round-trip from YOUR browser to each Cloudflare HTTPS port on each host, so you can pick the fastest port for your network. Results depend on your ISP; nothing is recorded server-side.",
    "زمان رفت‌وبرگشت از مرورگر شما تا هر پورت HTTPS کلودفلر روی هر دامنه را می‌سنجد تا سریع‌ترین پورت شبکه خودتان را انتخاب کنید. نتیجه به ISP شما بستگی دارد؛ چیزی سمت سرور ذخیره نمی‌شود."
  )}</div>
<div class="card"><button id="run-latency" type="button" style="padding:8px 18px;border-radius:8px;background:#2a9df4;color:#fff;border:0;cursor:pointer">${bi("Run test", "اجرای تست")}</button><div id="latency-out" style="margin-top:10px;font-size:14px"></div></div>
<script type="application/json" id="latency-hosts">${JSON.stringify(hosts)}</script>`;
  return new Response(bilingualPage("Latency", lang, body, nonce, LATENCY_SCRIPT), { status: 200, headers: pageHeaders(nonce) });
}

function envReport(cfg) {
  const rows = [];
  const row = (name, state) => rows.push(`<tr><td><code>${name}</code></td><td>${state}</td></tr>`);
  row("ADMIN_KEY", cfg.adminKey ? "set" + (cfg.adminIssues.length ? ` <span class="badc">(${cfg.adminIssues.length} warning${cfg.adminIssues.length > 1 ? "s" : ""})</span>` : "") : "unset");
  row("SECRET", cfg.secretDerived ? "unset — <span class=\"badc\">legacy derivation from ADMIN_KEY</span>" : "set (independent secret)");
  row("KEY_EPOCH", cfg.keyEpoch ? `set (fingerprint ${cfg.keyEpochFingerprint})` : "unset");
  row("CARRIER", escapeHtml(cfg.carrierResolved || cfg.carrier));
  row("HOSTNAME", cfg.hosts.length && !cfg.hosts.includes("*") ? escapeHtml(cfg.hosts.join(", ")) : "* (all hosts)");
  row("EXTRA_HOSTS", (cfg.extraHosts || []).length ? escapeHtml(cfg.extraHosts.join(", ")) : "unset");
  row("DECOY_URL", cfg.decoyUrl ? "set (edge-cached 60 s)" : "unset (built-in branded storefront)");
  row("ALERT_URL", cfg.alertUrl ? "set (webhook enabled)" : "unset (no alerts)");
  row("MAX_STREAMS", String(cfg.maxStreams));
  row("SESSION_PATH", escapeHtml(cfg.sessionPath) + (cfg.sessionPathDerived ? " (derived)" : " (env)"));
  row("WS_PATH", escapeHtml(cfg.wsPath) + (cfg.wsPathDerived ? " (derived)" : " (env)"));
  row("SESSION_TTL", fmtDuration(cfg.sessionTtl * 1000));
  row("UP_BATCH_BYTES", String(cfg.upBatchBytes));
  row("DATA_CHUNK", String(cfg.dataChunk));
  row("MAX_ISOLATE_QUEUED", fmtBytes(cfg.maxIsolateQueued));
  row("LEGACY_PORT_SECRETS", cfg.legacyPortSecrets ? "<span class=\"badc\">enabled — cross-port secrets accepted</span>" : "disabled (strict port isolation)");
  row("USER_SECRETS", cfg.userSecrets.length ? escapeHtml(cfg.userSecrets.map((u) => u.label).join(", ")) : "unset");
  row("DC_OVERRIDE", cfg.dcOverrideApplied ? "active" : "unset (built-in DC list)");
  for (const issue of cfg.envIssues || []) row("validation", `<span class="badc">${escapeHtml(issue)}</span>`);
  for (const name of cfg.unknownEnv || []) row(escapeHtml(name), "<span class=\"badc\">unrecognized variable (check spelling)</span>");
  return rows.join("");
}

export async function serveStatus(cfg, host, lang, wantsProbe, probeResults, nonce, via) {
  STATS.statusViews++;
  logEvent("status_view", host);
  const probe = probeResults;
  const secretMode = cfg.secretDerived
    ? bi("derived from ADMIN_KEY (legacy)", "مشتق از ADMIN_KEY (قدیمی)")
    : bi("fixed SECRET", "SECRET ثابت");
  const infoRows = [
    [bi("Version", "نسخه"), escapeHtml(VERSION)],
    [bi("Carrier", "حامل"), escapeHtml(cfg.carrierResolved || cfg.carrier)],
    [bi("Secret mode", "حالت سکرت"), secretMode],
    [bi("Decoy brand", "برند فریب"), escapeHtml(cfg.brand.name)],
    [bi("Max streams per session", "حداکثر استریم در هر نشست"), String(cfg.maxStreams)]
  ].map((row) => `<tr><th>${row[0]}</th><td>${row[1]}</td></tr>`).join("");
  const statsRows = [
    [bi("Proxy sessions", "نشست‌های پروکسی"), String(STATS.sessions)],
    [bi("Active sessions (isolate)", "نشست‌های فعال (این ایزوله)"), String(STATS.sessionsActive)],
    [bi("Streams opened", "استریم‌های باز شده"), String(STATS.streams)],
    [bi("DC connects ok / failed", "اتصال‌های DC موفق / ناموفق"), (STATS.dcAttempts - STATS.dcFails) + " / " + STATS.dcFails],
    [bi("Traffic up / down", "ترافیک بالا / پایین"), fmtBytes(STATS.bytesUp) + " / " + fmtBytes(STATS.bytesDown)],
    [bi("Rejected WS tokens", "توکن‌های WebSocket ردشده"), String(STATS.wsRejects)],
    [bi("Isolate queued bytes (guard)", "بایت صف‌شده ایزوله (نگهبان)"), fmtBytes(MEMORY.queued) + " / " + fmtBytes(MEMORY.cap)],
    [bi("Isolate uptime", "مدت فعالیت این ایزوله"), fmtDuration(Date.now() - ISOLATE_START)]
  ].map((row) => `<tr><th>${row[0]}</th><td>${escapeHtml(row[1])}</td></tr>`).join("");
  const dcRows = Object.keys(cfg.dc).map(Number).sort((a, b) => a - b).map((dcKey) => {
    const ema = DC_EMA[dcKey];
    const last = DC_LAST_GOOD.get(dcKey);
    return `<tr><td>DC${dcKey}</td><td>${ema === undefined ? "—" : ema + " ms (EMA)"}</td><td>${last ? escapeHtml(last.ip + ":" + last.port) : "—"}</td></tr>`;
  }).join("");
  const dcBlock = `<div class="card"><b>${bi("DC connect performance", "کارایی اتصال به دیتاسنترها")}</b> <span class="muted">${bi("(per-isolate, ordering hints for failover)", "(مخصوص همین ایزوله، راهنمای ترتیب اتصال)")}</span><table><tr><th>DC</th><th>${bi("Latency", "تأخیر")}</th><th>${bi("Last good endpoint", "آخرین نقطه سالم")}</th></tr>${dcRows}</table></div>`;
  const cpuNote = `<div class="card muted">${bi(
    `"${STATS.cpuSuspect}" sessions ended by an abrupt socket error or a missing pong. These can be client network drops, isolate recycling, or the 10 ms CPU limit being hit (Cloudflare does not expose CPU exhaustion to the Worker — this counter is a weak indicator, not a measurement).`,
    `${STATS.cpuSuspect} نشست با خطای ناگهانی سوکت یا قطع پینگ تمام شده‌اند. ممکن است قطعی شبکه کاربر، بازیافت ایزوله یا رسیدن به سقف ۱۰ میلی‌ثانیه CPU باشد (کلودفلر اتمام CPU را به ورکر نشان نمی‌دهد — این شمارنده نشانه ضعیف است نه اندازه‌گیری).`
  )}</div>`;
  const probeBlock = probe
    ? `<div class="card"><b>${bi("DC reachability probe", "تست دسترسی به دیتاسنترها")}</b><table><tr><th>DC</th><th>IP</th><th>${bi("Result", "نتیجه")}</th></tr>${probe.map((r) => `<tr><td>DC${r.dc}</td><td>${escapeHtml(r.ip)}</td><td class="${r.ok ? "ok" : "badc"}">${r.ok ? "OK" : "FAIL"} (${r.ms} ms)</td></tr>`).join("")}</table></div>`
    : `<div class="card"><a class="plain" href="?probe=1">${bi("Run DC reachability probe", "اجرای تست دسترسی به دیتاسنترهای تلگرام")}</a><p class="muted">${bi("Opens and immediately closes one TCP socket per DC from this Cloudflare location.", "برای هر دیتاسنتر یک اتصال TCP از همین لوکیشن کلودفلر باز و بلافاصله بسته می‌شود.")}</p></div>`;
  const logRows = logSnapshot(60).map((e) => `<tr><td>${new Date(e.t).toISOString().slice(11, 19)}</td><td>${escapeHtml(e.event)}</td><td>${escapeHtml(e.detail)}</td></tr>`).join("");
  const logsBlock = `<div class="card"><b>${bi("Recent events", "رویدادهای اخیر")}</b> <span class="muted">${bi("(newest first, isolate memory only)", "(جدیدترین اول، فقط حافظه همین ایزوله)")}</span><table><tr><th>UTC</th><th>event</th><th>detail</th></tr>${logRows || `<tr><td colspan="3">-</td></tr>`}</table></div>`;
  const envBlock = `<div class="card"><b>${bi("Environment", "متغیرهای محیطی")}</b> <span class="muted">${bi("(values are never displayed)", "(مقادیر هرگز نمایش داده نمی‌شوند)")}</span><table><tr><th>${bi("Variable", "متغیر")}</th><th>${bi("State", "وضعیت")}</th></tr>${envReport(cfg)}</table></div>`;
  const body = `<h1>${bi("Proxy status", "وضعیت پروکسی")}</h1>
<div class="card muted">${bi(
    "Counters and logs are kept in this Cloudflare isolate only, reset when it is recycled, and are not shared between regions. No client IP addresses, tokens or secrets are recorded.",
    "شمارنده‌ها و لاگ‌ها فقط در حافظه همین ایزوله کلودفلر نگهداری می‌شوند، با بازیافت ایزوله صفر می‌شوند و بین منطقه‌ها مشترک نیستند. هیچ IP، توکن یا سکرتی ثبت نمی‌شود."
  )}</div>
<div class="card"><b>${bi("Configuration", "پیکربندی")}</b><table>${infoRows}</table></div>
<div class="card"><b>${bi("Live statistics", "آمار زنده")}</b><table>${statsRows}</table></div>
${dcBlock}${cpuNote}
${envBlock}
${probeBlock}
${logsBlock}`;
  return new Response(bilingualPage("Status", lang, body, nonce, COPY_SCRIPT), { status: 200, headers: pageHeaders(nonce) });
}

export { healthJson, faviconSvg };
