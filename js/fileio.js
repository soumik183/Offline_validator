/**
 * fileio.js
 * File IO bridge for the offline-validator hash system.
 *
 * Provides:
 *   - Download helpers  (Blob + URL.createObjectURL) for .ovhash / .ovstruct / .json
 *   - File readers      (FileReader) for uploaded .ovhash / .ovstruct
 *   - Strict parsers    (header validation, returns null on bad input)
 *   - Drag & drop zone  (highlights on dragover, dispatches parsed result)
 *
 * File formats:
 *
 *   .ovhash (V1)  - single reversible hash token
 *     OV-HASH-FILE-V1
 *     algorithm: xor-shift-v1
 *     salt: <salt>
 *     created: <iso8601>
 *     ---
 *     v1$salt$checksum$payload
 *
 *   .ovstruct (V2) - structured payload with 8 header fields + encoded token
 *     OV-STRUCT-V2
 *     schema: ovstruct-v1
 *     algorithm: feistel-v1
 *     entity: usr_8f3a2b
 *     product: app_offline_validator
 *     version: 2.1.0
 *     issued: 1719926400000
 *     expires: 1751548800000
 *     plan: pro
 *     flags: has_email,has_json
 *     serial: lic-abc123
 *     created: 2026-03-09T12:00:00Z
 *     fields: 3
 *     ---
 *     v2$feistel-v1$salt$checksum$payload
 *
 * Dependency-free: only browser APIs (Blob, URL, FileReader, document, File).
 */
