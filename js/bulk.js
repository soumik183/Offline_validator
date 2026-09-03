/**
 * bulk.js
 * Bulk validation engine with structured payload schema.
 *
 * Every bulk validation produces a payload conforming to:
 *   {
 *     entity, product, version, issued, expires?, plan, flags?, serial,
 *     schemaVersion: 'ovstruct-v1',
 *     fields: [ { slug, label, icon, value, valid, reason, meta, fingerprint } ],
 *     summary: { total, passed, failed, byValidator, timestamp }
 *   }
 *
 * Public API: global.OVBulk
 *   new OVBulk(); addField/removeField/addBulk/clear; validate(); getStructure();
 *   getSummary(); getStructuredHash(salt, algo); unstructure(token, salt, algo);
 *   makePayload(overrides); payloadTemplate(); setMeta(partial); toJSON(); fromJSON().
 *
 * Dependencies (must be loaded prior to this file):
 *   - OVHash       (extended here with structured-payload helpers if missing)
 *   - OVStore      (persistence: 'bulk::draft' and 'bulk::meta')
 *   - OVValidators (registry of validator functions)
 */
(function (global) {
  'use strict';

  /* === Polyfill OVHash with structured-payload helpers (idempotent) === */
  if (global.OVHash && !global.OVHash.makePayload) {
    const SCHEMA_VERSION  = 'ovstruct-v1';
    const SCHEMA_REQUIRED = ['entity', 'product', 'version', 'issued', 'plan', 'serial'];
    const SCHEMA_OPTIONAL = ['expires', 'flags'];

    function _newSerial() {
      const r = Math.random().toString(36).slice(2, 8);
      return 'lic-' + Date.now().toString(36) + r;
    }
    function _defaultPayload(overrides) {
      overrides = overrides || {};
      const base = {
        entity: 'anonymous', product: 'ov-validator', version: '1.0.0',
        issued: Date.now(), expires: undefined, plan: 'free',
        flags: [], serial: _newSerial(), schemaVersion: SCHEMA_VERSION,
      };
      const out = Object.assign({}, base, overrides);
      out.schemaVersion = SCHEMA_VERSION;
      return out;
    }
    function makePayload(overrides) { return _defaultPayload(overrides); }

    function validatePayload(payload) {
      const errors = [];
      if (!payload || typeof payload !== 'object') {
        errors.push('payload must be an object');
        return { valid: false, errors };
      }
      for (const k of SCHEMA_REQUIRED) {
        if (payload[k] === undefined || payload[k] === null || payload[k] === '') {
          errors.push('Missing required field: ' + k);
        }
      }
      for (const k of SCHEMA_OPTIONAL) {
        if (payload[k] !== undefined && payload[k] === null) {
          errors.push('Optional field "' + k + '" must not be null');
        }
      }
      if (payload && payload.flags !== undefined && !Array.isArray(payload.flags)) {
        errors.push('flags must be an array');
      }
      if (payload && payload.schemaVersion !== SCHEMA_VERSION) {
        errors.push('schemaVersion must be "' + SCHEMA_VERSION + '"');
      }
      return { valid: errors.length === 0, errors };
    }
    function payloadTemplate() {
      return {
        schemaVersion: SCHEMA_VERSION,
        required: SCHEMA_REQUIRED.slice(),
        optional: SCHEMA_OPTIONAL.slice(),
        types: {
          entity: 'string', product: 'string', version: 'string',
          issued: 'number (ms)', expires: 'number (ms)',
          plan: 'string', flags: 'array<string>', serial: 'string',
        },
      };
    }
    function _canon(obj) {
      if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
      if (Array.isArray(obj)) return '[' + obj.map(_canon).join(',') + ']';
      const keys = Object.keys(obj).sort();
      return '{' + keys.map(k => JSON.stringify(k) + ':' + _canon(obj[k])).join(',') + '}';
    }
    function structuredHash(payload, salt, algorithm) {
      const algo = algorithm || 'feistel-v1';
      const body = algo + '|' + (salt || '') + '|' + _canon(payload);
      return global.OVHash.encode(body, salt || '');
    }
    function structured(payload, salt, algorithm) {
      const algo = algorithm || 'feistel-v1';
      const json = JSON.stringify(payload);
      const hash = structuredHash(payload, salt, algo);
      const body = global.OVHash.encode(json, salt || '');
      return algo + '$' + hash + '$' + body;
    }
    function unstructure(token, salt, algorithm) {
      const errors = [];
      if (typeof token !== 'string') {
        return { valid: false, payload: null, errors: ['token must be a string'] };
      }
      const parts = token.split('$');
      if (parts.length < 3) {
        return { valid: false, payload: null, errors: ['malformed token (need 3+ parts)'] };
      }
      const algo = parts[0];
      const hash = parts[1];
      const body  = parts.slice(2).join('$');
      if (algorithm && algo !== algorithm) {
        errors.push('algorithm mismatch: expected ' + algorithm + ', got ' + algo);
      }
      const json = global.OVHash.decode(body, salt || null);
      if (json === null) {
        errors.push('body decode failed (wrong salt or tampered)');
        return { valid: false, payload: null, errors };
      }
      let payload;
      try { payload = JSON.parse(json); }
      catch (e) { errors.push('payload JSON parse failed'); return { valid: false, payload: null, errors }; }
      const recomputed = structuredHash(payload, salt, algo);
      if (recomputed !== hash) {
        errors.push('hash mismatch (tampered payload)');
        return { valid: false, payload, errors };
      }
      const v = validatePayload(payload);
      if (!v.valid) errors.push.apply(errors, v.errors);
      return { valid: v.valid, payload, errors };
    }
    Object.assign(global.OVHash, {
      SCHEMA_VERSION, makePayload, validatePayload, payloadTemplate,
      structuredHash, structured, unstructure,
    });
  }

/* ===================================================================
   * 2. OVBulk constructor + helpers
   * =================================================================== */

  const DRAFT_KEY  = 'bulk::draft';
  const META_KEY   = 'bulk::meta';
  const VALIDATORS = global.OVValidators || {};
  const STORE      = global.OVStore || null;
  const HASH       = global.OVHash;

  // Heuristics for plan & flag auto-detection
  const PRO_TIER_SLUGS = ['creditCard', 'phone', 'json', 'base64', 'ipv6', 'semver', 'hash', 'password'];
  const FLAG_MAP = {
    email: 'has_email', phone: 'has_phone', url: 'has_url', json: 'has_json',
    uuid: 'has_uuid', ipv4: 'has_ipv4', ipv6: 'has_ipv6',
    creditCard: 'has_creditcard', password: 'has_password',
    semver: 'has_semver', base64: 'has_base64', hash: 'has_hash',
    color: 'has_color', date: 'has_date',
  };

  function _isEmpty(v) {
    return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
  }
  function _shortId() { return Math.random().toString(36).slice(2, 10); }
  function _fingerprint(slug, value, valid, reason) {
    try {
      return HASH.encode(String(slug) + '|' + String(value) + '|' + (valid ? '1' : '0') + '|' + (reason || ''), _shortId()).slice(0, 24);
    } catch (_) {
      return (slug + ':' + (valid ? '1' : '0') + ':' + (reason || '')).slice(0, 24);
    }
  }

  function OVBulk() {
    if (!(this instanceof OVBulk)) return new OVBulk();
    this.fields  = {};
    this.order   = [];
    this.results = [];
    this.payload = null;
    this.meta    = {};
    this._restore();
  }

  /* ----- persistence ----- */
  OVBulk.prototype._restore = function () {
    if (!STORE) return;
    try {
      const draft = STORE.get(DRAFT_KEY, null);
      if (draft && typeof draft === 'object') {
        this.fields = Object.assign({}, draft.fields || {});
        this.order  = Array.isArray(draft.order) ? draft.order.slice() : Object.keys(this.fields);
      }
      const meta = STORE.get(META_KEY, null);
      if (meta && typeof meta === 'object') this.meta = Object.assign({}, meta);
    } catch (_) {}
  };
  OVBulk.prototype._persistDraft = function () {
    if (!STORE) return;
    try { STORE.set(DRAFT_KEY, { fields: this.fields, order: this.order }); } catch (_) {}
  };
  OVBulk.prototype._persistMeta = function () {
    if (!STORE) return;
    try { STORE.set(META_KEY, this.meta); } catch (_) {}
  };

  /* ----- field management ----- */
  OVBulk.prototype.addField = function (slug, value) {
    if (!slug) return this;
    if (!(slug in this.fields)) this.order.push(slug);
    this.fields[slug] = value;
    this._persistDraft();
    return this;
  };
  OVBulk.prototype.removeField = function (slug) {
    if (slug in this.fields) {
      delete this.fields[slug];
      this.order = this.order.filter(s => s !== slug);
      this._persistDraft();
    }
    return this;
  };
  OVBulk.prototype.addBulk = function (fields) {
    if (!fields) return this;
    if (Array.isArray(fields)) {
      fields.forEach(f => { if (f && f.slug) this.addField(f.slug, f.value); });
    } else if (typeof fields === 'object') {
      Object.keys(fields).forEach(slug => this.addField(slug, fields[slug]));
    }
    return this;
  };
  OVBulk.prototype.clear = function () {
    this.fields  = {};
    this.order   = [];
    this.results = [];
    this._persistDraft();
    return this;
  };

  /* ----- single-field validator runner ----- */
  OVBulk.prototype._runOne = function (slug, value) {
    const v     = VALIDATORS[slug];
    const label = v && v.name ? v.name : slug;
    const icon  = v && v.icon ? v.icon : '*';

    if (_isEmpty(value)) {
      return {
        slug, label, icon, value,
        valid: false, reason: 'empty', meta: {},
        fingerprint: _fingerprint(slug, value, false, 'empty'),
      };
    }
    if (!v || typeof v.fn !== 'function') {
      return {
        slug, label, icon, value,
        valid: false, reason: 'no_validator', meta: {},
        fingerprint: _fingerprint(slug, value, false, 'no_validator'),
      };
    }

    let res;
    try { res = v.fn(value) || {}; }
    catch (e) {
      return {
        slug, label, icon, value,
        valid: false, reason: 'validator_threw:' + (e && e.message ? e.message : 'error'),
        meta: {},
        fingerprint: _fingerprint(slug, value, false, 'validator_threw'),
      };
    }

    const valid  = res.valid === true;
    const reason = valid ? null : (res.reason || 'invalid');
    const meta   = (res.meta && typeof res.meta === 'object') ? res.meta : {};
    return {
      slug, label, icon, value, valid, reason, meta,
      fingerprint: _fingerprint(slug, value, valid, reason),
    };
  };

  OVBulk.prototype._autoPlan = function (results) {
    const slugs  = results.map(r => r.slug);
    const hasPro = slugs.some(s => PRO_TIER_SLUGS.indexOf(s) !== -1);
    if (hasPro) return 'pro';
    if (slugs.length >= 3) return 'team';
    return 'free';
  };
  OVBulk.prototype._autoFlags = function (results) {
    const flags = [];
    results.forEach(r => {
      const f = FLAG_MAP[r.slug];
      if (f && flags.indexOf(f) === -1) flags.push(f);
    });
    return flags;
  };
  OVBulk.prototype._summaryFrom = function (results) {
    const byValidator = {};
    let passed = 0, failed = 0;
    results.forEach(r => {
      byValidator[r.slug] = (byValidator[r.slug] || 0) + 1;
      if (r.valid) passed++; else failed++;
    });
    return { total: results.length, passed, failed, byValidator, timestamp: Date.now() };
  };

  /* ----- core: validate() ----- */
  OVBulk.prototype.validate = function () {
    const results = [];
    for (let i = 0; i < this.order.length; i++) {
      const slug  = this.order[i];
      const value = this.fields[slug];
      if (_isEmpty(value)) continue;
      results.push(this._runOne(slug, value));
    }
    this.results = results;

    const overrides = Object.assign({}, this.meta);
    if (!overrides.plan)   overrides.plan   = this._autoPlan(results);
    if (!overrides.flags)  overrides.flags  = this._autoFlags(results);
    if (!overrides.issued) overrides.issued = Date.now();

    this.payload = HASH.makePayload(overrides);
    this.payload.fields  = results;
    this.payload.summary = this._summaryFrom(results);
    return results;
  };

  OVBulk.prototype.getStructure = function () {
    if (!this.payload) this.validate();
    return this.payload;
  };
  OVBulk.prototype.getSummary = function () {
    if (!this.payload) this.validate();
    return this.payload.summary;
  };
/* ----- structured-hash round-trip ----- */
  OVBulk.prototype.getStructuredHash = function (salt, algorithm) {
    if (!this.payload) this.validate();
    const v = HASH.validatePayload(this.payload);
    if (!v.valid) {
      const msg = 'OVBulk payload invalid: ' + v.errors.join('; ');
      const err = new Error(msg);
      err.errors = v.errors;
      throw err;
    }
    return HASH.structured(this.payload, salt || '', algorithm || 'feistel-v1');
  };

  OVBulk.prototype.unstructure = function (token, salt, algorithm) {
    const result = HASH.unstructure(token, salt || '', algorithm || null);
    if (result.valid && result.payload) {
      this.payload = result.payload;
      if (Array.isArray(result.payload.fields)) {
        this.results = result.payload.fields;
        this.fields  = {};
        this.order   = [];
        result.payload.fields.forEach(r => {
          this.fields[r.slug] = r.value;
          this.order.push(r.slug);
        });
        this._persistDraft();
      }
      if (result.payload.entity || result.payload.product || result.payload.version || result.payload.plan) {
        this.meta = {
          entity:  result.payload.entity,
          product: result.payload.product,
          version: result.payload.version,
          plan:    result.payload.plan,
          serial:  result.payload.serial,
        };
        this._persistMeta();
      }
    }
    return result;
  };
/* ----- template & meta ----- */
  OVBulk.prototype.payloadTemplate = function () { return HASH.payloadTemplate(); };
  OVBulk.prototype.makePayload = function (overrides) {
    return HASH.makePayload(Object.assign({}, this.meta, overrides || {}));
  };
  OVBulk.prototype.setMeta = function (partial) {
    if (!partial || typeof partial !== 'object') return this;
    this.meta = Object.assign({}, this.meta, partial);
    this._persistMeta();
    this.payload = null;
    return this;
  };
  OVBulk.prototype.getMeta = function () { return Object.assign({}, this.meta); };

  global.OVBulk = OVBulk;
})(window);