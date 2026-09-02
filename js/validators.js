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
    username: /^[a-zA-Z0-9_]{3,20}$/,
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
    if (!v) return { valid: false, reason: 'Email is required' };
    if (v.length > 254) return { valid: false, reason: 'Too long' };
    if (!RE.email.test(v)) return { valid: false, reason: 'Not a valid email format' };
    return { valid: true };
  }

  function phone(v, country = 'IN') {
    if (!v) return { valid: false, reason: 'Phone is required' };
    const digits = v.replace(/[^\d+]/g, '');
    if (country === 'IN') {
      if (!/^(\+?91[\-\s]?)?[6-9]\d{9}$/.test(digits.replace(/\s|-/g, ''))) {
        return { valid: false, reason: 'Invalid Indian phone number' };
      }
    } else {
      if (digits.replace(/\D/g, '').length < 7 || digits.replace(/\D/g, '').length > 15) {
        return { valid: false, reason: 'Phone length must be 7-15 digits' };
      }
    }
    return { valid: true };
  }

  function url(v) {
    if (!v) return { valid: false, reason: 'URL is required' };
    try {
      const u = new URL(v);
      if (!['http:', 'https:', 'ftp:'].includes(u.protocol)) {
        return { valid: false, reason: 'Protocol must be http/https/ftp' };
      }
      return { valid: true, meta: { host: u.host, protocol: u.protocol } };
    } catch (_) {
      return { valid: false, reason: 'Not a valid URL' };
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
    if (score < 2) return { valid: false, reason: 'Too weak', meta: { score, strength } };
    return { valid: true, meta: { score, strength } };
  }

  function username(v) {
    if (!v) return { valid: false, reason: 'Username is required' };
    if (!RE.username.test(v)) return { valid: false, reason: '3-20 chars, letters/digits/_ only' };
    return { valid: true };
  }

  function ipv4(v) {
    if (!v) return { valid: false, reason: 'IP is required' };
    if (!RE.ipv4.test(v)) return { valid: false, reason: 'Not a valid IPv4 address' };
    return { valid: true };
  }

  function ipv6(v) {
    if (!v) return { valid: false, reason: 'IP is required' };
    if (!RE.ipv6.test(v)) return { valid: false, reason: 'Not a valid IPv6 address' };
    return { valid: true };
  }

  function date(v) {
    if (!v) return { valid: false, reason: 'Date is required' };
    const d = new Date(v);
    if (isNaN(d.getTime())) return { valid: false, reason: 'Not a valid date' };
    return { valid: true, meta: { iso: d.toISOString(), timestamp: d.getTime() } };
  }

  function color(v) {
    if (!v) return { valid: false, reason: 'Color is required' };
    if (RE.hexColor.test(v) || RE.rgbColor.test(v) || RE.hslColor.test(v)) {
      return { valid: true };
    }
    // Try CSS keyword via DOM
    try {
      if (typeof document !== 'undefined') {
        const s = new Option().style;
        s.color = v;
        if (s.color !== '') return { valid: true };
      }
    } catch (_) {}
    return { valid: false, reason: 'Not a valid color value' };
  }

  function hex(v) {
    if (!v) return { valid: false, reason: 'Hex is required' };
    const t = v.replace(/^0x/i, '');
    if (!/^[0-9a-fA-F]+$/.test(t)) return { valid: false, reason: 'Contains non-hex characters' };
    return { valid: true, meta: { length: t.length / 2 } };
  }

  function creditCard(v) {
    if (!v) return { valid: false, reason: 'Card number is required' };
    const digits = v.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) {
      return { valid: false, reason: 'Length must be 13-19 digits' };
    }
    // Luhn
    let sum = 0, alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = +digits[i];
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    if (sum % 10 !== 0) return { valid: false, reason: 'Failed Luhn check' };
    let brand = 'Unknown';
    if (/^4/.test(digits)) brand = 'Visa';
    else if (/^(5[1-5]|2[2-7])/.test(digits)) brand = 'Mastercard';
    else if (/^3[47]/.test(digits)) brand = 'Amex';
    else if (/^(6011|65)/.test(digits)) brand = 'Discover';
    else if (/^35/.test(digits)) brand = 'JCB';
    return { valid: true, meta: { brand, last4: digits.slice(-4) } };
  }

  function json(v) {
    if (!v || !v.trim()) return { valid: false, reason: 'JSON is required' };
    try {
      const parsed = JSON.parse(v);
      return { valid: true, meta: { type: Array.isArray(parsed) ? 'array' : typeof parsed } };
    } catch (e) {
      return { valid: false, reason: e.message };
    }
  }

  function base64(v) {
    if (!v) return { valid: false, reason: 'Base64 is required' };
    if (!RE.base64.test(v)) return { valid: false, reason: 'Invalid base64 characters' };
    try {
      const decoded = atob(v);
      return { valid: true, meta: { decodedBytes: decoded.length } };
    } catch (_) {
      return { valid: false, reason: 'Failed to decode' };
    }
  }

  function uuid(v) {
    if (!v) return { valid: false, reason: 'UUID is required' };
    if (!RE.uuid.test(v)) return { valid: false, reason: 'Not a valid UUID v4 format' };
    return { valid: true };
  }

  function hash(v) {
    if (!v) return { valid: false, reason: 'Hash is required' };
    const len = v.length;
    if (RE.md5.test(v))    return { valid: true, meta: { algorithm: 'MD5',    bits: 128 } };
    if (RE.sha1.test(v))   return { valid: true, meta: { algorithm: 'SHA-1',  bits: 160 } };
    if (RE.sha256.test(v)) return { valid: true, meta: { algorithm: 'SHA-256',bits: 256 } };
    if (RE.sha512.test(v)) return { valid: true, meta: { algorithm: 'SHA-512',bits: 512 } };
    return { valid: false, reason: 'Not a recognised hash (MD5/SHA1/SHA256/SHA512)' };
  }

  function slug(v) {
    if (!v) return { valid: false, reason: 'Slug is required' };
    if (!RE.slug.test(v)) return { valid: false, reason: 'Lowercase letters, digits and dashes only' };
    return { valid: true };
  }

  function semver(v) {
    if (!v) return { valid: false, reason: 'Version is required' };
    if (!RE.semver.test(v)) return { valid: false, reason: 'Not a valid semver (e.g. 1.2.3-beta.1)' };
    return { valid: true };
  }

  function number(v) {
    if (v === '' || v === null || v === undefined) return { valid: false, reason: 'Number is required' };
    const n = Number(v);
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
    email:       { name: 'Email',           icon: '✉️', fn: email,       placeholder: 'user@example.com',     help: 'user@domain.tld' },
    phone:       { name: 'Phone',           icon: '📱', fn: phone,       placeholder: '+91 98765 43210',     help: 'Country code optional' },
    url:         { name: 'URL',             icon: '🔗', fn: url,         placeholder: 'https://example.com',  help: 'http/https/ftp' },
    password:    { name: 'Password',        icon: '🔒', fn: password,    placeholder: 'Min 8 chars + variety',help: 'Strength 0-5', hasStrength: true },
    username:    { name: 'Username',        icon: '👤', fn: username,    placeholder: 'your_name_123',        help: '3-20 chars' },
    ipv4:        { name: 'IPv4',            icon: '🌐', fn: ipv4,        placeholder: '192.168.1.1',          help: 'Dotted quad' },
    ipv6:        { name: 'IPv6',            icon: '🌐', fn: ipv6,        placeholder: '2001:db8::1',          help: '8 groups of hex' },
    date:        { name: 'Date',            icon: '📅', fn: date,        placeholder: '2026-03-09',           help: 'Any parseable date' },
    color:       { name: 'Color',           icon: '🎨', fn: color,       placeholder: '#6366f1 or rgb(99,102,241)', help: 'hex/rgb/hsl/name' },
    hex:         { name: 'Hex bytes',       icon: '🔢', fn: hex,         placeholder: '0x48656c6c6f',         help: 'Hex string' },
    creditCard:  { name: 'Credit Card',     icon: '💳', fn: creditCard,  placeholder: '4111 1111 1111 1111',  help: 'Luhn checked', sensitive: true },
    json:        { name: 'JSON',            icon: '📦', fn: json,        placeholder: '{"hello":"world"}',     help: 'Valid JSON syntax' },
    base64:      { name: 'Base64',          icon: '🔣', fn: base64,      placeholder: 'SGVsbG8gV29ybGQ=',     help: 'Encoded text' },
    uuid:        { name: 'UUID',            icon: '🆔', fn: uuid,        placeholder: '550e8400-e29b-41d4-a716-446655440000', help: 'UUID v4' },
    hash:        { name: 'Hash',            icon: '#️⃣', fn: hash,        placeholder: '5d41402abc4b2a76...',  help: 'MD5/SHA1/SHA256/SHA512' },
    slug:        { name: 'URL Slug',        icon: '🪧', fn: slug,        placeholder: 'my-cool-post',         help: 'kebab-case' },
    semver:      { name: 'Semver',          icon: '🏷️', fn: semver,      placeholder: '1.2.3-beta.1',          help: 'Semantic version' },
    number:      { name: 'Number',          icon: '🔢', fn: number,      placeholder: '42',                   help: 'Integer or float' },
  };

  global.OVValidators = { ...VALIDATORS, _internal: { email, phone, url, password, username, ipv4, ipv6, date, color, hex, creditCard, json, base64, uuid, hash, slug, semver, number, range, regex } };
})(window);
