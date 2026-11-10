// Server-side QR code generation for the panel (R2).
// Uses qrcode-generator (MIT, bundled at build time) and returns inline SVG
// markup; no external requests, works under the panel CSP.
import qrcode from "qrcode-generator";

export function qrSvg(text) {
  try {
    const qr = qrcode(0, "M");
    qr.addData(String(text));
    qr.make();
    return qr.createSvgTag({ cellSize: 3, margin: 2, scalable: true });
  } catch (_) {
    return "";
  }
}
