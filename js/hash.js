/**
 * hash.js
 * Custom hash encoder/decoder + small cryptographic-style utilities.
 *
 * - Multi-layer XOR + Base64 + byte-shift hash (v1, string mode).
 * - Structured object codec (v2, "ov2s$..." tokens) — compact, tamper-evident,
 *   field-aware, ideal for license / device / entitlement payloads.
 * - NOT a replacement for real crypto (bcrypt, scrypt, Web Crypto Subtle).
 * - Designed to be deterministic, reversible (since we need decode too),
 *   and salted by a per-app secret + user-provided salt.
 *
 * Pipeline (v1 string — encode):
 *   utf8(text) -> XOR each byte with rotating key stream (secret + salt)
 *              -> byte-shift left by N (positionally rotated)
 *              -> prefix with version + salt-hash + length
 *              -> Base64
 *
 * Pipeline (v2 structured — encode):
 *   payload object -> field-bitmap + length-prefixed UTF-8 values (compact)
 *                   -> 4-byte FNV-1a checksum prepended
 *                   -> XOR with rotating key stream (secret + salt + per-byte mix)
 *                   -> URL-safe Base64
 *
 * Token formats:
 *   v1 string :  v1$<salt>$<fnv8>$<base64>
 *   v2 struct :  ov2s$<salt>$<fnv8>$<urlsafe-base64>
 */

