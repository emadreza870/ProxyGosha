// Test-time stub for the cloudflare:sockets seam (integration tests never
// open real sockets; Stream.init is not exercised here).
export const connect = () => {
  throw new Error("sockets are stubbed in tests");
};
export default { connect };
