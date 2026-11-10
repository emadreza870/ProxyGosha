# Middle-End (ME) Protocol Notes — why sponsored channels are impossible here

> R4: این سند جایگزین کامنت ~۱۰۰ خطی تحقیقاتی در `worker.js` v1.2.2 است. محتوای فنی بدون تغییر حفظ شده تا مرجع آینده باشد.
> (This file preserves the v1.2.2 in-code research summary verbatim in substance; the code now stays lean.)

## 1. Reference Architecture & Telego (v0.6.8) WEB Mode

- Telegram Desktop (TDesktop) native "WEB" proxy mode uses an embedded WebView carrier that
  establishes an HTTPS/WSS link on port 443.
- The carrier (primary: `websocket`) multiplexes MTProto streams inside binary frames:
  OPEN (0x01), DATA (0x02), CLOSE (0x03), WINDOW (0x04).
- Each logical stream carries a 64-byte Obfuscated2 client header. The proxy decrypts the tail
  with the shared secret to obtain the protocol tag (0xefefefef abridged, 0xeeeeeeee intermediate,
  0xdddddddd padded) and destination DC ID.
- In Direct-DC mode (Telego fallback and this Worker): the proxy establishes a raw TCP socket
  directly to Telegram's DC frontends (e.g., DC2: 149.154.167.51:443) using `cloudflare:sockets`,
  generates a fresh DC Obfuscated2 header, and pipes encrypted MTProto payloads bi-directionally
  with flow control.

## 2. Middle-End (ME) Routing & Ad Tag (Sponsored Channel) Protocol

- Official MTProxy (TelegramMessenger/MTProxy) and Telego route traffic to Telegram's Middle-End
  (ME) servers (from https://core.telegram.org/getProxyConfig) to support sponsored channels
  (Ad Tags issued by @MTProxybot, 32 hex chars / 16 bytes).
- In the ME protocol, client data is encapsulated inside RPC frames:
  RPC_PROXY_REQ (0x36cef1ee) with flags (bit 3: FLAG_HAS_AD_TAG = 0x8). When FLAG_HAS_AD_TAG is
  set, the 16-byte ad tag is appended to the RPC header.
- Direct-DC servers (port 443) DO NOT accept RPC_PROXY_REQ or proxy tags; sponsored channels can
  ONLY be attached over an authenticated Middle-End session.

## 3. The Fatal Blocker: NAT & IP/Port Binding in Middle-End Handshake

- When connecting to Telegram's ME servers (port 8888), both sides execute an RPC crypto handshake:
  - Step 1: Exchange 32-byte RPC_NONCE packets (RPC_NONCE 0x7acb87aa, CRYPTO_AES 0x1,
    key_selector from proxy-secret, crypto_ts, and 16-byte client/server nonces).
  - Step 2: Derive AES-256-CBC session keys using:
    `s = nonce_srv + nonce_clt + clt_ts + srv_ip + clt_port + purpose + clt_ip + srv_port + middleproxy_secret + nonce_srv + nonce_clt`
    `key = md5(s[1:])[:12] + sha1(s)`; `iv = md5(s[2:])`
  - Step 3: Client sends encrypted RPC_HANDSHAKE (0x7682eef5).
- CRITICAL OBSERVATION: Telegram's ME server extracts `clt_ip` (4 bytes) and `clt_port` (2 bytes)
  from the INCOMING TCP SOCKET (as observed on Telegram's network interface).
- Telego documentation (docs/middle-end.md) explicitly warns: "Private direct sockets require UDP
  access to STUN or a properly configured nat-ip, and any intermediate NAT for direct connections
  must preserve outgoing TCP ports."
- In Cloudflare Workers:
  - (a) Outbound TCP connections via `cloudflare:sockets` exit through Cloudflare's Anycast edge
    egress infrastructure under Carrier-Grade NAT / NAPT.
  - (b) The egress IP is dynamically selected from Cloudflare's shared pool and the outbound TCP
    source port is dynamically translated by Cloudflare's NAT.
  - (c) `cloudflare:sockets` exposes ONLY `SocketInfo { remoteAddress, localAddress }`. It DOES NOT
    expose localPort, nor does it allow port binding.
  - (d) Workers cannot execute raw UDP sockets for STUN detection.
  - Consequently, the Worker cannot know what outbound TCP port Telegram's server will observe.
    The derived keys mathematically mismatch, and Telegram's ME server immediately drops the
    connection on the first frame.
- HONESTY CONCLUSION (Stop Condition): native Middle-End handshake directly from a Cloudflare
  Worker is physically impossible without an external egress helper that preserves source IP and
  port. Attempting to fake this would break proxy connectivity. Direct-DC mode remains the only
  reliable, zero-cost transport on Cloudflare Workers.

## 4. Crypto Primitives & Workers Capabilities

- Web Crypto in Workers (workerd) natively supports MD5 via `crypto.subtle.digest("MD5", ...)` (as
  documented for the ME handshake above — unused in Direct-DC mode).
- Web Crypto supports SHA-1, SHA-256, and AES-CTR (used for Obfuscated2).
- Web Crypto AES-CBC strictly enforces PKCS#7 padding. While encryption can drop the trailing
  padding block for 16-byte aligned inputs, decryption of arbitrary unpadded network streams from
  Telegram throws OperationError.

## 5. UNVERIFIED aspects (carried over from v1.2.2, still true in 1.3.0)

- [UNVERIFIED] Whether Cloudflare will in the future expose localPort on SocketInfo or provide
  dedicated egress IP/port reservation in Workers.
- [UNVERIFIED] Whether Telegram will ever deploy a modified ME transport protocol (e.g., over
  WebSockets or TLS) that omits TCP source port binding from key derivation.

## 6. F8 — Placement Hints (experiment, UNVERIFIED, not enabled by default)

Cloudflare exposes a Wrangler-only experiment called **Smart Placement** via the
`placement` key (`"placement": { "mode": "smart" }` in `wrangler.jsonc`); the
older `@cf` `placement.host` / `placement.region` hints appeared in early
docs/community posts. For a proxy like ProxyGosha, placement could in theory
shorten the Worker→Telegram-DC leg, but:

- [UNVERIFIED] Placement decisions are made by Cloudflare and are not
  controllable per-DC; a placement far from users can worsen the more important
  client→Worker leg (Iran egress).
- [UNVERIFIED] Whether Smart Placement applies to WebSocket-heavy, socket-bound
  workloads at all (its heuristics target data-heavy fetch workloads).
- Free plan applicability is not clearly documented.

**Verdict:** documented as an experiment only. Do NOT enable by default. If you
experiment, compare `/panel/status` DC EMA and client latency before/after.