(function (global) {
  'use strict';

  // Per-app secret. In a real app this would come from build-time injection.
  const APP_SECRET = 'OV-SECURE-2026-!@#$%^&*()_+OFFLINE-VALIDATOR';

  const V1 = 'v1';
  const V2 = 'ov2s';
  const SHIFT_BASE = 7; // base byte shift (v1)

  /* ---------- Internal helpers ---------- */

  function toUtf8(str) {
    return new TextEncoder().encode(str);
  }

  function fromUtf8(bytes) {
    return new TextDecoder().decode(bytes);
  }

  function toBase64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function fromBase64(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // URL-safe Base64 (no padding) — shorter tokens
  function toUrlB64(bytes) {
    return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromUrlB64(s) {
    let t = s.replace(/-/g, '+').replace(/_/g, '/');
    while (t.length % 4) t += '=';
    return fromBase64(t);
  }

  // 32-bit FNV-1a checksum → 8-char hex
  function checksum32(bytes) {
    let c = 0x811c9dc5 >>> 0;
    for (let i = 0; i < bytes.length; i++) {
      c ^= bytes[i];
      c = Math.imul(c, 0x01000193) >>> 0;
    }
    return (c >>> 0).toString(16).padStart(8, '0');
  }

  // Build a per-byte key stream byte.
  // Mixes APP_SECRET + per-call salt + index + a "position mix" byte.
  function keystreamByte(secret, salt, i, positionMix) {
    const a = secret.charCodeAt(i % secret.length) || 0;
    const b = salt.charCodeAt(i % salt.length) || 0;
    const m = (positionMix || 0) & 0xff;
    return (((a * 31) ^ (b * 17) ^ (i * 53) ^ (m * 7)) & 0xff);
  }

  function randomSalt(len) {
    len = len || 8;
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let s = '';
    const buf = new Uint8Array(len);
    (global.crypto || global.msCrypto).getRandomValues(buf);
    for (let i = 0; i < len; i++) s += chars[buf[i] % chars.length];
    return s;
  }

  /* ---------- Public API ---------- */

  /**
   * Encode a string into a reversible hashed token.
   * @param {string} text
   * @param {string} [salt]  optional per-user salt
   * @returns {string} token
   */
  function encode(text, salt) {
    if (typeof text !== 'string') throw new TypeError('encode() expects a string');
    if (!salt) salt = randomSalt(8);

    const secret = APP_SECRET + ':' + salt;
    const src = toUtf8(text);
    const len = src.length;

    // [ver(2)][len(2)][saltHash(4)][xorBytes(len)]
    const out = new Uint8Array(len + 8);
    out[0] = V1.charCodeAt(0);
    out[1] = V1.charCodeAt(1);
    out[2] = len & 0xff;
    out[3] = (len >> 8) & 0xff;

    let saltH = 0;
    for (let i = 0; i < salt.length; i++) saltH = ((saltH << 5) - saltH + salt.charCodeAt(i)) | 0;
    out[4] = (saltH >>> 0) & 0xff;
    out[5] = (saltH >>> 8) & 0xff;
    out[6] = (saltH >>> 16) & 0xff;
    out[7] = (saltH >>> 24) & 0xff;

    for (let i = 0; i < len; i++) {
      let b = src[i];
      b ^= keystreamByte(secret, salt, i);
      const shift = (SHIFT_BASE + (i % 5)) & 7;
      b = ((b << shift) | (b >>> (8 - shift))) & 0xff;
      out[8 + i] = b;
    }

    const payload = toBase64(out);
    const sum = checksum32(out);
    return `${V1}$${salt}$${sum}$${payload}`;
  }

  function decode(token, expectedSalt) {
    if (typeof token !== 'string') return null;
    const parts = token.split('$');
    if (parts.length !== 4) return null;
    const [ver, salt, sum, payload] = parts;
    if (ver !== V1) return null;
    if (expectedSalt && salt !== expectedSalt) return null;

    let bytes;
    try { bytes = fromBase64(payload); } catch (_) { return null; }
    if (bytes.length < 8) return null;
    if (bytes[0] !== V1.charCodeAt(0) || bytes[1] !== V1.charCodeAt(1)) return null;

    const computed = checksum32(bytes);
    if (computed !== sum) return null;

    const len = (bytes[3] << 8) | bytes[2];
    if (len !== bytes.length - 8) return null;

    const secret = APP_SECRET + ':' + salt;
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      let b = bytes[8 + i];
      const shift = (SHIFT_BASE + (i % 5)) & 7;
      b = ((b >>> shift) | (b << (8 - shift))) & 0xff;
      b ^= keystreamByte(secret, salt, i);
      out[i] = b;
    }
    return fromUtf8(out);
  }

  /* ============================================================
     V2 — STRUCTURED OBJECT MODE (the new powerful system)
     ============================================================ */

  // Schema: 8 known fields in fixed order. Bit i of the bitmask = field i present.
  // kind: 'string' = 1-byte length + UTF-8 bytes
  //       'uint'   = 4 bytes little-endian
  //       'flags'  = 1-byte count + N×1-byte tag (deterministic 8-bit hash of name)
  const SCHEMA = [
    { key: 'entity',  type: 'string', label: 'Entity / User / Device ID',  hint: 'user-9821, dev-laptop-x9, …',          required: true,  kind: 'string' },
    { key: 'product', type: 'string', label: 'Product / Application ID',    hint: 'offline-validator, my-saas-app',       required: true,  kind: 'string' },
    { key: 'version', type: 'uint',   label: 'Version',                      hint: '1, 2, 42 — numeric only',              required: true,  kind: 'uint'   },
    { key: 'issued',  type: 'uint',   label: 'Issued (unix timestamp)',      hint: '1717353600  (sec since 1970)',         required: true,  kind: 'uint'   },
    { key: 'expires', type: 'uint',   label: 'Expiry (optional)',            hint: '1717353600 — leave blank to skip',     required: false, kind: 'uint'   },
    { key: 'plan',    type: 'string', label: 'Plan / Role / Validation type', hint: 'pro, admin, device, trial, …',        required: false, kind: 'string' },
    { key: 'flags',   type: 'flags',  label: 'Feature flags',                hint: 'comma-separated: api,export,beta',     required: false, kind: 'flags'  },
    { key: 'serial',  type: 'string', label: 'Unique serial / License ID',  hint: 'LIC-9821-XK4Q-9F2N',                   required: true,  kind: 'string' },
  ];

  function payloadTemplate() { return SCHEMA; }

  // --- Value packers ----------------------------------------------------

  function packString(s) {
    const bytes = toUtf8(String(s == null ? '' : s));
    if (bytes.length > 255) return new Uint8Array([0xff, ...bytes.slice(0, 255)]);
    return new Uint8Array([bytes.length, ...bytes]);
  }
  function unpackString(bytes, offset) {
    const len = bytes[offset];
    if (len === 0xff) {
      return { value: fromUtf8(bytes.slice(offset + 1, offset + 1 + 255)), next: offset + 256 };
    }
    return { value: fromUtf8(bytes.slice(offset + 1, offset + 1 + len)), next: offset + 1 + len };
  }

  function packUint(n) {
    n = Math.max(0, Math.min(0xffffffff, Math.floor(Number(n) || 0))) | 0;
    return new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
  }
  function unpackUint(bytes, offset) {
    const v = (bytes[offset] | (bytes[offset+1] << 8) | (bytes[offset+2] << 16) | (bytes[offset+3] << 24)) >>> 0;
    return { value: v, next: offset + 4 };
  }

  function packFlags(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return new Uint8Array([0]);
    const tags = arr.slice(0, 32).map(f => {
      let h = 0x2a;
      const s = String(f);
      for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) & 0xff;
      return h || 1;
    });
    return new Uint8Array([tags.length, ...tags]);
  }
  function unpackFlags(bytes, offset, flagNames) {
    const n = bytes[offset];
    const tags = Array.from(bytes.slice(offset + 1, offset + 1 + n));
    const names = (flagNames && flagNames.length)
      ? tags.map(t => flagNames.find(f => {
          let h = 0x2a;
          for (let i = 0; i < f.length; i++) h = ((h << 5) - h + f.charCodeAt(i)) & 0xff;
          return (h & 0xff) === t;
        }) || `flag_${t.toString(16)}`)
      : tags.map(t => `flag_${t.toString(16)}`);
    return { value: names, next: offset + 1 + n };
  }

  // --- Object pack / unpack --------------------------------------------

  function packPayload(obj) {
    const buf = [];
    let bitmask = 0;
    const flagsArr = (obj && Array.isArray(obj.flags)) ? obj.flags
                   : (typeof obj?.flags === 'string' ? obj.flags.split(',').map(s => s.trim()).filter(Boolean)
                   : []);
    SCHEMA.forEach((field, i) => {
      const v = obj ? obj[field.key] : null;
      const has = v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
      if (!has) return;
      bitmask |= (1 << i);
      if (field.kind === 'string') buf.push(...packString(v));
      else if (field.kind === 'uint') buf.push(...packUint(v));
      else if (field.kind === 'flags') buf.push(...packFlags(flagsArr));
    });
    const out = new Uint8Array(2 + buf.length);
    out[0] = 0x02; // v2 marker
    out[1] = bitmask & 0xff;
    out.set(buf, 2);
    return { bytes: out, bitmask, flagsArr };
  }

  function unpackPayload(bytes, flagNames) {
    if (bytes.length < 2) return null;
    if (bytes[0] !== 0x02) return null;
    const bitmask = bytes[1];
    const out = {};
    let off = 2;
    for (let i = 0; i < SCHEMA.length; i++) {
      if (!(bitmask & (1 << i))) continue;
      const field = SCHEMA[i];
      if (off >= bytes.length) return null;
      let r;
      if (field.kind === 'string') r = unpackString(bytes, off);
      else if (field.kind === 'uint') r = unpackUint(bytes, off);
      else if (field.kind === 'flags') r = unpackFlags(bytes, off, flagNames);
      else return null;
      out[field.key] = r.value;
      off = r.next;
    }
    out._bitmask = bitmask;
    return out;
  }

  // --- v2 encode / decode ----------------------------------------------

  function structEncode(obj, opts) {
    opts = opts || {};
    if (!obj || typeof obj !== 'object') throw new TypeError('structEncode() expects an object');
    const salt = opts.salt || randomSalt(8);
    const secret = APP_SECRET + ':' + salt;

    const { bytes, flagsArr } = packPayload(obj);
    const sum = checksum32(bytes);
    const sumBytes = new Uint8Array(4);
    for (let i = 0; i < 4; i++) sumBytes[i] = parseInt(sum.slice(i * 2, i * 2 + 2), 16);

    // Avalanche: each cipher byte depends on the checksum (which is in
    // the token), the secret, the salt, and the byte's position. We
    // deliberately do NOT mix in the plaintext byte here, because that
    // would make the decode undecidable without a fixed-point solver.
    // The FNV-1a checksum (4 bytes) and 8-byte salt are the binding
    // factor — flipping a ciphertext byte breaks the FNV check.
    const cipher = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      const k = keystreamByte(secret, salt, i, sumBytes[i % 4]);
      cipher[i] = (b ^ k) & 0xff;
    }

    const b64 = toUrlB64(cipher);
    return {
      token: `${V2}$${salt}$${sum}$${b64}`,
      salt, checksum: sum, bitmask: bytes[1],
      bytes: cipher, flags: flagsArr,
    };
  }

  function structDecode(token, expectedSalt, flagNames) {
    if (typeof token !== 'string') return null;
    const parts = token.split('$');
    if (parts.length !== 4) return null;
    const [ver, salt, sum, payload] = parts;
    if (ver !== V2) return null;
    if (expectedSalt && salt !== expectedSalt) return null;

    let cipher;
    try { cipher = fromUrlB64(payload); } catch (_) { return null; }
    if (cipher.length < 2) return null;

    const secret = APP_SECRET + ':' + salt;
    const sumBytes = new Uint8Array(4);
    for (let i = 0; i < 4; i++) sumBytes[i] = parseInt(sum.slice(i * 2, i * 2 + 2), 16);

    // Decode: each byte = cipher XOR keystream, where keystream depends
    // on position + checksum-byte + secret + salt. No fixed-point needed.
    const plain = new Uint8Array(cipher.length);
    for (let i = 0; i < cipher.length; i++) {
      const k = keystreamByte(secret, salt, i, sumBytes[i % 4]);
      plain[i] = (cipher[i] ^ k) & 0xff;
    }

    const computed = checksum32(plain);
    if (computed !== sum) return null;

    const obj = unpackPayload(plain, flagNames);
    if (!obj) return null;
    return { payload: obj, salt, checksum: sum, bitmask: obj._bitmask };
  }

  function structVerify(token, expectedSalt) {
    return structDecode(token, expectedSalt) !== null;
  }

  /**
   * Deterministic encode — same input + salt = same token. Useful for
   * license-key generation where you want reproducible output.
   */
  function structEncodeDeterministic(obj, salt) {
    if (!salt) salt = randomSalt(8);
    return structEncode(obj, { salt });
  }

  /**
   * Generate a single .ovlicense payload object containing the token
   * plus the visible (unencrypted) metadata so the file is human-readable.
   */
  function makeLicenseFile(obj, opts) {
    opts = opts || {};
    const r = structEncode(obj, { salt: opts.salt });
    return {
      fileType: 'ovlicense',
      version: 1,
      schema: 'ovstruct-v1',
      generatedAt: new Date().toISOString(),
      token: r.token,
      payload: { ...obj, _salt: r.salt, _bitmask: r.bitmask, _checksum: r.checksum },
    };
  }

  /**
   * Verify a candidate matches a stored v1 token (constant-ish compare).
   */
  function verify(storedToken, candidate, salt) {
    const decoded = decode(storedToken, salt);
    if (decoded === null) return false;
    if (decoded.length !== candidate.length) return false;
    let diff = 0;
    for (let i = 0; i < decoded.length; i++) diff |= decoded.charCodeAt(i) ^ candidate.charCodeAt(i);
    return diff === 0;
  }

  /** Quick one-way-ish digest for non-reversible fingerprints (e.g. password-hash hint). */
  function digest(text, salt) {
    return encode(text, salt).split('$').slice(0, 3).join('$');
  }

  // Export
  global.OVHash = {
    // v1 string API (backwards compatible)
    encode, decode, verify, digest,
    V1,

    // v2 structured API (new, powerful)
    structEncode, structDecode, structVerify,
    structEncodeDeterministic,
    makeLicenseFile,
    payloadTemplate: payloadTemplate,
    V2,
    SCHEMA,

    // utilities
    checksum32,
    randomSalt,
  };
})(window);
