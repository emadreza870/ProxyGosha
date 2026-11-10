// Crypto primitives: ctrAt (incl. unaligned positions), add128, parseSecret.
// Anchored against NIST SP 800-38A F.5.5 CTR-AES256.
import { describe, it, expect } from "vitest";
import { ctrAt, add128, parseSecret, sha256 } from "../src/crypto.js";
import { concat, hexToBytes, bytesToHex } from "../src/util.js";

const NIST_KEY = hexToBytes("603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4");
const NIST_IV = hexToBytes("f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff");

async function nistKey() {
  const { importAes } = await import("../src/crypto.js");
  return importAes(NIST_KEY);
}

describe("ctrAt", () => {
  it("matches the NIST SP 800-38A CTR-AES256 first block", async () => {
    const key = await nistKey();
    const data = hexToBytes("6bc1bee22e409f96e93d7e117393172a");
    const out = await ctrAt(key, NIST_IV, 0, data);
    expect(bytesToHex(out)).toBe("601ec313775789a5b7a7f504bbf3d228");
  });

  it("matches the NIST second block at offset 16 (aligned jump)", async () => {
    const key = await nistKey();
    const data = hexToBytes("ae2d8a571e03ac9c9eb76fac45af8e51"); // plaintext block 2
    const out = await ctrAt(key, NIST_IV, 16, data);
    expect(bytesToHex(out)).toBe("f443e3ca4d62b59aca84e990cacaf5c5");
  });

  it("handles unaligned positions correctly (keystream continuity)", async () => {
    const key = await nistKey();
    // Raw keystream: CTR encryption of all-zero bytes.
    const zeros = new Uint8Array(32);
    const ks = await ctrAt(key, NIST_IV, 0, zeros);
    for (const pos of [1, 5, 7, 15]) {
      const data = crypto.getRandomValues(new Uint8Array(32 - pos));
      const part = await ctrAt(key, NIST_IV, pos, data);
      const expected = new Uint8Array(data.length);
      for (let i = 0; i < data.length; i++) expected[i] = ks[pos + i] ^ data[i];
      expect(bytesToHex(part)).toBe(bytesToHex(expected));
    }
  });

  it("satisfies the concatenation property at unaligned positions", async () => {
    const key = await nistKey();
    const a = crypto.getRandomValues(new Uint8Array(37));
    const b = crypto.getRandomValues(new Uint8Array(91));
    const joined = await ctrAt(key, NIST_IV, 23, concat(a, b));
    const partA = await ctrAt(key, NIST_IV, 23, a);
    const partB = await ctrAt(key, NIST_IV, 23 + a.length, b);
    expect(bytesToHex(joined)).toBe(bytesToHex(concat(partA, partB)));
  });

  it("round-trips through add128 counters", async () => {
    const key = await nistKey();
    const data = crypto.getRandomValues(new Uint8Array(1000));
    const whole = await ctrAt(key, NIST_IV, 0, data);
    const halves = concat(
      await ctrAt(key, NIST_IV, 0, data.subarray(0, 512)),
      await ctrAt(key, NIST_IV, 512, data.subarray(512))
    );
    expect(bytesToHex(whole)).toBe(bytesToHex(halves));
  });
});

describe("add128", () => {
  it("increments across carry boundaries", () => {
    const iv = hexToBytes("00000000000000000000000000000000");
    expect(bytesToHex(add128(iv, 1))).toBe("00000000000000000000000000000001");
    expect(bytesToHex(add128(iv, 0xffffffff))).toBe("000000000000000000000000ffffffff");
    const near = hexToBytes("000000000000000000000000000000ff");
    expect(bytesToHex(add128(near, 2))).toBe("00000000000000000000000000000101");
  });
});

describe("parseSecret", () => {
  it("accepts 32-hex, dd-prefixed and 64-hex forms; rejects junk", () => {
    expect(parseSecret("00112233445566778899aabbccddeeff")).toEqual(hexToBytes("00112233445566778899aabbccddeeff"));
    expect(parseSecret("dd00112233445566778899aabbccddeeff")).toEqual(hexToBytes("00112233445566778899aabbccddeeff"));
    expect(parseSecret("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff")).toHaveLength(32);
    expect(parseSecret("xyz")).toBeNull();
    expect(parseSecret("00112")).toBeNull();
    expect(parseSecret("")).toBeNull();
    expect(parseSecret(undefined)).toBeNull();
  });
});

describe("sha256", () => {
  it("produces the standard digest", async () => {
    const out = await sha256(new TextEncoder().encode("abc"));
    expect(bytesToHex(out)).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});
