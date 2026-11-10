// ProxyGosha runtime constants. Single source of truth for the built worker.
export const VERSION = "1.3.0";

// Plain-text attribution (S7): the old XOR-obfuscated BUILD_SEAL is retired from
// key derivation; the credit is now just a constant. Legacy-mode derivations
// still consume the historical seal bytes to remain byte-identical with v1.2.2.
export const CREDIT_NAME = "Amir Marandi";
export const CREDIT_MAIL = "amirmarandidev@gmail.com";

// Historical seal: ONLY used to reproduce the v1.2.2 legacy secret derivation
// (sha256("proxygosha-secret-from-admin-v2\n" + sealBytes + "\n" + adminKey)).
// New-mode derivations never touch these bytes (S7).
export const LEGACY_SEAL_B64 = "Pt54F2/pkjqM1YnQmZRs3Xvqd54U1iZVSYCfYAOgf5wIRzjyeruT";

export const HTTPS_PORTS = [443, 2053, 2083, 2087, 2096, 8443];
export const PORT_MODE_BASE = 10;
export const USER_MODE_BASE = 20;
export const USER_MODE_LIMIT = 16;      // max per-user secrets (verifies stay bounded)
export const TOKEN_KIND_BOOTSTRAP = 1;
export const TOKEN_KIND_SESSION = 2;
export const REQUEST_LIMIT = 16777216;

// Legacy fixed API paths: accepted for one release alongside the derived ones (S2).
export const LEGACY_SESSION_PATH = "/api/v1/session";
export const LEGACY_WS_PATH = "/api/v1/ws";

export const TOKEN_DOMAIN = new TextEncoder().encode("tgweb-token-v1\0");

// Domain-separation string that replaces BUILD_SEAL bytes in all new-mode
// derivations (S7). Public constant, unique purpose.
export const KDF_DOMAIN = new TextEncoder().encode("proxygosha-kdf-v3\0");

export const PERMISSIONS_POLICY = "accelerometer=(), autoplay=(), camera=(), clipboard-read=(self), clipboard-write=(self), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), hid=(), idle-detection=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-create=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), usb=(), web-share=(), xr-spatial-tracking=()";
