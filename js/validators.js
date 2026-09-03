/**
 * validators.js
 * Pure, offline validators. Each returns { valid, reason?, meta? }.
 */
(function (global) {
  'use strict';

  const RE = {
    email: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
    ipv4: /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/,
    ipv6: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$|^fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+$|^::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])$|^([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])$/,
    hexColor: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
    rgbColor: /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/i,
    hslColor: /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/i,
    slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    username: /^[a-zA-Z0-9_-]{3,20}$/,
    semver: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
    uuid: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    base64: /^[A-Za-z0-9+/]*={0,2}$/,
    md5: /^[a-f0-9]{32}$/i,
    sha1: /^[a-f0-9]{40}$/i,
    sha256: /^[a-f0-9]{64}$/i,
    sha512: /^[a-f0-9]{128}$/i,
  };

  // ------------------ Individual validators ------------------

  function email(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'Email is required' };
    const val = String(v).trim();
    if (val.length > 254) return { valid: false, reason: 'Too long (max 254 characters)' };
    if (!RE.email.test(val) || /\.\./.test(val)) return { valid: false, reason: 'Not a valid email format' };
    const parts = val.split('@');
    return { valid: true, meta: { local: parts[0], domain: parts[1] } };
  }

  function phone(v, country = 'auto') {
    if (!v || !String(v).trim()) return { valid: false, reason: 'Phone is required' };
    const val = String(v).trim();
    const rawDigits = val.replace(/\D/g, '');

    // Detect Indian number or explicit IN country
    if (country === 'IN' || (country === 'auto' && (/^(\+?91[\-\s]?)?[6-9]\d{9}$/.test(val.replace(/\s|-/g, '')) || (!val.startsWith('+') && rawDigits.length === 10 && /^[6-9]/.test(rawDigits))))) {
      const cleanIn = val.replace(/\s|-/g, '');
      if (/^(\+?91[\-\s]?)?[6-9]\d{9}$/.test(cleanIn) || (/^[6-9]\d{9}$/.test(rawDigits) && rawDigits.length === 10)) {
        return { valid: true, meta: { country: 'India (+91)', number: rawDigits.slice(-10) } };
      }
    }

    // International E.164 (7-15 digits)
    if (rawDigits.length >= 7 && rawDigits.length <= 15) {
      return { valid: true, meta: { format: 'International (E.164)', digits: rawDigits.length } };
    }
    return { valid: false, reason: 'Phone length must be 7-15 digits' };
  }

  function url(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'URL is required' };
    const val = String(v).trim();
    try {
      const u = new URL(val);
      if (!['http:', 'https:', 'ftp:'].includes(u.protocol)) {
        return { valid: false, reason: 'Protocol must be http, https, or ftp' };
      }
      return { valid: true, meta: { host: u.host, protocol: u.protocol, path: u.pathname || '/' } };
    } catch (_) {
      return { valid: false, reason: 'Not a valid URL (must include http:// or https://)' };
    }
  }

  function password(v) {
    if (!v) return { valid: false, reason: 'Password is required' };
    if (v.length < 8) return { valid: false, reason: 'Must be at least 8 characters' };
    if (v.length > 128) return { valid: false, reason: 'Must be ≤ 128 characters' };
    let score = 0;
    if (/[a-z]/.test(v)) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    if (v.length >= 12) score++;
    const strength = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][score];
    if (score < 2) return { valid: false, reason: 'Too weak (use uppercase, numbers, symbols)', meta: { score, strength } };
    return { valid: true, meta: { score, strength } };
  }

  function username(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'Username is required' };
    const val = String(v).trim();
    if (!RE.username.test(val)) return { valid: false, reason: '3-20 chars, letters/numbers/_/- only' };
    return { valid: true, meta: { length: val.length } };
  }

  function ipv4(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'IP is required' };
    const val = String(v).trim();
    if (!RE.ipv4.test(val)) return { valid: false, reason: 'Not a valid IPv4 address' };
    const p = val.split('.').map(Number);
    const isPrivate = (p[0] === 10) || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168) || (p[0] === 127);
    return { valid: true, meta: { scope: isPrivate ? 'Private / Local' : 'Public IPv4' } };
  }

  function ipv6(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'IP is required' };
    const val = String(v).trim();
    if (!RE.ipv6.test(val)) return { valid: false, reason: 'Not a valid IPv6 address' };
    return { valid: true, meta: { scope: val === '::1' ? 'Loopback' : 'IPv6' } };
  }

  function date(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'Date is required' };
    const val = String(v).trim();
    const d = new Date(val);
    if (isNaN(d.getTime())) return { valid: false, reason: 'Not a valid parseable date' };
    return { valid: true, meta: { iso: d.toISOString(), timestamp: d.getTime() } };
  }

  function color(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'Color is required' };
    const val = String(v).trim();
    if (RE.hexColor.test(val)) return { valid: true, meta: { format: 'HEX' } };
    if (RE.rgbColor.test(val)) return { valid: true, meta: { format: 'RGB' } };
    if (RE.hslColor.test(val)) return { valid: true, meta: { format: 'HSL' } };
    try {
      if (typeof document !== 'undefined') {
        const s = new Option().style;
        s.color = val;
        if (s.color !== '') return { valid: true, meta: { format: 'Named CSS color', rendered: s.color } };
      }
    } catch (_) {}
    return { valid: false, reason: 'Not a valid color (hex, rgb, hsl, or CSS name)' };
  }

  function hex(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'Hex is required' };
    const t = String(v).trim().replace(/^0x/i, '');
    if (t.length === 0) return { valid: false, reason: 'Hex digits required' };
    if (!/^[0-9a-fA-F]+$/.test(t)) return { valid: false, reason: 'Contains non-hex characters' };
    return { valid: true, meta: { bytes: Math.ceil(t.length / 2), nibbles: t.length } };
  }

  function creditCard(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'Card number is required' };
    const digits = String(v).replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) {
      return { valid: false, reason: 'Length must be 13-19 digits' };
    }
    // Luhn algorithm
    let sum = 0, alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = +digits[i];
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    if (sum % 10 !== 0) return { valid: false, reason: 'Failed Luhn checksum' };
    let brand = 'Unknown';
    if (/^4/.test(digits)) brand = 'Visa';
    else if (/^(5[1-5]|2[2-7])/.test(digits)) brand = 'Mastercard';
    else if (/^3[47]/.test(digits)) brand = 'Amex';
    else if (/^(6011|65)/.test(digits)) brand = 'Discover';
    else if (/^35/.test(digits)) brand = 'JCB';
    return { valid: true, meta: { brand, last4: '•••• ' + digits.slice(-4) } };
  }

  function json(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'JSON is required' };
    try {
      const parsed = JSON.parse(v);
      const type = Array.isArray(parsed) ? 'array' : (parsed === null ? 'null' : typeof parsed);
      const count = (parsed && typeof parsed === 'object') ? Object.keys(parsed).length : null;
      return { valid: true, meta: { type, ...(count !== null ? { properties: count } : {}) } };
    } catch (e) {
      return { valid: false, reason: e.message };
    }
  }

  function base64(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'Base64 is required' };
    const val = String(v).trim();
    if (!RE.base64.test(val) || val.length % 4 !== 0) return { valid: false, reason: 'Invalid base64 characters or length' };
    try {
      const decoded = atob(val);
      return { valid: true, meta: { decodedBytes: decoded.length } };
    } catch (_) {
      return { valid: false, reason: 'Failed to decode' };
    }
  }

  function uuid(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'UUID is required' };
    const val = String(v).trim();
    if (!RE.uuid.test(val)) return { valid: false, reason: 'Not a valid UUID format' };
    const ver = val.charAt(14);
    return { valid: true, meta: { version: `v${ver}` } };
  }

  function hash(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'Hash is required' };
    const val = String(v).trim();
    if (RE.md5.test(val))    return { valid: true, meta: { algorithm: 'MD5',    bits: 128 } };
    if (RE.sha1.test(val))   return { valid: true, meta: { algorithm: 'SHA-1',  bits: 160 } };
    if (RE.sha256.test(val)) return { valid: true, meta: { algorithm: 'SHA-256',bits: 256 } };
    if (RE.sha512.test(val)) return { valid: true, meta: { algorithm: 'SHA-512',bits: 512 } };
    return { valid: false, reason: 'Unrecognized hash (must be MD5, SHA-1, SHA-256, or SHA-512)' };
  }

  function slug(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'Slug is required' };
    const val = String(v).trim();
    if (!RE.slug.test(val)) return { valid: false, reason: 'Lowercase letters, digits and dashes only' };
    return { valid: true, meta: { segments: val.split('-').length } };
  }

  function semver(v) {
    if (!v || !String(v).trim()) return { valid: false, reason: 'Version is required' };
    const val = String(v).trim().replace(/^v/i, '');
    if (!RE.semver.test(val)) return { valid: false, reason: 'Not a valid semver (e.g. 1.2.3, 2.0.0-beta.1)' };
    const p = val.split('.');
    return { valid: true, meta: { major: p[0], minor: p[1], patch: p[2] } };
  }

  function number(v) {
    if (v === '' || v === null || v === undefined) return { valid: false, reason: 'Number is required' };
    const n = Number(String(v).trim());
    if (isNaN(n)) return { valid: false, reason: 'Not a number' };
    if (!isFinite(n)) return { valid: false, reason: 'Number must be finite' };
    return { valid: true, meta: { value: n, integer: Number.isInteger(n) } };
  }

  function range(v, min, max) {
    const r = number(v);
    if (!r.valid) return r;
    if (typeof min === 'number' && r.meta.value < min) return { valid: false, reason: `Must be ≥ ${min}` };
    if (typeof max === 'number' && r.meta.value > max) return { valid: false, reason: `Must be ≤ ${max}` };
    return r;
  }

  function regex(v, pattern) {
    if (!v) return { valid: false, reason: 'Value is required' };
    try {
      const re = new RegExp(pattern);
      return { valid: re.test(v), reason: re.test(v) ? null : 'Does not match pattern' };
    } catch (_) {
      return { valid: false, reason: 'Invalid regex pattern' };
    }
  }

  /* ---- Registry ---- */
  const VALIDATORS = {
    email:       { name: 'Email',           icon: '✉️', fn: email,       placeholder: 'user@example.com',     help: 'Validates RFC 5322 email syntax and domain format', category: 'network' },
    phone:       { name: 'Phone',           icon: '📱', fn: phone,       placeholder: '+91 98765 43210',     help: 'Supports international E.164 and Indian numbers', category: 'text' },
    url:         { name: 'URL',             icon: '🔗', fn: url,         placeholder: 'https://example.com',  help: 'Validates standard web protocols (http, https, ftp)', category: 'network' },
    password:    { name: 'Password',        icon: '🔒', fn: password,    placeholder: 'Min 8 chars + variety',help: 'Heuristic strength meter (0-5 score)', category: 'security', hasStrength: true, sensitive: true },
    username:    { name: 'Username',        icon: '👤', fn: username,    placeholder: 'your_name_123',        help: '3-20 alphanumeric characters, underscores or dashes', category: 'text' },
    ipv4:        { name: 'IPv4',            icon: '🌐', fn: ipv4,        placeholder: '192.168.1.1',          help: 'Dotted quad IPv4 address format with scope detection', category: 'network' },
    ipv6:        { name: 'IPv6',            icon: '🌐', fn: ipv6,        placeholder: '2001:db8::1',          help: 'Standard 8-group hexadecimal IPv6 notation', category: 'network' },
    date:        { name: 'Date',            icon: '📅', fn: date,        placeholder: '2026-03-09',           help: 'Any standard ISO or parseable calendar date', category: 'formats' },
    color:       { name: 'Color',           icon: '🎨', fn: color,       placeholder: '#6366f1 or rgb(...)',  help: 'Hex (#fff), RGB/A, HSL/A, or named CSS color', category: 'formats' },
    hex:         { name: 'Hex bytes',       icon: '🔢', fn: hex,         placeholder: '0x48656c6c6f',         help: 'Hexadecimal string with byte length counter', category: 'formats' },
    creditCard:  { name: 'Credit Card',     icon: '💳', fn: creditCard,  placeholder: '4111 1111 1111 1111',  help: 'Luhn mod-10 algorithm with brand detection', category: 'security', sensitive: true },
    json:        { name: 'JSON',            icon: '📦', fn: json,        placeholder: '{"key": "value"}',     help: 'RFC 8259 syntax checker with root type detection', category: 'formats' },
    base64:      { name: 'Base64',          icon: '🔣', fn: base64,      placeholder: 'SGVsbG8gV29ybGQ=',     help: 'RFC 4648 Base64 character set and padding verification', category: 'formats' },
    uuid:        { name: 'UUID',            icon: '🆔', fn: uuid,        placeholder: '550e8400-e29b-41d4-a716-446655440000', help: 'Standard 36-character RFC 4122 UUID format', category: 'formats' },
    hash:        { name: 'Hash Fingerprint',icon: '#️⃣', fn: hash,        placeholder: '5d41402abc4b2a76...',  help: 'Identifies MD5, SHA-1, SHA-256, or SHA-512 hashes', category: 'security' },
    slug:        { name: 'URL Slug',        icon: '🪧', fn: slug,        placeholder: 'my-cool-post',         help: 'URL-friendly lowercase kebab-case format', category: 'text' },
    semver:      { name: 'Semver',          icon: '🏷️', fn: semver,      placeholder: '1.2.3-beta.1',          help: 'Semantic Versioning 2.0.0 specification', category: 'text' },
    number:      { name: 'Number',          icon: '🔢', fn: number,      placeholder: '42',                   help: 'Numeric literal verification (integer or float)', category: 'text' },
  };

  global.OVValidators = { ...VALIDATORS, _internal: { email, phone, url, password, username, ipv4, ipv6, date, color, hex, creditCard, json, base64, uuid, hash, slug, semver, number, range, regex } };
})(window);
