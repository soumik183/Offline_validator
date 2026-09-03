/**
 * app.js
 * Minimalist Multi-Type Encoder & Decoder Controller.
 * 100% Client-Side, Pure Black & White Theme.
 * Supports in-place type switching, date formatting, and details/examples.
 */
(function () {
  'use strict';

  // Field type definitions with details and examples
  const TYPE_DEFS = {
    text: {
      name: 'Text / Message',
      placeholder: 'Enter text message, payload, or secret note…',
      details: 'Plain text string, notes, or message.',
      example: 'Confidential message or payload 2026',
      multiline: true,
      generator: makeSampleText,
      genLabel: '⚡ Sample Text',
    },
    uuid: {
      name: 'UUID (v4)',
      placeholder: 'e.g. 550e8400-e29b-41d4-a716-446655440000',
      details: '128-bit RFC 4122 v4 cryptographically secure unique ID.',
      example: 'c3905e0e-9bd8-49fb-898e-49b493777555',
      multiline: false,
      generator: makeUUID,
      genLabel: '⚡ Generate UUID',
    },
    userid: {
      name: 'User ID',
      placeholder: 'e.g. usr_9f3a2b1c8e',
      details: 'Prefixed unique account, entity, or member ID.',
      example: 'usr_8f3a2b1c9e',
      multiline: false,
      generator: makeUserID,
      genLabel: '⚡ Generate User ID',
    },
    date: {
      name: 'Date & Time',
      placeholder: 'e.g. 2026-09-03T12:00:00Z',
      details: 'Formatted date & time string or UNIX timestamp.',
      example: '2026-09-03T12:00:00Z',
      multiline: false,
      isDate: true,
      generator: makeDateNow,
      genLabel: '⚡ Set Current Time',
    },
    number: {
      name: 'Number',
      placeholder: 'e.g. 984520',
      details: 'Numerical integer, decimal, or quantity.',
      example: '984520',
      multiline: false,
      generator: makeRandomNumber,
      genLabel: '⚡ Random Number',
    },
    salt: {
      name: 'Secret Key / Salt',
      placeholder: 'e.g. secret_salt_xyz99',
      details: 'Secret key, pepper, or encryption salt.',
      example: 'key_9941aB#xYz',
      multiline: false,
      generator: makeSampleSalt,
      genLabel: '⚡ Generate Key',
    },
    json: {
      name: 'JSON Data',
      placeholder: '{\n  "key": "value"\n}',
      details: 'Structured JSON key-value object or array.',
      example: '{"status": "active", "role": "admin"}',
      multiline: true,
      generator: makeSampleJSON,
      genLabel: '⚡ Sample JSON',
    },
    custom: {
      name: 'Custom Type',
      placeholder: 'Enter custom value…',
      details: 'User-defined custom field value.',
      example: 'custom-data-value-123',
      multiline: false,
      isCustom: true,
    },
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
      customName: type === 'custom' ? 'Custom' : '',
      dateFormat: 'iso',
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

  function changeFieldType(id, newType) {
    const f = fields.find(item => item.id === id);
    if (!f) return;
    f.type = newType;
    const def = TYPE_DEFS[newType] || TYPE_DEFS.text;

    // Provide default generated value if field is currently blank
    if (!f.value && def.generator) {
      f.value = def.generator(f.dateFormat);
    }
    if (newType === 'date' && !f.value) {
      f.value = formatDateByType(new Date(), f.dateFormat || 'iso');
    }

    renderFieldsList();
    toast('TYPE CHANGED', `Field #${fields.indexOf(f) + 1} is now ${def.name}.`);
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
      const isDate = f.type === 'date';
      const isCustom = f.type === 'custom';

      return `
        <div class="p-3.5 sm:p-4 bg-neutral-900/60 border border-neutral-800 rounded-lg space-y-2.5 transition-all" data-field-id="${f.id}">
          <!-- Top Row: Field Number + Type Dropdown + Action Buttons -->
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge-mono text-[10px] !bg-neutral-800 font-bold">Field #${idx + 1}</span>

              <!-- In-place Type Selector to change type anytime -->
              <select class="field-type-select input-mono !py-1 !px-2.5 !text-xs !w-auto font-bold cursor-pointer" data-field-id="${f.id}" title="Change type for this field">
                <option value="text" ${f.type === 'text' ? 'selected' : ''}>Text / Message</option>
                <option value="uuid" ${f.type === 'uuid' ? 'selected' : ''}>UUID (v4)</option>
                <option value="userid" ${f.type === 'userid' ? 'selected' : ''}>User ID (usr_...)</option>
                <option value="date" ${f.type === 'date' ? 'selected' : ''}>Date &amp; Time</option>
                <option value="number" ${f.type === 'number' ? 'selected' : ''}>Number</option>
                <option value="salt" ${f.type === 'salt' ? 'selected' : ''}>Secret Key / Salt</option>
                <option value="json" ${f.type === 'json' ? 'selected' : ''}>JSON Data</option>
                <option value="custom" ${f.type === 'custom' ? 'selected' : ''}>Custom Type...</option>
              </select>

              ${isCustom ? `
                <input type="text" class="field-custom-name input-mono !py-1 !px-2 !text-xs !w-32 font-bold" data-field-id="${f.id}" value="${escapeHtml(f.customName || 'Custom')}" placeholder="Custom type name..." title="Name your custom type" />
              ` : ''}
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

          <!-- When Date & Time is selected: Show Date & Time Format Selector Bar -->
          ${isDate ? `
            <div class="flex flex-wrap items-center gap-2 p-2 bg-black/60 border border-neutral-800 rounded text-xs">
              <span class="text-neutral-400 font-bold uppercase text-[10px]">Date Format:</span>
              <select class="field-date-format input-mono !py-0.5 !px-2 !text-[11px] !w-auto font-mono cursor-pointer" data-field-id="${f.id}" title="Select date/time representation format">
                <option value="iso" ${f.dateFormat === 'iso' ? 'selected' : ''}>ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)</option>
                <option value="dateonly" ${f.dateFormat === 'dateonly' ? 'selected' : ''}>Date Only (YYYY-MM-DD)</option>
                <option value="human" ${f.dateFormat === 'human' ? 'selected' : ''}>Human (DD/MM/YYYY HH:mm:ss)</option>
                <option value="unix" ${f.dateFormat === 'unix' ? 'selected' : ''}>Unix Seconds (10-digit)</option>
                <option value="unix_ms" ${f.dateFormat === 'unix_ms' ? 'selected' : ''}>Unix Milliseconds (13-digit)</option>
              </select>
              <button type="button" class="btn-date-now btn-mono !py-0.5 !px-2 text-[10px]" data-field-id="${f.id}" title="Update to current time in chosen format">
                ⚡ Set Now
              </button>
            </div>
          ` : ''}

          <!-- Value Input / Textarea -->
          <div>
            ${def.multiline ? `
              <textarea rows="2" class="input-field-val input-mono text-xs font-mono resize-y" data-field-id="${f.id}" placeholder="${escapeHtml(def.placeholder)}">${escapeHtml(f.value)}</textarea>
            ` : `
              <input type="text" class="input-field-val input-mono text-xs font-mono" data-field-id="${f.id}" value="${escapeHtml(f.value)}" placeholder="${escapeHtml(def.placeholder)}" />
            `}
          </div>

          <!-- Little bit of details and example for all textareas / inputs -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-neutral-400 font-mono gap-1 pt-0.5">
            <span>Details: ${escapeHtml(isDate ? getDateDetailsString(f.dateFormat) : def.details)}</span>
            <span class="text-neutral-500 font-normal">ex: <span class="text-neutral-300 font-semibold">${escapeHtml(isDate ? getDateExampleString(f.dateFormat) : def.example)}</span></span>
          </div>
        </div>
      `;
    }).join('');

    // Attach listeners to input value fields
    container.querySelectorAll('.input-field-val').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = +e.target.dataset.fieldId;
        const f = fields.find(item => item.id === id);
        if (f) f.value = e.target.value;
      });
    });

    // Attach listeners to type selector dropdowns
    container.querySelectorAll('.field-type-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = +e.target.dataset.fieldId;
        changeFieldType(id, e.target.value);
      });
    });

    // Attach listeners to custom type name input
    container.querySelectorAll('.field-custom-name').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const id = +e.target.dataset.fieldId;
        const f = fields.find(item => item.id === id);
        if (f) f.customName = e.target.value.trim() || 'Custom';
      });
    });

    // Attach listeners to date format selector
    container.querySelectorAll('.field-date-format').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = +e.target.dataset.fieldId;
        const f = fields.find(item => item.id === id);
        if (f) {
          f.dateFormat = e.target.value;
          f.value = formatDateByType(new Date(), f.dateFormat);
          renderFieldsList();
          toast('DATE FORMAT', `Updated to ${e.target.value.toUpperCase()}.`);
        }
      });
    });

    // Attach listeners to date 'Set Now' buttons
    container.querySelectorAll('.btn-date-now').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = +e.target.dataset.fieldId;
        const f = fields.find(item => item.id === id);
        if (f) {
          f.value = formatDateByType(new Date(), f.dateFormat || 'iso');
          const inp = container.querySelector(`.input-field-val[data-field-id="${id}"]`);
          if (inp) inp.value = f.value;
          toast('TIME SET', 'Filled current date/time.');
        }
      });
    });

    // Attach listeners to generator buttons
    container.querySelectorAll('.btn-gen-field').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = +e.target.dataset.fieldId;
        const f = fields.find(item => item.id === id);
        const def = f && TYPE_DEFS[f.type];
        if (f && def && def.generator) {
          f.value = def.generator(f.dateFormat);
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
        toast('ADDED', `Added new ${TYPE_DEFS[type]?.name || type} field.`);
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
      fields: fields.map((f, i) => {
        const def = TYPE_DEFS[f.type] || TYPE_DEFS.text;
        const displayName = f.type === 'custom' ? (f.customName || 'Custom') : def.name;
        return {
          id: i + 1,
          type: f.type,
          name: displayName,
          dateFormat: f.type === 'date' ? (f.dateFormat || 'iso') : undefined,
          val: f.value,
        };
      })
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
          <div class="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-400 font-mono space-y-1">
            <div class="font-bold text-white">Invalid token or checksum verification failed.</div>
            <div>Possible causes: Incorrect Secret Key, corrupted characters, or tampered payload.</div>
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
        fieldsList.innerHTML = parsedPayload.fields.map((f, i) => {
          const def = TYPE_DEFS[f.type] || TYPE_DEFS.text;
          const formatNote = f.dateFormat ? ` [Format: ${f.dateFormat.toUpperCase()}]` : '';
          return `
            <div class="p-3.5 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="badge-mono text-[10px] font-bold">Field #${f.id || i + 1}</span>
                  <span class="badge-mono text-[10px] badge-mono-invert font-bold">${escapeHtml(f.name || f.type || 'Custom')}${formatNote}</span>
                </div>
                <button type="button" class="btn-copy-val btn-mono !py-0.5 !px-2.5 text-[10px] font-bold" data-val="${escapeHtml(f.val)}">
                  Copy Value
                </button>
              </div>
              <div class="hash-output-box text-xs font-mono !bg-black">${escapeHtml(f.val || '(empty)')}</div>
              <div class="text-[10px] text-neutral-500 font-mono">Type Details: ${escapeHtml(def.details || 'Decoded field value.')}</div>
            </div>
          `;
        }).join('');
      }
    } else {
      // Single plain string token
      if (titleEl) titleEl.textContent = 'DECODED SUCCESSFULLY · 1 VALUE DETECTED';
      if (fieldsList) {
        fieldsList.innerHTML = `
          <div class="p-3.5 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
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
            <div class="text-[10px] text-neutral-500 font-mono">Type Details: Single plain text value decoded from legacy or single-string token.</div>
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
     DATE & TIME FORMATTING HELPERS
     ============================================================ */
  function formatDateByType(d, fmt = 'iso') {
    const date = (d instanceof Date) ? d : new Date(d || Date.now());
    if (isNaN(date.getTime())) return new Date().toISOString();
    if (fmt === 'dateonly') return date.toISOString().slice(0, 10);
    if (fmt === 'unix') return String(Math.floor(date.getTime() / 1000));
    if (fmt === 'unix_ms') return String(date.getTime());
    if (fmt === 'human') {
      const pad = n => String(n).padStart(2, '0');
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
    return date.toISOString();
  }

  function getDateDetailsString(fmt = 'iso') {
    const map = {
      iso: 'Standard ISO 8601 UTC timestamp format.',
      dateonly: 'Calendar date without time component (YYYY-MM-DD).',
      human: 'Human readable formatted date and 24-hour time.',
      unix: '10-digit Unix timestamp in seconds.',
      unix_ms: '13-digit Unix timestamp in milliseconds.',
    };
    return map[fmt] || map.iso;
  }

  function getDateExampleString(fmt = 'iso') {
    const map = {
      iso: '2026-09-03T12:00:00Z',
      dateonly: '2026-09-03',
      human: '03/09/2026 12:00:00',
      unix: '1788414136',
      unix_ms: '1788414136000',
    };
    return map[fmt] || map.iso;
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

  function makeDateNow(fmt = 'iso') {
    return formatDateByType(new Date(), fmt);
  }

  function makeRandomNumber() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function makeSampleText() {
    return 'Confidential Payload 2026';
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
