/**
 * storage.js
 * Thin wrapper around localStorage with namespacing + JSON support.
 * All data is encoded with the custom hash from hash.js so it never
 * sits in plain text in the browser storage.
 */
(function (global) {
  'use strict';

  const NS = 'ov_app_v1::';
  const PREFIX = NS;

  function _k(key) { return PREFIX + key; }

  function available() {
    try {
      const t = '__ov_test__';
      localStorage.setItem(t, t);
      localStorage.removeItem(t);
      return true;
    } catch (_) { return false; }
  }

  function getRaw(key) {
    try { return localStorage.getItem(_k(key)); } catch (_) { return null; }
  }

  function setRaw(key, val) {
    try { localStorage.setItem(_k(key), val); return true; } catch (_) { return false; }
  }

  function remove(key) {
    try { localStorage.removeItem(_k(key)); } catch (_) {}
  }

  /**
   * get(key, defaultValue) - returns decoded plain object/string.
   * Returns the stored plain value (auto-decoded if it was encoded at write time).
   */
  function get(key, defaultValue = null) {
    const raw = getRaw(key);
    if (raw === null) return defaultValue;
    // Try decode via hash; if fails, fall back to raw JSON.
    try {
      const decoded = OVHash.decode(raw);
      if (decoded === null) {
        try { return JSON.parse(raw); } catch (_) { return raw; }
      }
      try { return JSON.parse(decoded); } catch (_) { return decoded; }
    } catch (_) {
      try { return JSON.parse(raw); } catch (_) { return raw; }
    }
  }

  /**
   * set(key, value) - JSON-stringifies value then encodes with hash.
   */
  function set(key, value) {
    const json = JSON.stringify(value);
    const encoded = OVHash.encode(json);
    return setRaw(key, encoded);
  }

  function clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(k => { if (k.startsWith(NS)) localStorage.removeItem(k); });
    } catch (_) {}
  }

  function keys() {
    try {
      return Object.keys(localStorage).filter(k => k.startsWith(NS)).map(k => k.slice(NS.length));
    } catch (_) { return []; }
  }

  global.OVStore = { get, set, remove, clear, keys, available };
})(window);