(function (global) {
  'use strict';

  /* ---------- Constants ---------- */

  const OV_HASH_HEADER   = 'OV-HASH-FILE-V1';
  const OV_STRUCT_HEADER = 'OV-STRUCT-V2';
  const SEPARATOR        = '---';

  // 8 required fields in the structured payload schema (per hash.js).
  const STRUCTURED_FIELDS = [
    'entity', 'product', 'version', 'issued',
    'expires', 'plan', 'flags', 'serial'
  ];

  /* ---------- Internal helpers ---------- */

  function nowIso() {
    try { return new Date().toISOString(); } catch (_) { return ''; }
  }

  function isNonEmpty(s) {
    return typeof s === 'string' && s.length > 0;
  }

  function parseFlags(s) {
    if (!s) return [];
    return String(s).split(',').map(function (x) { return x.trim(); }).filter(Boolean);
  }

  function serializeFlags(arr) {
    if (!Array.isArray(arr)) return '';
    return arr.filter(Boolean).join(',');
  }

  function parseNumOrNull(s) {
    if (s === undefined || s === null) return null;
    const t = String(s).trim();
    if (t === '') return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }

  function safeFileName(name) {
    if (!isNonEmpty(name)) return 'download.txt';
    return String(name).replace(/[\\/:*?"<>|]+/g, '_');
  }

  function _downloadBlob(blob, filename) {
    return new Promise(function (resolve, reject) {
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = safeFileName(filename);
        a.style.display = 'none';
        (document.body || document.documentElement).appendChild(a);
        a.addEventListener('click', function () {
          resolve({ ok: true, filename: a.download, url: url });
        });
        a.click();
        setTimeout(function () {
          try { a.remove(); } catch (_) {}
          try { URL.revokeObjectURL(url); } catch (_) {}
        }, 1500);
      } catch (err) {
        reject(err);
      }
    });
  }

  function _readAsText(file) {
    return new Promise(function (resolve, reject) {
      try {
        const fr = new FileReader();
        fr.onload  = function () { resolve(String(fr.result || '')); };
        fr.onerror = function () { reject(fr.error || new Error('FileReader error')); };
        fr.readAsText(file);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Split a .ovhash / .ovstruct text into {headerText, body} on the `---` line.
   * Returns null on invalid layout.
   */
  function _splitHeaderAndBody(content) {
    if (typeof content !== 'string') return null;
    const text = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const idx = text.indexOf('\n' + SEPARATOR + '\n');
    if (idx < 0) return null;
    const header = text.slice(0, idx);
    const body   = text.slice(idx + SEPARATOR.length + 2);
    return { header: header, body: body.trim() };
  }

  function _parseHeaderLines(headerText) {
    const out = {};
    const lines = headerText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const ci = line.indexOf(':');
      if (ci < 0) continue;
      const k = line.slice(0, ci).trim();
      const v = line.slice(ci + 1).trim();
      if (k) out[k] = v;
    }
    return out;
  }

  /* ---------- Parsers ---------- */

  /**
   * Parse a .ovhash or .ovstruct text file into a plain object.
   * Returns null on invalid format.
   *
   * Returns at minimum: { algorithm, salt, created, token, _kind }
   * For .ovstruct also returns: schema, entity, product, version, issued,
   *   expires, plan, flags (array), serial, fields
   */
  function parseHashFile(content) {
    const split = _splitHeaderAndBody(content);
    if (!split) return null;

    const hdr  = _parseHeaderLines(split.header);
    const body = split.body;

    if (!isNonEmpty(body)) return null;

    // V1 .ovhash
    if (split.header.indexOf(OV_HASH_HEADER) === 0) {
      return {
        _kind:     'ovhash',
        algorithm: hdr.algorithm || '',
        salt:      hdr.salt      || '',
        created:   hdr.created   || '',
        token:     body,
      };
    }

    // V2 .ovstruct
    if (split.header.indexOf(OV_STRUCT_HEADER) === 0) {
      return {
        _kind:     'ovstruct',
        schema:    hdr.schema    || '',
        algorithm: hdr.algorithm || '',
        salt:      hdr.salt      || '',
        created:   hdr.created   || '',
        entity:    hdr.entity    || '',
        product:   hdr.product   || '',
        version:   hdr.version   || '',
        issued:    parseNumOrNull(hdr.issued),
        expires:   parseNumOrNull(hdr.expires),
        plan:      hdr.plan      || '',
        flags:     parseFlags(hdr.flags),
        serial:    hdr.serial    || '',
        fields:    parseNumOrNull(hdr.fields),
        token:     body,
      };
    }

    return null;
  }

  /**
   * Validate a parsed/loaded file against the 8-field structured schema.
   * Returns { valid, missingFields, errors }.
   * Accepts either the raw text or an already-parsed object.
   */
  function validatePayloadFile(content) {
    const parsed = (typeof content === 'string')
      ? parseHashFile(content)
      : content;

    if (!parsed) {
      return {
        valid: false,
        missingFields: STRUCTURED_FIELDS.slice(),
        errors: ['Invalid or unparseable file format']
      };
    }
    if (parsed._kind !== 'ovstruct') {
      return {
        valid: false,
        missingFields: STRUCTURED_FIELDS.slice(),
        errors: ['Not a structured .ovstruct file']
      };
    }

    const missing = [];
    const errors  = [];

    for (let i = 0; i < STRUCTURED_FIELDS.length; i++) {
      const f = STRUCTURED_FIELDS[i];
      const v = parsed[f];
      const isMissing = (v === undefined || v === null || v === '' ||
                         (Array.isArray(v) && v.length === 0));
      if (isMissing) missing.push(f);
    }
    if (typeof parsed.issued !== 'number' || !Number.isFinite(parsed.issued)) {
      if (missing.indexOf('issued') < 0) missing.push('issued');
      errors.push('issued must be a numeric timestamp');
    }
    if (parsed.expires !== null &&
        (typeof parsed.expires !== 'number' || !Number.isFinite(parsed.expires))) {
      errors.push('expires, if present, must be a numeric timestamp');
    }
    if (!Array.isArray(parsed.flags)) {
      errors.push('flags must be an array of strings');
    }
    if (!isNonEmpty(parsed.token)) {
      errors.push('token body is missing');
    }

    return {
      valid: missing.length === 0 && errors.length === 0,
      missingFields: missing,
      errors: errors
    };
  }

  /**
   * Full parse + decode pipeline.
   * Returns:
   *   {
   *     algorithm, salt, token,
   *     header: { entity, product, version, issued, expires, plan, flags, serial, created },
   *     decoded: <object | string | null>,
   *     valid: boolean,
   *     errors: string[],
   *     expired: boolean
   *   }
   */
  function parseAndDecode(content, expectedSalt) {
    const parsed = parseHashFile(content);
    const out = {
      algorithm: '',
      salt: '',
      token: '',
      header: {
        entity: '', product: '', version: '',
        issued: null, expires: null, plan: '',
        flags: [], serial: '', created: ''
      },
      decoded: null,
      valid: false,
      errors: [],
      expired: false
    };

    if (!parsed) {
      out.errors.push('Invalid or unparseable file format');
      return out;
    }

    out.algorithm = parsed.algorithm || '';
    out.salt      = parsed.salt      || '';
    out.token     = parsed.token     || '';
    out.header = {
      entity:  parsed.entity  || '',
      product: parsed.product || '',
      version: parsed.version || '',
      issued:  (typeof parsed.issued  === 'number') ? parsed.issued  : null,
      expires: (typeof parsed.expires === 'number') ? parsed.expires : null,
      plan:    parsed.plan    || '',
      flags:   Array.isArray(parsed.flags) ? parsed.flags : [],
      serial:  parsed.serial  || '',
      created: parsed.created || ''
    };

    if (global.OVHash && typeof global.OVHash.decode === 'function') {
      const salt = (expectedSalt != null) ? expectedSalt : out.salt;
      let decoded;
      try {
        if (parsed._kind === 'ovstruct' && typeof global.OVHash.unstructure === 'function') {
          decoded = global.OVHash.unstructure(parsed.token, salt);
        } else {
          decoded = global.OVHash.decode(parsed.token, salt);
        }
      } catch (err) {
        out.errors.push('Decode threw: ' + (err && err.message ? err.message : String(err)));
        decoded = null;
      }
      if (decoded === null || decoded === undefined) {
        out.errors.push('Token failed integrity / salt check');
      } else {
        out.valid = true;
        if (typeof decoded === 'string') {
          try { out.decoded = JSON.parse(decoded); }
          catch (_) { out.decoded = decoded; }
        } else {
          out.decoded = decoded;
        }
      }
    } else {
      out.errors.push('OVHash not available; only parsed headers were returned');
    }

    if (out.header.expires != null && typeof out.header.expires === 'number') {
      const now = Date.now();
      if (now > out.header.expires) {
        out.expired = true;
        out.errors.push('Payload is expired (expires=' + out.header.expires + ')');
      }
    }

    return out;
  }

  /* ---------- File picker + reader ---------- */

  function pickFile(accept) {
    const acceptStr = accept || '.ovhash,.ovstruct,.json,.txt';
    return new Promise(function (resolve, reject) {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = acceptStr;
        input.style.display = 'none';
        (document.body || document.documentElement).appendChild(input);
        input.addEventListener('change', function () {
          const file = input.files && input.files[0];
          try { input.remove(); } catch (_) {}
          if (!file) { reject(new Error('No file selected')); return; }
          resolve(file);
        });
        input.click();
      } catch (err) {
        reject(err);
      }
    });
  }

  function readFile(file) {
    if (!file) return Promise.reject(new TypeError('readFile: file is required'));
    if (typeof file === 'string') return Promise.resolve(file);
    return _readAsText(file);
  }

  /* ---------- Auto-detect type from content ---------- */

  function _detectKind(content) {
    if (typeof content !== 'string') return 'unknown';
    const head = content.replace(/\r\n/g, '\n').slice(0, 64);
    if (head.indexOf(OV_STRUCT_HEADER) === 0) return 'ovstruct';
    if (head.indexOf(OV_HASH_HEADER)   === 0) return 'ovhash';
    if (head.charAt(0) === '{' || head.charAt(0) === '[') return 'json';
    return 'unknown';
  }

  /* ---------- Drag & drop ---------- */

  function enableDropZone(element, onFile) {
    if (!element || !element.addEventListener) {
      throw new TypeError('enableDropZone: element must be a DOM element');
    }
    if (typeof onFile !== 'function') {
      throw new TypeError('enableDropZone: onFile must be a function');
    }

    const HIGHLIGHT_CLASS = 'drag-over';

    function _prevent(e) { e.preventDefault(); e.stopPropagation(); }

    function _onDragEnter(e) {
      _prevent(e);
      element.classList.add(HIGHLIGHT_CLASS);
    }
    function _onDragOver(e) {
      _prevent(e);
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      element.classList.add(HIGHLIGHT_CLASS);
    }
    function _onDragLeave(e) {
      _prevent(e);
      if (e.target === element) element.classList.remove(HIGHLIGHT_CLASS);
    }
    function _onDrop(e) {
      _prevent(e);
      element.classList.remove(HIGHLIGHT_CLASS);
      const dt = e.dataTransfer;
      if (!dt || !dt.files || dt.files.length === 0) return;
      const file = dt.files[0];
      _readAsText(file).then(function (text) {
        const kind = _detectKind(text);
        let payload;
        if (kind === 'ovstruct' || kind === 'ovhash') {
          payload = parseAndDecode(text);
        } else if (kind === 'json') {
          try { payload = { _kind: 'json', decoded: JSON.parse(text) }; }
          catch (err) { payload = { _kind: 'json', errors: [String(err && err.message || err)] }; }
        } else {
          payload = { _kind: 'unknown', raw: text };
        }
        try { onFile(file, payload, kind); }
        catch (_) { /* swallow handler errors */ }
      }).catch(function (err) {
        try { onFile(file, { _kind: 'error', errors: [String(err && err.message || err)] }, 'error'); }
        catch (_) {}
      });
    }

    element.addEventListener('dragenter', _onDragEnter);
    element.addEventListener('dragover',  _onDragOver);
    element.addEventListener('dragleave', _onDragLeave);
    element.addEventListener('drop',      _onDrop);

    return function disable() {
      element.removeEventListener('dragenter', _onDragEnter);
      element.removeEventListener('dragover',  _onDragOver);
      element.removeEventListener('dragleave', _onDragLeave);
      element.removeEventListener('drop',      _onDrop);
      element.classList.remove(HIGHLIGHT_CLASS);
    };
  }

  /* ---------- Download helpers ---------- */

  function downloadHash(filename, token, meta) {
    meta = meta || {};
    const lines = [
      OV_HASH_HEADER,
      'algorithm: ' + (meta.algorithm || 'xor-shift-v1'),
      'salt: '      + (meta.salt      || ''),
      'created: '   + (meta.created   || nowIso()),
      SEPARATOR,
      String(token || '')
    ];
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
    return _downloadBlob(blob, (filename || 'hash') + '.ovhash');
  }

  function downloadStructured(filename, structuredHash, payload, meta) {
    meta = meta || {};
    payload = payload || {};

    const entity  = payload.entity  || '';
    const product = payload.product || '';
    const version = payload.version || '';
    const issued  = (typeof payload.issued  === 'number') ? payload.issued  : '';
    const expires = (typeof payload.expires === 'number') ? payload.expires : '';
    const plan    = payload.plan    || '';
    const flags   = serializeFlags(payload.flags);
    const serial  = payload.serial  || '';
    const fields  = (typeof payload.fields === 'number')
      ? payload.fields
      : (Array.isArray(payload.fields) ? payload.fields.length : '');

    const lines = [
      OV_STRUCT_HEADER,
      'schema: '    + (payload.schemaVersion || meta.schema || 'ovstruct-v1'),
      'algorithm: ' + (meta.algorithm || 'feistel-v1'),
      'entity: '    + entity,
      'product: '   + product,
      'version: '   + version,
      'issued: '    + issued,
      'expires: '   + expires,
      'plan: '      + plan,
      'flags: '     + flags,
      'serial: '    + serial,
      'created: '   + (meta.created || nowIso()),
      'fields: '    + fields,
      SEPARATOR,
      String(structuredHash || '')
    ];
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
    return _downloadBlob(blob, (filename || 'license') + '.ovstruct');
  }

  function downloadJSON(filename, obj) {
    let body;
    try { body = JSON.stringify(obj, null, 2); }
    catch (err) { return Promise.reject(err); }
    const blob = new Blob([body], { type: 'application/json;charset=utf-8' });
    return _downloadBlob(blob, (filename || 'data') + '.json');
  }

  function downloadLicense(filename, payload) {
    const baseName = safeFileName(filename || 'license').replace(/\.ovstruct$|$/, '');
    if (typeof payload === 'string') {
      return downloadStructured(baseName, payload, {
        entity: 'usr_unknown',
        product: 'app_offline_validator',
        version: '0.0.0',
        issued: Date.now(),
        expires: null,
        plan: 'standard',
        flags: [],
        serial: 'lic-unknown',
        fields: 0
      });
    }
    return downloadStructured(baseName, payload && payload.token, payload || {});
  }

  /* ---------- Public API ---------- */

  global.OVFileIO = {
    // downloads
    downloadHash:        downloadHash,
    downloadStructured:  downloadStructured,
    downloadJSON:        downloadJSON,
    downloadLicense:     downloadLicense,

    // readers / parsers
    pickFile:            pickFile,
    readFile:            readFile,
    parseHashFile:       parseHashFile,
    parseAndDecode:      parseAndDecode,
    validatePayloadFile: validatePayloadFile,

    // drag & drop
    enableDropZone:      enableDropZone,

    // constants
    OV_HASH_HEADER:      OV_HASH_HEADER,
    OV_STRUCT_HEADER:    OV_STRUCT_HEADER,
    STRUCTURED_FIELDS:   STRUCTURED_FIELDS.slice()
  };
})(window);
