/**
 * app.js
 * Minimalist Black & White Single-Page Controller for Offline Hash Engine.
 * Supports 1 or multiple values, multiple cryptographic algorithms,
 * real-time hashing, comparison, and token decoding.
 */
(function () {
  'use strict';

  // State
  let currentAlgo = 'SHA-256';
  let activeFieldsCount = 1; // 1, 2, or 3
  let isUppercase = false;
  let isBase64 = false;
  let rawHashBytes = null;
  let currentHexHash = '';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initTheme();
    setupThemeToggle();
    setupOnlineStatus();

    // Render single-page template
    const $app = document.getElementById('app');
    if ($app && window.OVPages && typeof window.OVPages.singlePage === 'function') {
      $app.innerHTML = window.OVPages.singlePage();
    }

    wireAlgorithmSelector();
    wireFieldSelection();
    wireInputsAndHashing();
    wireOutputActions();
    wireComparison();
    wireDecoder();

    // Initial calculation with sample
    recalculateHash();
  }

  /* ============================================================
     THEME (Pure Black & Pure White)
     ============================================================ */
  function initTheme() {
    const $themeText = document.getElementById('theme-text');
    try {
      const saved = localStorage.getItem('ov-theme');
      if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if ($themeText) $themeText.textContent = 'DARK';
      } else {
        document.documentElement.removeAttribute('data-theme');
        if ($themeText) $themeText.textContent = 'LIGHT';
      }
    } catch (_) {}
  }

  function setupThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const $themeText = document.getElementById('theme-text');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const next = isLight ? 'dark' : 'light';
      if (next === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if ($themeText) $themeText.textContent = 'DARK';
      } else {
        document.documentElement.removeAttribute('data-theme');
        if ($themeText) $themeText.textContent = 'LIGHT';
      }
      try { localStorage.setItem('ov-theme', next); } catch (_) {}
      toast(next.toUpperCase() + ' THEME', 'Switched monochrome appearance.');
    });
  }

  /* ============================================================
     ONLINE STATUS
     ============================================================ */
  function setupOnlineStatus() {
    const dot = document.getElementById('online-status-dot');
    const text = document.getElementById('online-status-text');
    const update = () => {
      const online = navigator.onLine;
      if (dot) dot.style.opacity = online ? '1' : '0.3';
      if (text) text.textContent = online ? 'ONLINE' : 'OFFLINE';
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  }

  /* ============================================================
     STEP 1: ALGORITHM SELECTION
     ============================================================ */
  const ALGO_SPECS = {
    'SHA-256': '256-bit secure cryptographic hash',
    'SHA-512': '512-bit high-security cryptographic hash',
    'SHA-1':   '160-bit legacy cryptographic hash',
    'MD5':     '128-bit RFC 1321 message digest',
    'FNV-1a':  '32-bit Fowler–Noll–Vo non-crypto hash',
    'v1-token':'Reversible XOR stream cipher + salt + FNV-1a',
    'v2-token':'Reversible 8-field structured license token',
  };

  function wireAlgorithmSelector() {
    const pills = document.querySelectorAll('#algo-pills .pill-tab');
    const spec = document.getElementById('algo-spec');
    const badge = document.getElementById('hash-info-badge');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentAlgo = pill.dataset.algo;
        if (spec) spec.textContent = ALGO_SPECS[currentAlgo] || '';
        if (badge) badge.textContent = currentAlgo;
        recalculateHash();
      });
    });
  }

  /* ============================================================
     STEP 2: FIELD SELECTION (1, 2, or Multiple)
     ============================================================ */
  function wireFieldSelection() {
    const modePills = document.querySelectorAll('#mode-pills .pill-tab');
    const cb2 = document.getElementById('check-field-2');
    const cb3 = document.getElementById('check-field-3');
    const wrap2 = document.getElementById('field-wrap-2');
    const wrap3 = document.getElementById('field-wrap-3');
    const combineWrap = document.getElementById('combine-wrap');
    const combineSelect = document.getElementById('combine-mode');

    function updateFieldVisibility() {
      const has2 = cb2?.checked;
      const has3 = cb3?.checked;

      if (wrap2) wrap2.classList.toggle('hidden', !has2);
      if (wrap3) wrap3.classList.toggle('hidden', !has3);

      const count = 1 + (has2 ? 1 : 0) + (has3 ? 1 : 0);
      activeFieldsCount = count;

      if (combineWrap) combineWrap.classList.toggle('hidden', count < 2);

      // Update mode pills active state
      modePills.forEach(p => {
        const m = p.dataset.mode;
        if (m === '1') p.classList.toggle('active', count === 1);
        else if (m === '2') p.classList.toggle('active', count === 2 && !has3);
        else if (m === 'multi') p.classList.toggle('active', count >= 3);
      });

      recalculateHash();
    }

    modePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const mode = pill.dataset.mode;
        if (mode === '1') {
          if (cb2) cb2.checked = false;
          if (cb3) cb3.checked = false;
        } else if (mode === '2') {
          if (cb2) cb2.checked = true;
          if (cb3) cb3.checked = false;
        } else if (mode === 'multi') {
          if (cb2) cb2.checked = true;
          if (cb3) cb3.checked = true;
        }
        updateFieldVisibility();
      });
    });

    cb2?.addEventListener('change', updateFieldVisibility);
    cb3?.addEventListener('change', updateFieldVisibility);
    combineSelect?.addEventListener('change', recalculateHash);
  }

  /* ============================================================
     STEP 3: INPUTS & HASH RECALCULATION
     ============================================================ */
  function wireInputsAndHashing() {
    const val1 = document.getElementById('val-1');
    const val2 = document.getElementById('val-2');
    const val3 = document.getElementById('val-3');
    const cnt1 = document.getElementById('char-count-1');
    const cnt2 = document.getElementById('char-count-2');
    const cnt3 = document.getElementById('char-count-3');
    const btnSample = document.getElementById('btn-sample');
    const btnClear = document.getElementById('btn-clear');

    const updateCounts = () => {
      if (cnt1 && val1) cnt1.textContent = `${val1.value.length} chars`;
      if (cnt2 && val2) cnt2.textContent = `${val2.value.length} chars`;
      if (cnt3 && val3) cnt3.textContent = `${val3.value.length} chars`;
    };

    [val1, val2, val3].forEach(input => {
      if (!input) return;
      input.addEventListener('input', () => {
        updateCounts();
        recalculateHash();
      });
    });

    btnSample?.addEventListener('click', () => {
      if (val1) val1.value = 'Offline Validator 2026';
      if (val2) val2.value = 'secret_salt_key_42';
      if (val3) val3.value = 'extra_token_param';
      updateCounts();
      recalculateHash();
      toast('SAMPLE LOADED', 'Populated test values into active fields.');
    });

    btnClear?.addEventListener('click', () => {
      if (val1) val1.value = '';
      if (val2) val2.value = '';
      if (val3) val3.value = '';
      updateCounts();
      recalculateHash();
      toast('CLEARED', 'Inputs emptied.');
    });
  }

  /* ============================================================
     CRYPTOGRAPHIC HASH COMPUTATION
     ============================================================ */
  async function recalculateHash() {
    const val1 = document.getElementById('val-1')?.value || '';
    const val2 = document.getElementById('val-2')?.value || '';
    const val3 = document.getElementById('val-3')?.value || '';
    const cb2 = document.getElementById('check-field-2')?.checked;
    const cb3 = document.getElementById('check-field-3')?.checked;
    const combineMode = document.getElementById('combine-mode')?.value || 'salted';
    const outputEl = document.getElementById('hash-output');
    const lenEl = document.getElementById('hash-length');

    if (!val1 && (!cb2 || !val2) && (!cb3 || !val3)) {
      if (outputEl) outputEl.innerHTML = '<span class="text-neutral-500 font-normal">Hash will generate automatically as you type…</span>';
      if (lenEl) lenEl.textContent = '0 chars';
      currentHexHash = '';
      rawHashBytes = null;
      checkCompareMatch();
      return;
    }

    try {
      // 1. Reversible v1 Token
      if (currentAlgo === 'v1-token') {
        const salt = (cb2 && val2) ? val2 : undefined;
        const token = window.OVHash.encode(val1, salt);
        renderOutput(token, 'token');
        return;
      }

      // 2. Reversible v2 Token
      if (currentAlgo === 'v2-token') {
        const payload = {
          entity: val1 || 'user_anonymous',
          product: 'offline-validator-suite',
          version: 1,
          issued: Math.floor(Date.now() / 1000),
          serial: (cb2 && val2) ? val2 : 'LIC-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        };
        const r = window.OVHash.structEncode(payload);
        renderOutput(r.token, 'token');
        return;
      }

      // Combine values according to field settings and combineMode
      let combinedData = val1;
      if (cb2 && cb3) {
        if (combineMode === 'colon') combinedData = `${val1}:${val2}:${val3}`;
        else if (combineMode === 'concat') combinedData = `${val1}${val2}${val3}`;
        else if (combineMode === 'newline') combinedData = `${val1}\n${val2}\n${val3}`;
        else combinedData = `${val1}${val2}${val3}`; // salted default
      } else if (cb2) {
        if (combineMode === 'colon') combinedData = `${val1}:${val2}`;
        else if (combineMode === 'concat') combinedData = `${val1}${val2}`;
        else if (combineMode === 'newline') combinedData = `${val1}\n${val2}`;
        else combinedData = `${val1}${val2}`; // salted: value 1 + value 2
      }

      // 3. FNV-1a (32-bit)
      if (currentAlgo === 'FNV-1a') {
        const chk = window.OVHash.checksum32(combinedData);
        renderOutput(chk, 'hex');
        return;
      }

      // 4. MD5 (RFC 1321 pure JS)
      if (currentAlgo === 'MD5') {
        const hex = computeMD5(combinedData);
        renderOutput(hex, 'hex');
        return;
      }

      // 5. Standard WebCrypto Hashes (SHA-256, SHA-512, SHA-1)
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(combinedData);
      const buffer = await crypto.subtle.digest(currentAlgo, dataBytes);
      rawHashBytes = new Uint8Array(buffer);

      const hex = Array.from(rawHashBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      renderOutput(hex, 'hex');

    } catch (err) {
      if (outputEl) outputEl.textContent = 'Error: ' + err.message;
    }
  }

  function renderOutput(resultStr, type) {
    const outputEl = document.getElementById('hash-output');
    const lenEl = document.getElementById('hash-length');

    currentHexHash = resultStr;

    let displayStr = resultStr;
    if (type === 'hex') {
      if (isBase64 && rawHashBytes) {
        displayStr = btoa(String.fromCharCode.apply(null, rawHashBytes));
      } else if (isUppercase) {
        displayStr = resultStr.toUpperCase();
      } else {
        displayStr = resultStr.toLowerCase();
      }
    }

    if (outputEl) outputEl.textContent = displayStr;
    if (lenEl) lenEl.textContent = `${displayStr.length} chars`;

    checkCompareMatch();
  }

  /* ============================================================
     STEP 4: OUTPUT TOOLBAR (Copy, Case, Format)
     ============================================================ */
  function wireOutputActions() {
    const btnCopy = document.getElementById('btn-copy');
    const btnCase = document.getElementById('btn-case');
    const btnFormat = document.getElementById('btn-format');
    const outputEl = document.getElementById('hash-output');

    btnCopy?.addEventListener('click', async () => {
      const text = outputEl?.textContent || '';
      if (!text || text.includes('Hash will generate')) return;
      try {
        await navigator.clipboard.writeText(text);
        toast('COPIED', text.slice(0, 24) + '…');
      } catch (_) {
        toast('FAILED', 'Clipboard access denied.');
      }
    });

    btnCase?.addEventListener('click', () => {
      isUppercase = !isUppercase;
      btnCase.textContent = isUppercase ? 'LOWERCASE' : 'UPPERCASE';
      recalculateHash();
    });

    btnFormat?.addEventListener('click', () => {
      if (currentAlgo.startsWith('v')) {
        toast('INFO', 'Tokens are already Base64URL encoded.');
        return;
      }
      isBase64 = !isBase64;
      btnFormat.textContent = isBase64 ? 'HEX' : 'BASE64';
      recalculateHash();
    });
  }

  /* ============================================================
     STEP 5: VERIFY / COMPARE HASH
     ============================================================ */
  function wireComparison() {
    const compInput = document.getElementById('val-compare');
    compInput?.addEventListener('input', checkCompareMatch);
  }

  function checkCompareMatch() {
    const compInput = document.getElementById('val-compare');
    const badge = document.getElementById('match-badge');
    const outputEl = document.getElementById('hash-output');
    if (!compInput || !badge || !outputEl) return;

    const val = compInput.value.trim();
    const current = outputEl.textContent.trim();

    if (!val || !current || current.includes('Hash will generate')) {
      badge.classList.add('hidden');
      return;
    }

    badge.classList.remove('hidden');
    const isMatch = val.toLowerCase() === current.toLowerCase();

    if (isMatch) {
      badge.textContent = 'MATCH ✓';
      badge.className = 'badge-mono badge-mono-invert text-[10px]';
    } else {
      badge.textContent = 'MISMATCH ✗';
      badge.className = 'badge-mono text-[10px] border-neutral-600 text-neutral-400';
    }
  }

  /* ============================================================
     STEP 6: UNIVERSAL TOKEN DECODER
     ============================================================ */
  function wireDecoder() {
    const decIn = document.getElementById('token-decode-input');
    const decBtn = document.getElementById('btn-decode-run');
    const decResult = document.getElementById('token-decode-result');

    decBtn?.addEventListener('click', () => {
      if (!decIn || !decResult) return;
      const raw = decIn.value.trim();
      if (!raw) {
        decResult.classList.add('hidden');
        return;
      }

      decResult.classList.remove('hidden');

      // 1. JSON License file
      if (raw.startsWith('{')) {
        try {
          const json = JSON.parse(raw);
          if (json.token && json.payload) {
            const r = window.OVHash.structDecode(json.token);
            if (r) {
              renderDecoded('VERIFIED .ovlicense FILE', json.payload);
              return;
            }
          }
        } catch (_) {}
      }

      // 2. v2 structured token (ov2s$)
      if (raw.startsWith('ov2s$')) {
        const r = window.OVHash.structDecode(raw);
        if (r && r.payload) {
          renderDecoded('v2 STRUCTURED PAYLOAD', r.payload);
          return;
        }
      }

      // 3. v1 plain text token (v1$)
      if (raw.startsWith('v1$')) {
        const plain = window.OVHash.decode(raw);
        if (plain !== null) {
          const parts = raw.split('$');
          renderDecoded('v1 REVERSIBLE TOKEN', {
            'value1_data': plain,
            'value2_salt': parts[1] || '(none)',
            'checksum': parts[2] || '',
          });
          return;
        }
      }

      decResult.innerHTML = '<span class="text-neutral-400">Invalid or corrupted token. Check format.</span>';
    });

    function renderDecoded(title, data) {
      let html = `<div class="font-bold text-white mb-2 pb-1 border-b border-neutral-800">${escapeHtml(title)}</div>`;
      Object.entries(data).forEach(([k, v]) => {
        html += `<div class="flex justify-between gap-2 py-0.5"><span class="text-neutral-400">${escapeHtml(k)}:</span><span class="text-white">${escapeHtml(Array.isArray(v) ? v.join(', ') : String(v))}</span></div>`;
      });
      decResult.innerHTML = html;
    }
  }

  /* ============================================================
     TOAST SYSTEM
     ============================================================ */
  function toast(title, msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = 'toast-mono opacity-0 translate-y-2 transition-all duration-200';
    el.innerHTML = `
      <div>
        <span class="font-bold text-white">${escapeHtml(title)}</span>
        ${msg ? `<span class="text-neutral-400 ml-1.5 text-xs">${escapeHtml(msg)}</span>` : ''}
      </div>
    `;
    container.appendChild(el);

    requestAnimationFrame(() => {
      el.classList.remove('opacity-0', 'translate-y-2');
    });

    setTimeout(() => {
      el.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => el.remove(), 200);
    }, 3000);
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ============================================================
     RFC 1321 PURE JS MD5 (Offline & Zero-Dependency)
     ============================================================ */
  function computeMD5(str) {
    function safeAdd(x, y) {
      const lsw = (x & 0xffff) + (y & 0xffff);
      const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff);
    }
    function bitRotateLeft(num, cnt) {
      return (num << cnt) | (num >>> (32 - cnt));
    }
    function md5cmn(q, a, b, x, s, t) {
      return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
    }
    function md5ff(a, b, c, d, x, s, t) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
    function md5gg(a, b, c, d, x, s, t) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
    function md5hh(a, b, c, d, x, s, t) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
    function md5ii(a, b, c, d, x, s, t) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }

    const utf8 = unescape(encodeURIComponent(str));
    const n = utf8.length;
    const words = [];
    for (let i = 0; i < n; i++) {
      words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << ((i % 4) * 8);
    }
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
      let s = '', j = 0;
      for (; j <= 3; j++) s += ((n >> (j * 8 + 4)) & 0x0f).toString(16) + ((n >> (j * 8)) & 0x0f).toString(16);
      return s;
    }
    return rhex(a) + rhex(b) + rhex(c) + rhex(d);
  }

  // Global API
  window.OVHashEngine = {
    computeMD5,
    recalculateHash,
    setAlgorithm: (algo) => {
      currentAlgo = algo;
      recalculateHash();
    },
    toast
  };
})();
