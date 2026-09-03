/**
 * app.js
 * Minimalist Multi-Type Encoder & Decoder Controller.
 * 100% Client-Side, Pure Black & White Theme.
 */
(function () {
  'use strict';

  // Field type definitions
  const TYPE_DEFS = {
    text: { name: 'Text / Message', placeholder: 'Enter text message or secret note…', multiline: true },
    uuid: { name: 'UUID (v4)', placeholder: 'e.g. 550e8400-e29b-41d4-a716-446655440000', multiline: false, generator: makeUUID, genLabel: '⚡ Generate UUID' },
    userid: { name: 'User ID', placeholder: 'e.g. usr_9f3a2b1c8e', multiline: false, generator: makeUserID, genLabel: '⚡ Generate User ID' },
    date: { name: 'Date & Time', placeholder: 'e.g. 2026-09-03T12:00:00Z', multiline: false, generator: makeDateNow, genLabel: '⚡ Set Current Time' },
    number: { name: 'Number', placeholder: 'e.g. 984520', multiline: false, generator: makeRandomNumber, genLabel: '⚡ Random Number' },
    salt: { name: 'Secret Key / Salt', placeholder: 'e.g. secret_salt_xyz99', multiline: false, generator: makeSampleSalt, genLabel: '⚡ Generate Key' },
    json: { name: 'JSON Data', placeholder: '{\n  "key": "value"\n}', multiline: true, generator: makeSampleJSON, genLabel: '⚡ Sample JSON' },
  };

  // State
  let nextFieldId = 1;
  let fields = [];

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initTheme();
    setupThemeToggle();
    setupOnlineStatus();

    // Render single page shell
    const $app = document.getElementById('app');
    if ($app && window.OVPages && typeof window.OVPages.singlePage === 'function') {
      $app.innerHTML = window.OVPages.singlePage();
    }

    // Initialize with 1 default text field
    addField('text', '');

    // Bind event listeners
    bindEncoderEvents();
    bindDecoderEvents();
  }

  /* ============================================================
     THEME & ONLINE STATUS
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
      toast(next.toUpperCase() + ' THEME', 'Monochrome palette switched.');
    });
  }

  function setupOnlineStatus() {
    const dot = document.getElementById('online-status-dot');
    const text = document.getElementById('online-status-text');
    const update = () => {
      const online = navigator.onLine;
      if (dot) dot.style.opacity = online ? '1' : '0.3';
      if (text) text.textContent = online ? 'OFFLINE READY' : 'OFFLINE MODE';
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  }

  /* ============================================================
     CARD 1: ENCODER CONTROLLER
     ============================================================ */
  function addField(type = 'text', initialValue = '') {
    const def = TYPE_DEFS[type] || TYPE_DEFS.text;
    const fieldObj = {
      id: nextFieldId++,
      type: type,
      name: def.name,
      value: initialValue || (def.generator ? def.generator() : ''),
    };
    fields.push(fieldObj);
    renderFieldsList();
  }

  function removeField(id) {
    if (fields.length <= 1) {
      toast('NOTICE', 'At least 1 field must be present.');
      return;
    }
    fields = fields.filter(f => f.id !== id);
    renderFieldsList();
  }

  function renderFieldsList() {
    const container = document.getElementById('encoder-fields-list');
    const badge = document.getElementById('fields-badge-cnt');
    if (!container) return;

    if (badge) {
      badge.textContent = `${fields.length} ${fields.length === 1 ? 'TYPE' : 'TYPES'} SELECTED`;
    }

    container.innerHTML = fields.map((f, idx) => {
      const def = TYPE_DEFS[f.type] || TYPE_DEFS.text;
      const hasGen = typeof def.generator === 'function';

      return `
        <div class="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-lg space-y-2.5 transition-all" data-field-id="${f.id}">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="badge-mono text-[10px] !bg-neutral-800 font-bold">#${idx + 1}</span>
              <span class="badge-mono text-[10px] badge-mono-invert font-bold">${escapeHtml(def.name)}</span>
            </div>
            <div class="flex items-center gap-1.5">
              ${hasGen ? `
                <button type="button" class="btn-gen-field btn-mono !py-0.5 !px-2 text-[10px]" data-field-id="${f.id}">
                  ${def.genLabel || '⚡ Generate'}
                </button>
              ` : ''}
              ${fields.length > 1 ? `
                <button type="button" class="btn-rem-field btn-mono !py-0.5 !px-2 text-[10px] text-neutral-400 hover:text-white" data-field-id="${f.id}" title="Remove this field">
                  ✕ Remove
                </button>
              ` : ''}
            </div>
          </div>

          <div>
            ${def.multiline ? `
              <textarea rows="2" class="input-field-val input-mono text-xs font-mono resize-y" data-field-id="${f.id}" placeholder="${escapeHtml(def.placeholder)}">${escapeHtml(f.value)}</textarea>
            ` : `
              <input type="text" class="input-field-val input-mono text-xs font-mono" data-field-id="${f.id}" value="${escapeHtml(f.value)}" placeholder="${escapeHtml(def.placeholder)}" />
            `}
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners to input fields
    container.querySelectorAll('.input-field-val').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = +e.target.dataset.fieldId;
        const f = fields.find(item => item.id === id);
        if (f) f.value = e.target.value;
      });
    });

    // Attach listeners to generator buttons
    container.querySelectorAll('.btn-gen-field').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = +e.target.dataset.fieldId;
        const f = fields.find(item => item.id === id);
        const def = f && TYPE_DEFS[f.type];
        if (f && def && def.generator) {
          f.value = def.generator();
          const inp = container.querySelector(`.input-field-val[data-field-id="${id}"]`);
          if (inp) inp.value = f.value;
          toast('UPDATED', `Generated fresh ${def.name}.`);
        }
      });
    });

    // Attach listeners to remove buttons
    container.querySelectorAll('.btn-rem-field').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = +e.target.dataset.fieldId;
        removeField(id);
      });
    });
  }

  function bindEncoderEvents() {
    // Add Type Button
    const addBtn = document.getElementById('btn-add-type');
    const selType = document.getElementById('sel-add-type');
    if (addBtn && selType) {
      addBtn.addEventListener('click', () => {
        const type = selType.value;
        addField(type);
        toast('ADDED', `Added ${TYPE_DEFS[type]?.name || type} field.`);
      });
    }

    // Run Encode Button
    const encodeBtn = document.getElementById('btn-run-encode');
    if (encodeBtn) {
      encodeBtn.addEventListener('click', runEncode);
    }

    // Reset Button
    const clearBtn = document.getElementById('btn-clear-encoder');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        fields = [];
        nextFieldId = 1;
        addField('text', '');
        const secretIn = document.getElementById('encoder-secret-key');
        if (secretIn) secretIn.value = '';
        const outSection = document.getElementById('encoder-output-section');
        if (outSection) outSection.classList.add('hidden');
        toast('RESET', 'Encoder fields cleared.');
      });
    }

    // Copy Output Button
    const copyBtn = document.getElementById('btn-copy-encoded');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const outText = document.getElementById('encoder-output-text');
        if (outText && outText.value) {
          await navigator.clipboard.writeText(outText.value);
          const origHtml = copyBtn.innerHTML;
          copyBtn.classList.add('btn-copied');
          copyBtn.innerHTML = '<span>✓ COPIED!</span>';
          setTimeout(() => {
            copyBtn.classList.remove('btn-copied');
            copyBtn.innerHTML = origHtml;
          }, 1500);
          toast('COPIED', 'Encoded token copied to clipboard.');
        }
      });
    }
  }

  function runEncode() {
    if (!window.OVHash || typeof window.OVHash.encode !== 'function') {
      toast('ERROR', 'Codec engine not loaded.');
      return;
    }

    // Collect latest inputs
    document.querySelectorAll('#encoder-fields-list .input-field-val').forEach(input => {
      const id = +input.dataset.fieldId;
      const f = fields.find(item => item.id === id);
      if (f) f.value = input.value;
    });

    const secretSalt = document.getElementById('encoder-secret-key')?.value?.trim() || undefined;

    // Build payload structure
    const payload = {
      v: 1,
      ts: Date.now(),
      count: fields.length,
      fields: fields.map((f, i) => ({
        id: i + 1,
        type: f.type,
        name: TYPE_DEFS[f.type]?.name || f.type,
        val: f.value,
      }))
    };

    const jsonStr = JSON.stringify(payload);
    const token = window.OVHash.encode(jsonStr, secretSalt);

    const outSection = document.getElementById('encoder-output-section');
    const outText = document.getElementById('encoder-output-text');
    const statsBadge = document.getElementById('encoder-stats-badge');

    if (outText) outText.value = token;
    if (statsBadge) statsBadge.textContent = `${fields.length} ${fields.length === 1 ? 'TYPE' : 'TYPES'} · ${token.length} CHARS`;
    if (outSection) {
      outSection.classList.remove('hidden');
      outSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    toast('ENCODED ✓', `${fields.length} types bundled into secure token.`);
  }

  /* ============================================================
     CARD 2: DECODER CONTROLLER
     ============================================================ */
  function bindDecoderEvents() {
    // Run Decode Button
    const decodeBtn = document.getElementById('btn-run-decode');
    if (decodeBtn) {
      decodeBtn.addEventListener('click', runDecode);
    }

    // Clear Decoder Button
    const clearBtn = document.getElementById('btn-clear-decoder');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const inp = document.getElementById('decoder-input-text');
        const key = document.getElementById('decoder-secret-key');
        const outSection = document.getElementById('decoder-output-section');
        if (inp) inp.value = '';
        if (key) key.value = '';
        if (outSection) outSection.classList.add('hidden');
        toast('CLEARED', 'Decoder inputs reset.');
      });
    }

    // Paste Button
    const pasteBtn = document.getElementById('btn-paste-decoder');
    if (pasteBtn) {
      pasteBtn.addEventListener('click', async () => {
        try {
          const text = await navigator.clipboard.readText();
          const inp = document.getElementById('decoder-input-text');
          if (inp && text) {
            inp.value = text.trim();
            toast('PASTED', 'Token pasted from clipboard.');
            runDecode();
          }
        } catch (_) {
          toast('NOTICE', 'Clipboard permission not granted. Please paste manually.');
        }
      });
    }
  }

  function runDecode() {
    if (!window.OVHash || typeof window.OVHash.decode !== 'function') {
      toast('ERROR', 'Codec engine not loaded.');
      return;
    }

    const tokenIn = document.getElementById('decoder-input-text')?.value?.trim();
    const secretKey = document.getElementById('decoder-secret-key')?.value?.trim() || undefined;
    const outSection = document.getElementById('decoder-output-section');
    const fieldsList = document.getElementById('decoder-fields-list');
    const titleEl = document.getElementById('decoder-summary-title');
    const chkBadge = document.getElementById('decoder-checksum-badge');

    if (!tokenIn) {
      toast('REQUIRED', 'Please paste an encoded token first.');
      return;
    }

    let decodedRaw = null;
    try {
      decodedRaw = window.OVHash.decode(tokenIn, secretKey);
    } catch (e) {
      decodedRaw = null;
    }

    if (decodedRaw === null) {
      if (outSection && fieldsList) {
        outSection.classList.remove('hidden');
        if (titleEl) titleEl.textContent = 'DECODE FAILED ✗';
        if (chkBadge) {
          chkBadge.textContent = 'INTEGRITY MISMATCH ✗';
          chkBadge.className = 'badge-mono text-[10px] border-neutral-600';
        }
        fieldsList.innerHTML = `
          <div class="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-400 font-mono">
            Invalid token, wrong secret key, or corrupted payload. Checksum verification failed.
          </div>
        `;
      }
      toast('FAILED ✗', 'Checksum mismatch or wrong key.');
      return;
    }

    // Successfully decoded raw text — check if it's our structured multi-type JSON
    let parsedPayload = null;
    try {
      if (decodedRaw.startsWith('{') && decodedRaw.endsWith('}')) {
        parsedPayload = JSON.parse(decodedRaw);
      }
    } catch (_) {
      parsedPayload = null;
    }

    if (chkBadge) {
      chkBadge.textContent = 'FNV-1a Checksum Verified ✓';
      chkBadge.className = 'badge-mono text-[10px] badge-mono-invert';
    }

    if (parsedPayload && Array.isArray(parsedPayload.fields)) {
      // Multi-type payload
      const count = parsedPayload.count || parsedPayload.fields.length;
      if (titleEl) titleEl.textContent = `DECODED SUCCESSFULLY · ${count} ${count === 1 ? 'TYPE' : 'TYPES'} DETECTED`;

      if (fieldsList) {
        fieldsList.innerHTML = parsedPayload.fields.map((f, i) => `
          <div class="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="badge-mono text-[10px] font-bold">Field #${f.id || i + 1}</span>
                <span class="badge-mono text-[10px] badge-mono-invert font-bold">${escapeHtml(f.name || f.type || 'Custom')}</span>
              </div>
              <button type="button" class="btn-copy-val btn-mono !py-0.5 !px-2.5 text-[10px] font-bold" data-val="${escapeHtml(f.val)}">
                Copy Value
              </button>
            </div>
            <div class="hash-output-box text-xs font-mono !bg-black">${escapeHtml(f.val || '(empty)')}</div>
          </div>
        `).join('');
      }
    } else {
      // Single plain string token
      if (titleEl) titleEl.textContent = 'DECODED SUCCESSFULLY · 1 VALUE DETECTED';
      if (fieldsList) {
        fieldsList.innerHTML = `
          <div class="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="badge-mono text-[10px] font-bold">Field #1</span>
                <span class="badge-mono text-[10px] badge-mono-invert font-bold">Plain Text</span>
              </div>
              <button type="button" class="btn-copy-val btn-mono !py-0.5 !px-2.5 text-[10px] font-bold" data-val="${escapeHtml(decodedRaw)}">
                Copy Value
              </button>
            </div>
            <div class="hash-output-box text-xs font-mono !bg-black">${escapeHtml(decodedRaw)}</div>
          </div>
        `;
      }
    }

    // Attach copy button handlers on decoded fields
    fieldsList?.querySelectorAll('.btn-copy-val').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const val = e.currentTarget.dataset.val;
        if (val) {
          await navigator.clipboard.writeText(val);
          const origHtml = e.currentTarget.innerHTML;
          e.currentTarget.classList.add('btn-copied');
          e.currentTarget.innerHTML = '<span>✓ COPIED!</span>';
          setTimeout(() => {
            e.currentTarget.classList.remove('btn-copied');
            e.currentTarget.innerHTML = origHtml;
          }, 1500);
          toast('COPIED', val.slice(0, 24) + '…');
        }
      });
    });

    if (outSection) {
      outSection.classList.remove('hidden');
      outSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    toast('DECODED ✓', 'Payload decoded and types verified.');
  }

  /* ============================================================
     TYPE GENERATOR HELPERS
     ============================================================ */
  function makeUUID() {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40; // Version 4
    b[8] = (b[8] & 0x3f) | 0x80; // Variant RFC 4122
    const h = Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
  }

  function makeUserID() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    const b = new Uint8Array(10);
    crypto.getRandomValues(b);
    let id = 'usr_';
    for (let i = 0; i < 10; i++) id += chars[b[i] % chars.length];
    return id;
  }

  function makeDateNow() {
    return new Date().toISOString();
  }

  function makeRandomNumber() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function makeSampleSalt() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const b = new Uint8Array(12);
    crypto.getRandomValues(b);
    let s = 'key_';
    for (let i = 0; i < 12; i++) s += chars[b[i] % chars.length];
    return s;
  }

  function makeSampleJSON() {
    return JSON.stringify({ app: 'OfflineSuite', status: 'secure', level: 1 }, null, 2);
  }

  /* ============================================================
     TOAST NOTIFICATIONS
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

    requestAnimationFrame(() => el.classList.remove('opacity-0', 'translate-y-2'));
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
})();
