/**
 * tools.js
 * Offline Multi-Format Encoder, Decoder, Generator, and Converter Suite.
 * 100% Client-Side & Dependency-Free.
 */
(function (global) {
  'use strict';

  /* ============================================================
     1. IDENTIFIERS
     ============================================================ */
  const identifiers = {
    // UUID v4 / v1 / nil
    uuid(version = 'v4', uppercase = false, hyphens = true, count = 1) {
      const results = [];
      for (let c = 0; c < count; c++) {
        let u = '';
        if (version === 'nil') {
          u = '00000000-0000-0000-0000-000000000000';
        } else {
          // Standard cryptographically secure v4
          const b = new Uint8Array(16);
          crypto.getRandomValues(b);
          b[6] = (b[6] & 0x0f) | 0x40; // Version 4
          b[8] = (b[8] & 0x3f) | 0x80; // Variant RFC 4122
          const h = Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
          u = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
        }
        if (!hyphens) u = u.replace(/-/g, '');
        if (uppercase) u = u.toUpperCase();
        results.push(u);
      }
      return count === 1 ? results[0] : results;
    },

    // User ID (e.g. usr_8f3a2b1c, cust_9941, org_...)
    userId(prefix = 'usr_', length = 12, format = 'alphanumeric', count = 1) {
      const results = [];
      const charsets = {
        alphanumeric: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        hex: '0123456789abcdef',
        digits: '0123456789',
        base32: '0123456789ABCDEFGHJKMNPQRSTVWXYZ',
      };
      const chars = charsets[format] || charsets.alphanumeric;
      for (let c = 0; c < count; c++) {
        const b = new Uint8Array(length);
        crypto.getRandomValues(b);
        let id = prefix;
        for (let i = 0; i < length; i++) id += chars[b[i] % chars.length];
        results.push(id);
      }
      return count === 1 ? results[0] : results;
    },

    // Random ID
    randomId(length = 16, format = 'base62', count = 1) {
      return identifiers.userId('', length, format, count);
    },

    // Nano ID
    nanoId(size = 21, alphabet = 'useandom-26T1983_40STOpfunkgjq', count = 1) {
      const results = [];
      for (let c = 0; c < count; c++) {
        const b = new Uint8Array(size);
        crypto.getRandomValues(b);
        let id = '';
        for (let i = 0; i < size; i++) id += alphabet[b[i] % alphabet.length];
        results.push(id);
      }
      return count === 1 ? results[0] : results;
    },

    // Custom ID with template (e.g. "ID-####-????-@@@@" or prefix + length)
    customId(template = 'ID-####-????', count = 1) {
      const results = [];
      const digits = '0123456789';
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const alpha = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

      for (let c = 0; c < count; c++) {
        const rand = new Uint8Array(template.length);
        crypto.getRandomValues(rand);
        let out = '';
        for (let i = 0; i < template.length; i++) {
          const ch = template[i];
          if (ch === '#') out += digits[rand[i] % digits.length];
          else if (ch === '?') out += letters[rand[i] % letters.length];
          else if (ch === '@') out += alpha[rand[i] % alpha.length];
          else out += ch;
        }
        results.push(out);
      }
      return count === 1 ? results[0] : results;
    }
  };

  /* ============================================================
     2. HASHING
     ============================================================ */
  const hashing = {
    // SHA-256, SHA-384, SHA-512 via WebCrypto
    async digest(algorithm, text) {
      const bytes = new TextEncoder().encode(text);
      const buffer = await crypto.subtle.digest(algorithm, bytes);
      const raw = new Uint8Array(buffer);
      const hex = Array.from(raw).map(b => b.toString(16).padStart(2, '0')).join('');
      let bin = '';
      for (let i = 0; i < raw.length; i++) bin += String.fromCharCode(raw[i]);
      const base64 = btoa(bin);
      return { hex, base64, bytes: raw, length: hex.length, bits: raw.length * 8 };
    },

    // Hash multiple values with a combine mode
    async hashValues(algorithm, values = [], combineMode = 'salted') {
      let combined = '';
      const v1 = values[0] || '';
      const v2 = values[1] || '';
      const v3 = values[2] || '';

      if (values.length === 1) {
        combined = v1;
      } else if (values.length === 2) {
        if (combineMode === 'colon') combined = `${v1}:${v2}`;
        else if (combineMode === 'newline') combined = `${v1}\n${v2}`;
        else combined = `${v1}${v2}`; // salted / concat default
      } else {
        if (combineMode === 'colon') combined = values.join(':');
        else if (combineMode === 'newline') combined = values.join('\n');
        else combined = values.join('');
      }

      // Check for our custom codecs
      if (algorithm === 'v1-token') {
        const token = global.OVHash.encode(v1, v2 || undefined);
        return { hex: token, base64: token, length: token.length, bits: 0, isToken: true };
      }
      if (algorithm === 'v2-token') {
        const r = global.OVHash.structEncode({
          entity: v1 || 'anonymous',
          product: 'offline-suite',
          version: 1,
          issued: Math.floor(Date.now() / 1000),
          serial: v2 || 'LIC-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        });
        return { hex: r.token, base64: r.token, length: r.token.length, bits: 0, isToken: true };
      }

      // MD5
      if (algorithm === 'MD5') {
        const hex = computeMD5(combined);
        return { hex, base64: '', length: 32, bits: 128 };
      }

      // FNV-1a
      if (algorithm === 'FNV-1a') {
        const hex = global.OVHash.checksum32(combined);
        return { hex, base64: '', length: 8, bits: 32 };
      }

      return await hashing.digest(algorithm, combined);
    },

    // File Hash (computes SHA-256, SHA-384, SHA-512 on raw file bytes)
    async hashFile(file, algorithm = 'SHA-256') {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
      const raw = new Uint8Array(hashBuffer);
      const hex = Array.from(raw).map(b => b.toString(16).padStart(2, '0')).join('');
      return {
        fileName: file.name,
        fileSize: file.size,
        algorithm,
        hex,
      };
    }
  };

  /* ============================================================
     3. ENCODING & DECODING
     ============================================================ */
  const encoding = {
    // Base64 (UTF-8 safe)
    base64: {
      encode(str) {
        const bytes = new TextEncoder().encode(str);
        let bin = '';
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin);
      },
      decode(b64) {
        try {
          const bin = atob(b64.trim());
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          return new TextDecoder().decode(bytes);
        } catch (e) {
          throw new Error('Invalid Base64 sequence: ' + e.message);
        }
      }
    },

    // URL
    url: {
      encode(str, component = true) {
        return component ? encodeURIComponent(str) : encodeURI(str);
      },
      decode(str) {
        try {
          return decodeURIComponent(str.replace(/\+/g, ' '));
        } catch (e) {
          throw new Error('Malformed URL encoding: ' + e.message);
        }
      }
    },

    // Hex
    hex: {
      encode(str, delimiter = ' ') {
        const bytes = new TextEncoder().encode(str);
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(delimiter);
      },
      decode(hexStr) {
        const clean = hexStr.replace(/[^0-9a-fA-F]/g, '');
        if (clean.length % 2 !== 0) throw new Error('Hex string must have an even number of digits.');
        const bytes = new Uint8Array(clean.length / 2);
        for (let i = 0; i < clean.length; i += 2) {
          bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
        }
        return new TextDecoder().decode(bytes);
      }
    },

    // Binary
    binary: {
      encode(str, delimiter = ' ') {
        const bytes = new TextEncoder().encode(str);
        return Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join(delimiter);
      },
      decode(binStr) {
        const clean = binStr.replace(/[^01]/g, '');
        if (clean.length % 8 !== 0) throw new Error('Binary input must be multiples of 8 bits.');
        const bytes = new Uint8Array(clean.length / 8);
        for (let i = 0; i < clean.length; i += 8) {
          bytes[i / 8] = parseInt(clean.slice(i, i + 8), 2);
        }
        return new TextDecoder().decode(bytes);
      }
    },

    // HTML Entities
    html: {
      encode(str) {
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      },
      decode(str) {
        const map = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'" };
        return String(str).replace(/&[a-zA-Z0-9#]+;/g, m => map[m] || m);
      }
    },

    // Our Custom Codec
    customToken: {
      encode(v1, v2) {
        return global.OVHash.encode(v1, v2 || undefined);
      },
      decode(token) {
        return global.OVHash.decode(token);
      }
    }
  };

  /* ============================================================
     4. DATE & TIME
     ============================================================ */
  const datetime = {
    // Date converter
    convertDate(input) {
      const d = input ? new Date(input) : new Date();
      if (isNaN(d.getTime())) throw new Error('Invalid Date input');
      return {
        iso: d.toISOString(),
        utc: d.toUTCString(),
        local: d.toString(),
        unixSec: Math.floor(d.getTime() / 1000),
        unixMs: d.getTime(),
        dateOnly: d.toISOString().slice(0, 10),
        timeOnly: d.toTimeString().slice(0, 8),
      };
    },

    // Timestamp converter (auto handles 10-digit sec vs 13-digit ms)
    convertTimestamp(ts) {
      let num = Number(ts);
      if (isNaN(num)) throw new Error('Timestamp must be a number');
      if (num < 10000000000) num *= 1000; // Convert seconds to ms
      const d = new Date(num);
      if (isNaN(d.getTime())) throw new Error('Timestamp out of range');
      return datetime.convertDate(d);
    },

    // Timezone Converter
    convertTimezones(dateObj) {
      const d = (dateObj instanceof Date) ? dateObj : new Date(dateObj || Date.now());
      if (isNaN(d.getTime())) throw new Error('Invalid date');

      const zones = [
        { zone: 'UTC', label: 'Coordinated Universal Time' },
        { zone: 'America/New_York', label: 'New York (EDT/EST)' },
        { zone: 'America/Los_Angeles', label: 'Los Angeles (PDT/PST)' },
        { zone: 'Europe/London', label: 'London (BST/GMT)' },
        { zone: 'Europe/Berlin', label: 'Berlin / Paris (CEST/CET)' },
        { zone: 'Asia/Kolkata', label: 'India (IST)' },
        { zone: 'Asia/Tokyo', label: 'Tokyo (JST)' },
        { zone: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
      ];

      return zones.map(z => {
        try {
          const formatted = new Intl.DateTimeFormat('en-US', {
            timeZone: z.zone,
            dateStyle: 'medium',
            timeStyle: 'medium',
            hour12: false,
          }).format(d);
          return { zone: z.zone, label: z.label, time: formatted };
        } catch (_) {
          return { zone: z.zone, label: z.label, time: d.toUTCString() };
        }
      });
    },

    // Date Formatter
    format(d, pattern = 'YYYY-MM-DD HH:mm:ss') {
      const date = (d instanceof Date) ? d : new Date(d || Date.now());
      if (isNaN(date.getTime())) return 'Invalid Date';

      const pad = n => String(n).padStart(2, '0');
      const YYYY = date.getFullYear();
      const MM = pad(date.getMonth() + 1);
      const DD = pad(date.getDate());
      const HH = pad(date.getHours());
      const mm = pad(date.getMinutes());
      const ss = pad(date.getSeconds());

      return pattern
        .replace('YYYY', YYYY)
        .replace('MM', MM)
        .replace('DD', DD)
        .replace('HH', HH)
        .replace('mm', mm)
        .replace('ss', ss);
    }
  };

  /* ============================================================
     5. RANDOM GENERATORS
     ============================================================ */
  const random = {
    // Random number(s)
    number(min = 1, max = 100, isFloat = false, count = 1, isUnique = false) {
      min = Number(min);
      max = Number(max);
      const results = [];
      const set = new Set();
      const limit = isUnique ? Math.min(count, Math.floor(max - min + 1)) : count;

      while (results.length < limit) {
        const rand = crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff;
        const val = isFloat
          ? min + (rand * (max - min))
          : Math.floor(min + (rand * (max - min + 1)));

        if (isUnique) {
          if (!set.has(val)) {
            set.add(val);
            results.push(val);
          }
        } else {
          results.push(val);
        }
      }
      return count === 1 ? results[0] : results;
    },

    // Random string
    string(length = 16, opts = { upper: true, lower: true, numbers: true, symbols: false }) {
      let chars = '';
      if (opts.upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (opts.lower) chars += 'abcdefghijklmnopqrstuvwxyz';
      if (opts.numbers) chars += '0123456789';
      if (opts.symbols) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';
      if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

      const rand = new Uint8Array(length);
      crypto.getRandomValues(rand);
      let out = '';
      for (let i = 0; i < length; i++) out += chars[rand[i] % chars.length];
      return out;
    },

    // Random UUID
    uuid() {
      return identifiers.uuid('v4');
    },

    // Random Color
    color() {
      const b = new Uint8Array(3);
      crypto.getRandomValues(b);
      const hex = '#' + Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
      const r = b[0], g = b[1], bl = b[2];
      const rgb = `rgb(${r}, ${g}, ${bl})`;

      // HSL calculation
      const r_ = r / 255, g_ = g / 255, b_ = bl / 255;
      const max = Math.max(r_, g_, b_), min = Math.min(r_, g_, b_);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r_: h = (g_ - b_) / d + (g_ < b_ ? 6 : 0); break;
          case g_: h = (b_ - r_) / d + 2; break;
          case b_: h = (r_ - g_) / d + 4; break;
        }
        h = Math.round(h * 60);
      }
      s = Math.round(s * 100);
      l = Math.round(l * 100);
      const hsl = `hsl(${h}, ${s}%, ${l}%)`;

      return { hex, rgb, hsl };
    },

    // Custom ID
    customId(template = 'ID-####-????') {
      return identifiers.customId(template);
    }
  };

  /* ============================================================
     6. TEXT UTILITIES
     ============================================================ */
  const text = {
    // Case Converter
    case(str, toCase) {
      if (!str) return '';
      // Tokenize words
      const words = str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_\-.]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      switch (toCase) {
        case 'camel':
          return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        case 'snake':
          return words.map(w => w.toLowerCase()).join('_');
        case 'kebab':
          return words.map(w => w.toLowerCase()).join('-');
        case 'constant':
          return words.map(w => w.toUpperCase()).join('_');
        case 'pascal':
          return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        case 'title':
          return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        case 'upper':
          return str.toUpperCase();
        case 'lower':
          return str.toLowerCase();
        case 'sentence':
          const clean = words.map(w => w.toLowerCase()).join(' ');
          return clean.charAt(0).toUpperCase() + clean.slice(1);
        default:
          return str;
      }
    },

    // Slug generator
    slug(str, delimiter = '-') {
      return String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-_]/g, '')
        .replace(/[\s-_]+/g, delimiter)
        .replace(new RegExp(`^${delimiter}+|${delimiter}+$`, 'g'), '');
    },

    // Text Counter
    count(str) {
      const chars = str.length;
      const charsNoSpaces = str.replace(/\s/g, '').length;
      const words = str.trim() ? str.trim().split(/\s+/).filter(Boolean).length : 0;
      const lines = str ? str.split(/\r?\n/).length : 0;
      const paragraphs = str ? str.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
      const bytes = new TextEncoder().encode(str).length;
      const readingTimeMinutes = (words / 200).toFixed(1);
      const speakingTimeMinutes = (words / 130).toFixed(1);

      return {
        chars,
        charsNoSpaces,
        words,
        lines,
        paragraphs,
        bytes,
        readingTime: `${readingTimeMinutes} min`,
        speakingTime: `${speakingTimeMinutes} min`,
      };
    },

    // Reverse Text
    reverse(str, mode = 'chars') {
      if (mode === 'words') {
        return str.split(/\s+/).reverse().join(' ');
      }
      if (mode === 'lines') {
        return str.split(/\r?\n/).reverse().join('\n');
      }
      return Array.from(str).reverse().join('');
    },

    // Remove Duplicate Lines
    removeDuplicates(str, caseSensitive = true, sortOrder = 'none', removeEmpty = true, trim = true) {
      let lines = str.split(/\r?\n/);
      if (trim) lines = lines.map(l => l.trim());
      if (removeEmpty) lines = lines.filter(Boolean);

      const seen = new Set();
      const unique = [];

      for (const line of lines) {
        const key = caseSensitive ? line : line.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(line);
        }
      }

      if (sortOrder === 'asc') unique.sort((a, b) => a.localeCompare(b));
      if (sortOrder === 'desc') unique.sort((a, b) => b.localeCompare(a));

      return unique.join('\n');
    }
  };

  /* ============================================================
     7. CONVERTERS
     ============================================================ */
  const converters = {
    // Number Base Converter
    numberBase(value, fromBase = 10) {
      const clean = String(value).trim();
      if (!clean) return { bin: '', oct: '', dec: '', hex: '' };
      const num = parseInt(clean, fromBase);
      if (isNaN(num)) throw new Error(`Invalid number for base ${fromBase}`);
      return {
        bin: num.toString(2),
        oct: num.toString(8),
        dec: num.toString(10),
        hex: num.toString(16).toUpperCase(),
      };
    },

    // JSON Formatter
    formatJson(str, indent = 2) {
      try {
        const parsed = JSON.parse(str);
        return indent === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);
      } catch (e) {
        throw new Error('JSON Error: ' + e.message);
      }
    },

    // JSON <-> YAML
    jsonToYaml(objOrStr, indent = 0) {
      let obj = objOrStr;
      if (typeof objOrStr === 'string') {
        obj = JSON.parse(objOrStr);
      }
      const spaces = '  '.repeat(indent);
      if (obj === null) return 'null';
      if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj);
      if (typeof obj === 'string') {
        if (obj.includes('\n') || /[:#\[\]{},&*?|<>=!%@`]/.test(obj)) {
          return JSON.stringify(obj);
        }
        return obj || "''";
      }
      if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        return obj.map(item => {
          if (typeof item === 'object' && item !== null) {
            const sub = converters.jsonToYaml(item, indent + 1).trimStart();
            return spaces + '- ' + sub;
          }
          return spaces + '- ' + converters.jsonToYaml(item, indent + 1);
        }).join('\n');
      }
      if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}';
        return keys.map(k => {
          const val = obj[k];
          if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) {
            return spaces + k + ':\n' + converters.jsonToYaml(val, indent + 1);
          }
          return spaces + k + ': ' + converters.jsonToYaml(val, indent + 1);
        }).join('\n');
      }
      return String(obj);
    },

    yamlToJson(yamlStr) {
      const lines = yamlStr.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('#'));
      function parseValue(val) {
        val = val.trim();
        if (val === 'true') return true;
        if (val === 'false') return false;
        if (val === 'null' || val === '~') return null;
        if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          return val.slice(1, -1);
        }
        return val;
      }

      const root = {};
      const stack = [{ indent: -1, obj: root }];
      for (const line of lines) {
        const indent = line.search(/\S/);
        const trimmed = line.trim();
        if (trimmed.startsWith('- ')) {
          const itemVal = parseValue(trimmed.slice(2));
          while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
          const parent = stack[stack.length - 1].obj;
          if (Array.isArray(parent)) {
            parent.push(itemVal);
          }
        } else if (trimmed.includes(':')) {
          const idx = trimmed.indexOf(':');
          const key = trimmed.slice(0, idx).trim();
          const valStr = trimmed.slice(idx + 1).trim();
          while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
          const parent = stack[stack.length - 1].obj;
          if (valStr) {
            parent[key] = parseValue(valStr);
          } else {
            parent[key] = {};
            stack.push({ indent, obj: parent[key] });
          }
        }
      }
      return JSON.stringify(root, null, 2);
    },

    // CSV <-> JSON
    csvToJson(csv, delimiter = ',') {
      const lines = csv.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length === 0) return '[]';
      const parseLine = (line) => {
        const row = [];
        let inQuote = false;
        let curr = '';
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuote && line[i + 1] === '"') { curr += '"'; i++; }
            else { inQuote = !inQuote; }
          } else if (char === delimiter && !inQuote) {
            row.push(curr.trim());
            curr = '';
          } else {
            curr += char;
          }
        }
        row.push(curr.trim());
        return row;
      };

      const headers = parseLine(lines[0]);
      const rows = lines.slice(1).map(line => {
        const vals = parseLine(line);
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = vals[idx] !== undefined ? vals[idx] : '';
        });
        return obj;
      });
      return JSON.stringify(rows, null, 2);
    },

    jsonToCsv(arrOrStr, delimiter = ',') {
      const arr = typeof arrOrStr === 'string' ? JSON.parse(arrOrStr) : arrOrStr;
      if (!Array.isArray(arr) || arr.length === 0) return '';
      const headers = Object.keys(arr[0]);
      const escapeVal = val => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      const headerLine = headers.map(escapeVal).join(delimiter);
      const rows = arr.map(obj => headers.map(h => escapeVal(obj[h])).join(delimiter));
      return [headerLine, ...rows].join('\n');
    }
  };

  /* ============================================================
     MD5 PURE IMPLEMENTATION
     ============================================================ */
  function computeMD5(str) {
    function safeAdd(x, y) {
      const lsw = (x & 0xffff) + (y & 0xffff);
      const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff);
    }
    function bitRotateLeft(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
    function md5cmn(q, a, b, x, s, t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
    function md5ff(a, b, c, d, x, s, t) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
    function md5gg(a, b, c, d, x, s, t) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
    function md5hh(a, b, c, d, x, s, t) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
    function md5ii(a, b, c, d, x, s, t) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }

    const utf8 = unescape(encodeURIComponent(str));
    const n = utf8.length;
    const words = [];
    for (let i = 0; i < n; i++) words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << ((i % 4) * 8);
    words[n >> 2] |= 0x80 << ((n % 4) * 8);
    words[(((n + 8) >> 6) << 4) + 14] = n * 8;

    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < words.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d;
      a = md5ff(a, b, c, d, words[i] || 0, 7, -680876936);
      d = md5ff(d, a, b, c, words[i + 1] || 0, 12, -389564586);
      c = md5ff(c, d, a, b, words[i + 2] || 0, 17, 606105819);
      b = md5ff(b, c, d, a, words[i + 3] || 0, 22, -1044525330);
      a = md5ff(a, b, c, d, words[i + 4] || 0, 7, -176418897);
      d = md5ff(d, a, b, c, words[i + 5] || 0, 12, 1200080426);
      c = md5ff(c, d, a, b, words[i + 6] || 0, 17, -1473231341);
      b = md5ff(b, c, d, a, words[i + 7] || 0, 22, -45705983);
      a = md5ff(a, b, c, d, words[i + 8] || 0, 7, 1770035416);
      d = md5ff(d, a, b, c, words[i + 9] || 0, 12, -1958414417);
      c = md5ff(c, d, a, b, words[i + 10] || 0, 17, -42063);
      b = md5ff(b, c, d, a, words[i + 11] || 0, 22, -1990404162);
      a = md5ff(a, b, c, d, words[i + 12] || 0, 7, 1804603682);
      d = md5ff(d, a, b, c, words[i + 13] || 0, 12, -40341101);
      c = md5ff(c, d, a, b, words[i + 14] || 0, 17, -1502002290);
      b = md5ff(b, c, d, a, words[i + 15] || 0, 22, 1236535329);

      a = md5gg(a, b, c, d, words[i + 1] || 0, 5, -165796510);
      d = md5gg(d, a, b, c, words[i + 6] || 0, 9, -1069501632);
      c = md5gg(c, d, a, b, words[i + 11] || 0, 14, 643717713);
      b = md5gg(b, c, d, a, words[i] || 0, 20, -373897302);
      a = md5gg(a, b, c, d, words[i + 5] || 0, 5, -701558691);
      d = md5gg(d, a, b, c, words[i + 10] || 0, 9, 38016083);
      c = md5gg(c, d, a, b, words[i + 15] || 0, 14, -660478335);
      b = md5gg(b, c, d, a, words[i + 4] || 0, 20, -405537848);
      a = md5gg(a, b, c, d, words[i + 9] || 0, 5, 568446438);
      d = md5gg(d, a, b, c, words[i + 14] || 0, 9, -1019803690);
      c = md5gg(c, d, a, b, words[i + 3] || 0, 14, -187363961);
      b = md5gg(b, c, d, a, words[i + 8] || 0, 20, 1163531501);
      a = md5gg(a, b, c, d, words[i + 13] || 0, 5, -1444681467);
      d = md5gg(d, a, b, c, words[i + 2] || 0, 9, -51403784);
      c = md5gg(c, d, a, b, words[i + 7] || 0, 14, 1735328473);
      b = md5gg(b, c, d, a, words[i + 12] || 0, 20, -1926607734);

      a = md5hh(a, b, c, d, words[i + 5] || 0, 4, -378558);
      d = md5hh(d, a, b, c, words[i + 8] || 0, 11, -2022574463);
      c = md5hh(c, d, a, b, words[i + 11] || 0, 16, 1839030562);
      b = md5hh(b, c, d, a, words[i + 14] || 0, 23, -35309556);
      a = md5hh(a, b, c, d, words[i + 1] || 0, 4, -1530992060);
      d = md5hh(d, a, b, c, words[i + 4] || 0, 11, 1272893353);
      c = md5hh(c, d, a, b, words[i + 7] || 0, 16, -155497632);
      b = md5hh(b, c, d, a, words[i + 10] || 0, 23, -1094730640);
      a = md5hh(a, b, c, d, words[i + 13] || 0, 4, 681279174);
      d = md5hh(d, a, b, c, words[i] || 0, 11, -358537222);
      c = md5hh(c, d, a, b, words[i + 3] || 0, 16, -722521979);
      b = md5hh(b, c, d, a, words[i + 6] || 0, 23, 76029189);
      a = md5hh(a, b, c, d, words[i + 9] || 0, 4, -640364487);
      d = md5hh(d, a, b, c, words[i + 12] || 0, 11, -421815835);
      c = md5hh(c, d, a, b, words[i + 15] || 0, 16, 530742520);
      b = md5hh(b, c, d, a, words[i + 2] || 0, 23, -995338651);

      a = md5ii(a, b, c, d, words[i] || 0, 6, -198630844);
      d = md5ii(d, a, b, c, words[i + 7] || 0, 10, 1126891415);
      c = md5ii(c, d, a, b, words[i + 14] || 0, 15, -1416354905);
      b = md5ii(b, c, d, a, words[i + 5] || 0, 21, -57434055);
      a = md5ii(a, b, c, d, words[i + 12] || 0, 6, 1700485571);
      d = md5ii(d, a, b, c, words[i + 3] || 0, 10, -1894986606);
      c = md5ii(c, d, a, b, words[i + 10] || 0, 15, -1051523);
      b = md5ii(b, c, d, a, words[i + 1] || 0, 21, -2054922799);
      a = md5ii(a, b, c, d, words[i + 8] || 0, 6, 1873313359);
      d = md5ii(d, a, b, c, words[i + 15] || 0, 10, -30611744);
      c = md5ii(c, d, a, b, words[i + 6] || 0, 15, -1560198380);
      b = md5ii(b, c, d, a, words[i + 13] || 0, 21, 1309151649);
      a = md5ii(a, b, c, d, words[i + 4] || 0, 6, -145523070);
      d = md5ii(d, a, b, c, words[i + 11] || 0, 10, -1120210379);
      c = md5ii(c, d, a, b, words[i + 2] || 0, 15, 718787259);
      b = md5ii(b, c, d, a, words[i + 9] || 0, 21, -343485551);

      a = safeAdd(a, olda);
      b = safeAdd(b, oldb);
      c = safeAdd(c, oldc);
      d = safeAdd(d, oldd);
    }

    function rhex(n) {
      let s = '';
      for (let j = 0; j <= 3; j++) s += ((n >> (j * 8 + 4)) & 0x0f).toString(16) + ((n >> (j * 8)) & 0x0f).toString(16);
      return s;
    }
    return rhex(a) + rhex(b) + rhex(c) + rhex(d);
  }

  // Global Export
  global.OVTools = {
    identifiers,
    hashing,
    encoding,
    datetime,
    random,
    text,
    converters,
    computeMD5,
  };
})(window);
