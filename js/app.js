/**
 * app.js
 * Multi-Format Suite Controller: Identifiers, Hashing, Encoding,
 * Date/Time, Random, Text, and Converters.
 * 100% Client-Side, Black & White Monochrome Theme.
 */
(function () {
  'use strict';

  let activeCatId = 'identifiers';
  let activeToolId = 'uuid';

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

    wireCategoryTabs();
    wireMobileCategorySelect();
    wireQuickChips();
    wireGlobalSearch();
    selectCategory(activeCatId, activeToolId);
  }

  /* ============================================================
     THEME & STATUS
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
      toast(next.toUpperCase() + ' THEME', 'Switched monochrome palette.');
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
     CATEGORY & SUBTOOL NAVIGATION
     ============================================================ */
  function wireCategoryTabs() {
    const tabs = document.querySelectorAll('#cat-tabs .cat-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const catId = tab.dataset.cat;
        selectCategory(catId);
      });
    });
  }

  function wireMobileCategorySelect() {
    const sel = document.getElementById('mobile-cat-select');
    if (!sel) return;
    sel.addEventListener('change', (e) => {
      selectCategory(e.target.value);
    });
  }

  function wireQuickChips() {
    document.querySelectorAll('#quick-chips .quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const cat = chip.dataset.gotoCat;
        const tool = chip.dataset.gotoTool;
        selectCategory(cat, tool);
        document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function wireGlobalSearch() {
    const searchIn = document.getElementById('tool-search');
    const dropdown = document.getElementById('search-dropdown');
    if (!searchIn || !dropdown) return;

    const categories = window.OVPages?.CATEGORIES || [];
    const allTools = [];
    categories.forEach(cat => {
      (cat.tools || []).forEach(t => {
        allTools.push({
          catId: cat.id,
          catName: cat.name,
          toolId: t.id,
          toolName: t.name,
          desc: t.desc,
        });
      });
    });

    const renderResults = (query) => {
      const q = query.trim().toLowerCase();
      if (!q) {
        dropdown.classList.add('hidden');
        dropdown.innerHTML = '';
        return;
      }

      const matches = allTools.filter(t =>
        t.toolName.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.catName.toLowerCase().includes(q) ||
        t.toolId.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        dropdown.innerHTML = `<div class="p-3 text-neutral-500">No matching tools found for "${escapeHtml(query)}"</div>`;
        dropdown.classList.remove('hidden');
        return;
      }

      dropdown.innerHTML = matches.map((m, idx) => `
        <div class="search-item p-2.5 hover:bg-neutral-800 cursor-pointer border-b border-neutral-800 last:border-0 flex items-center justify-between gap-2 ${idx === 0 ? 'bg-neutral-800/50' : ''}" data-cat="${m.catId}" data-tool="${m.toolId}">
          <div>
            <span class="font-bold text-white">${escapeHtml(m.toolName)}</span>
            <span class="text-[10px] text-neutral-400 block">${escapeHtml(m.desc)}</span>
          </div>
          <span class="badge-mono text-[9px]">${escapeHtml(m.catName.replace(/^[^\w]+/, ''))}</span>
        </div>
      `).join('');

      dropdown.classList.remove('hidden');

      dropdown.querySelectorAll('.search-item').forEach(item => {
        item.addEventListener('click', () => {
          selectCategory(item.dataset.cat, item.dataset.tool);
          dropdown.classList.add('hidden');
          searchIn.value = '';
          document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    };

    searchIn.addEventListener('input', (e) => renderResults(e.target.value));

    searchIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const first = dropdown.querySelector('.search-item');
        if (first) {
          selectCategory(first.dataset.cat, first.dataset.tool);
          dropdown.classList.add('hidden');
          searchIn.value = '';
          document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (e.key === 'Escape') {
        dropdown.classList.add('hidden');
      }
    });

    document.addEventListener('click', (e) => {
      if (!searchIn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  function selectCategory(catId, defaultToolId) {
    activeCatId = catId;
    const cat = (window.OVPages.CATEGORIES || []).find(c => c.id === catId);
    if (!cat) return;

    activeToolId = defaultToolId || (cat.tools[0] && cat.tools[0].id);

    // Sync desktop tabs
    document.querySelectorAll('#cat-tabs .cat-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.cat === catId);
    });

    // Sync mobile select
    const mobileSel = document.getElementById('mobile-cat-select');
    if (mobileSel && mobileSel.value !== catId) {
      mobileSel.value = catId;
    }

    // Render subtools pills
    const subContainer = document.getElementById('subtool-tabs');
    if (subContainer) {
      subContainer.innerHTML = cat.tools.map(t => `
        <button type="button" class="subtool-tab ${t.id === activeToolId ? 'active' : ''}" data-tool="${t.id}">
          ${t.name}
        </button>
      `).join('');

      subContainer.querySelectorAll('.subtool-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          subContainer.querySelectorAll('.subtool-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeToolId = btn.dataset.tool;
          renderToolWorkspace();
        });
      });
    }

    renderToolWorkspace();
  }

  /* ============================================================
     TOOL WORKSPACE DISPATCHER
     ============================================================ */
  function renderToolWorkspace() {
    const ws = document.getElementById('tool-workspace');
    if (!ws) return;

    const cat = (window.OVPages.CATEGORIES || []).find(c => c.id === activeCatId);
    const tool = cat?.tools.find(t => t.id === activeToolId);
    if (!tool) return;

    // Header info
    let headerHtml = `
      <div class="card-mono p-5 mb-5">
        <div class="flex items-center justify-between gap-4">
          <div>
            <div class="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">${cat.name}</div>
            <h2 class="text-xl font-bold text-white mt-0.5">${tool.name}</h2>
            <p class="text-xs text-neutral-400 mt-1">${tool.desc}</p>
          </div>
          <span class="badge-mono text-[10px]">${tool.id.toUpperCase()}</span>
        </div>
      </div>
    `;

    // Render tool body based on active category & tool
    let bodyHtml = '';
    if (activeCatId === 'identifiers') bodyHtml = renderIdentifiersTool(tool.id);
    else if (activeCatId === 'hashing') bodyHtml = renderHashingTool(tool.id);
    else if (activeCatId === 'encoding') bodyHtml = renderEncodingTool(tool.id);
    else if (activeCatId === 'datetime') bodyHtml = renderDateTimeTool(tool.id);
    else if (activeCatId === 'random') bodyHtml = renderRandomTool(tool.id);
    else if (activeCatId === 'text') bodyHtml = renderTextTool(tool.id);
    else if (activeCatId === 'converters') bodyHtml = renderConvertersTool(tool.id);

    ws.innerHTML = headerHtml + bodyHtml;

    // Attach listeners for the newly rendered tool
    bindActiveToolEvents(tool.id);
  }

  /* ============================================================
     1. IDENTIFIERS TEMPLATES & HANDLERS
     ============================================================ */
  function renderIdentifiersTool(toolId) {
    if (toolId === 'uuid') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Version</label>
              <select id="id-uuid-ver" class="input-mono !py-1.5 text-xs">
                <option value="v4">Version 4 (Cryptographically Random)</option>
                <option value="nil">Nil UUID (All Zeros)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Format</label>
              <select id="id-uuid-fmt" class="input-mono !py-1.5 text-xs">
                <option value="hyphens">Standard (with hyphens)</option>
                <option value="nohyphens">No Hyphens (32 chars)</option>
                <option value="uppercase">Uppercase</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Count</label>
              <select id="id-uuid-cnt" class="input-mono !py-1.5 text-xs">
                <option value="1">1 UUID</option>
                <option value="5">5 UUIDs</option>
                <option value="10">10 UUIDs</option>
                <option value="25">25 UUIDs</option>
              </select>
            </div>
          </div>
          <button type="button" id="btn-uuid-gen" class="btn-mono btn-mono-primary !w-full !py-2">Generate UUID(s)</button>
        </div>
        ${renderOutputCard('uuid-output')}
      `;
    }

    if (toolId === 'userid') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Prefix</label>
              <input type="text" id="id-usr-pfx" class="input-mono !py-1.5 text-xs" value="usr_" placeholder="usr_, cust_, org_" />
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Random Length</label>
              <input type="number" id="id-usr-len" class="input-mono !py-1.5 text-xs" value="12" min="4" max="64" />
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Charset / Format</label>
              <select id="id-usr-fmt" class="input-mono !py-1.5 text-xs">
                <option value="alphanumeric">Alphanumeric (Base62)</option>
                <option value="hex">Hexadecimal</option>
                <option value="digits">Digits Only</option>
                <option value="base32">Base32 Crockford</option>
              </select>
            </div>
          </div>
          <button type="button" id="btn-userid-gen" class="btn-mono btn-mono-primary !w-full !py-2">Generate User ID</button>
        </div>
        ${renderOutputCard('userid-output')}
      `;
    }

    if (toolId === 'randomid') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Length</label>
              <input type="number" id="id-rand-len" class="input-mono !py-1.5 text-xs" value="16" min="4" max="128" />
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Charset</label>
              <select id="id-rand-fmt" class="input-mono !py-1.5 text-xs">
                <option value="alphanumeric">Alphanumeric (A-Z, a-z, 0-9)</option>
                <option value="hex">Hex (0-9, a-f)</option>
                <option value="digits">Numeric (0-9)</option>
              </select>
            </div>
          </div>
          <button type="button" id="btn-randid-gen" class="btn-mono btn-mono-primary !w-full !py-2">Generate Random ID</button>
        </div>
        ${renderOutputCard('randid-output')}
      `;
    }

    if (toolId === 'nanoid') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Size / Length</label>
              <input type="number" id="id-nano-size" class="input-mono !py-1.5 text-xs" value="21" min="6" max="128" />
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Count</label>
              <select id="id-nano-cnt" class="input-mono !py-1.5 text-xs">
                <option value="1">1 ID</option>
                <option value="5">5 IDs</option>
                <option value="10">10 IDs</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Custom Alphabet <span class="text-neutral-500 font-normal">(optional)</span></label>
            <input type="text" id="id-nano-alpha" class="input-mono !py-1.5 text-xs font-mono" value="useandom-26T1983_40STOpfunkgjq" />
          </div>
          <button type="button" id="btn-nanoid-gen" class="btn-mono btn-mono-primary !w-full !py-2">Generate Nano ID</button>
        </div>
        ${renderOutputCard('nanoid-output')}
      `;
    }

    if (toolId === 'customid') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-neutral-300 uppercase">Pattern Template</label>
              <span class="text-[10px] text-neutral-500 font-mono"># = digit, ? = letter, @ = alphanumeric</span>
            </div>
            <input type="text" id="id-custom-tpl" class="input-mono font-mono text-xs" value="PROD-####-????-@@@@" />
          </div>
          <button type="button" id="btn-customid-gen" class="btn-mono btn-mono-primary !w-full !py-2">Generate Custom ID</button>
        </div>
        ${renderOutputCard('customid-output')}
      `;
    }

    return '';
  }

  /* ============================================================
     2. OUR OWN CUSTOM CODEC (REVERSIBLE TOKEN & LICENSE SYSTEM)
     ============================================================ */
  function renderHashingTool(toolId) {
    if (toolId === 'v1encode') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-300">1 or 2 Values Encoding</span>
            <div class="flex gap-1.5" id="v1-field-modes">
              <button type="button" class="pill-tab active" data-fields="1">1 Value (Data)</button>
              <button type="button" class="pill-tab" data-fields="2">2 Values (Data + Salt)</button>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
              <span class="font-bold text-neutral-300">VALUE 1: PAYLOAD / DATA</span>
              <span id="v1-cnt-1">0 chars</span>
            </div>
            <textarea id="v1-val-data" rows="3" class="input-mono text-xs resize-y font-mono" placeholder="Enter primary value to encode…"></textarea>
          </div>
          <div id="v1-salt-wrap" class="hidden">
            <div class="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
              <span class="font-bold text-neutral-300">VALUE 2: SALT / SECRET KEY <span class="text-neutral-500 font-normal">(optional)</span></span>
              <span id="v1-cnt-2">0 chars</span>
            </div>
            <input type="text" id="v1-val-salt" class="input-mono text-xs font-mono" placeholder="Custom salt (auto-generated if empty)" />
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="btn-v1-run" class="btn-mono btn-mono-primary !py-2 flex-1">Generate Token</button>
            <button type="button" id="btn-v1-sample" class="btn-mono !py-2 text-xs">Sample</button>
          </div>
        </div>
        ${renderOutputCard('v1-out')}
      `;
    }

    if (toolId === 'v1decode') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">Input v1$ Token</label>
            <textarea id="v1-dec-token" rows="3" class="input-mono text-xs resize-y font-mono" placeholder="Paste v1$salt$checksum$payload token here…"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Expected Salt <span class="text-neutral-500 font-normal">(optional verification)</span></label>
            <input type="text" id="v1-dec-salt" class="input-mono text-xs font-mono" placeholder="Leave empty to auto-extract salt from token" />
          </div>
          <button type="button" id="btn-v1-dec-run" class="btn-mono btn-mono-primary !w-full !py-2">Decode Token</button>
          <div id="v1-dec-meta" class="hidden p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono"></div>
        </div>
        ${renderOutputCard('v1-dec-out')}
      `;
    }

    if (toolId === 'v2license') {
      return `
        <div class="card-mono p-5 mb-5 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label class="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Entity / User ID</label><input type="text" id="v2-ent" class="input-mono text-xs font-mono" value="usr_enterprise_9821" /></div>
            <div><label class="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Product ID</label><input type="text" id="v2-prod" class="input-mono text-xs font-mono" value="offline-suite" /></div>
            <div><label class="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Version</label><input type="number" id="v2-ver" class="input-mono text-xs font-mono" value="2" /></div>
            <div><label class="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Serial Key</label><input type="text" id="v2-ser" class="input-mono text-xs font-mono" value="LIC-2026-ABCD-99" /></div>
            <div><label class="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Plan</label><input type="text" id="v2-plan" class="input-mono text-xs font-mono" value="enterprise" /></div>
            <div><label class="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Feature Flags (comma separated)</label><input type="text" id="v2-flags" class="input-mono text-xs font-mono" value="api,export,audit" /></div>
          </div>
          <div class="flex items-center gap-2 pt-2 border-t border-neutral-800">
            <button type="button" id="btn-v2-run" class="btn-mono btn-mono-primary !py-2 flex-1">Generate v2 Token</button>
            <button type="button" id="btn-v2-dl" class="btn-mono !py-2 text-xs">Download .ovlicense</button>
          </div>
        </div>
        ${renderOutputCard('v2-out')}
      `;
    }

    if (toolId === 'v2decode') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div id="v2-drop-zone" class="drag-zone-mono">
            <p class="text-sm font-bold text-white mb-1">Drop a .ovlicense, .ovstruct, or .ovhash file here</p>
            <p class="text-xs text-neutral-400">or click to upload from local machine</p>
            <input type="file" id="v2-file-in" class="hidden" accept=".ovlicense,.ovstruct,.ovhash,.json,.txt" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">Or Paste Token / JSON License</label>
            <textarea id="v2-dec-in" rows="3" class="input-mono text-xs resize-y font-mono" placeholder="Paste ov2s$… token or JSON file content…"></textarea>
          </div>
          <button type="button" id="btn-v2-dec-run" class="btn-mono btn-mono-primary !w-full !py-2">Decode &amp; Inspect</button>
          <div id="v2-dec-result" class="hidden p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono"></div>
        </div>
      `;
    }

    if (toolId === 'verifier') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-300">Input Token to Verify</label>
          <textarea id="vf-token" rows="3" class="input-mono text-xs resize-y font-mono" placeholder="Paste v1$… or ov2s$… token to check for tampering…"></textarea>
          <button type="button" id="btn-vf-run" class="btn-mono btn-mono-primary !w-full !py-2">Verify Token Integrity</button>
          <div id="vf-result" class="hidden p-4 rounded-lg text-xs font-mono"></div>
        </div>
      `;
    }

    return '';
  }

  /* ============================================================
     3. ENCODING TEMPLATES & HANDLERS
     ============================================================ */
  function renderEncodingTool(toolId) {
    return `
      <div class="card-mono p-4 sm:p-5 mb-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-1.5" id="enc-mode-pills">
            <button type="button" class="pill-tab active" data-mode="encode">Encode</button>
            <button type="button" class="pill-tab" data-mode="decode">Decode</button>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" id="btn-enc-swap" class="btn-mono !py-1 !px-2.5 text-xs" title="Swap input and output">⇄ Swap</button>
            <button type="button" id="btn-enc-sample" class="btn-mono !py-1 !px-2.5 text-xs">⚡ Sample</button>
            <button type="button" id="btn-enc-clear" class="btn-mono !py-1 !px-2.5 text-xs text-neutral-400 hover:text-white">✕ Clear</button>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
            <span id="enc-input-lbl" class="font-bold text-neutral-300 uppercase">Input Text to Encode</span>
            <span id="enc-char-cnt">0 chars (0 bytes)</span>
          </div>
          <textarea id="enc-input" rows="4" class="input-mono text-xs resize-y" placeholder="Type or paste text to convert in real-time…"></textarea>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
            <span id="enc-output-lbl" class="font-bold text-neutral-300 uppercase">Output Result</span>
            <button type="button" id="btn-enc-copy" class="btn-mono !py-1 !px-3 text-xs font-bold">Copy Output</button>
          </div>
          <textarea id="enc-output" rows="4" readonly class="hash-output-box text-xs resize-y w-full" placeholder="Output result will appear here…"></textarea>
        </div>
      </div>
    `;
  }

  /* ============================================================
     4. DATE & TIME TEMPLATES
     ============================================================ */
  function renderDateTimeTool(toolId) {
    if (toolId === 'dateconverter') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="flex items-center justify-between gap-2">
            <label class="text-xs font-bold text-neutral-300 uppercase">Date Input (ISO / String / Local)</label>
            <button type="button" id="btn-date-now" class="btn-mono !py-1 !px-2 text-xs">Set Now</button>
          </div>
          <input type="text" id="dt-conv-in" class="input-mono text-xs" placeholder="e.g. 2026-09-03T12:00:00Z" />
          <div id="dt-conv-out" class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono"></div>
        </div>
      `;
    }

    if (toolId === 'timestampconverter') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="flex items-center justify-between gap-2">
            <label class="text-xs font-bold text-neutral-300 uppercase">Unix Timestamp (Seconds or Milliseconds)</label>
            <button type="button" id="btn-ts-now" class="btn-mono !py-1 !px-2 text-xs">Current Timestamp</button>
          </div>
          <input type="number" id="dt-ts-in" class="input-mono text-xs" placeholder="e.g. 1788432000" />
          <div id="dt-ts-out" class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono"></div>
        </div>
      `;
    }

    if (toolId === 'timezoneconverter') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="flex items-center justify-between gap-2">
            <label class="text-xs font-bold text-neutral-300 uppercase">Base Date / Time</label>
            <button type="button" id="btn-tz-now" class="btn-mono !py-1 !px-2 text-xs">Set Current Time</button>
          </div>
          <input type="datetime-local" id="dt-tz-in" class="input-mono text-xs" />
          <div class="overflow-x-auto">
            <table class="w-full text-xs font-mono border border-neutral-800 rounded-lg">
              <thead class="bg-neutral-900 border-b border-neutral-800 text-neutral-400 text-[10px] uppercase">
                <tr><th class="p-2.5 text-left">Location / Timezone</th><th class="p-2.5 text-right">Converted Time</th></tr>
              </thead>
              <tbody id="dt-tz-table" class="divide-y divide-neutral-800 text-neutral-200"></tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (toolId === 'dateformatter') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Date</label>
              <input type="date" id="dt-fmt-date" class="input-mono text-xs" />
            </div>
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Pattern</label>
              <select id="dt-fmt-pattern" class="input-mono text-xs">
                <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-neutral-300 uppercase mb-1.5">Formatted Result</label>
            <div id="dt-fmt-result" class="hash-output-box text-sm"></div>
          </div>
        </div>
      `;
    }
    return '';
  }

  /* ============================================================
     5. RANDOM TEMPLATES
     ============================================================ */
  function renderRandomTool(toolId) {
    if (toolId === 'number') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><label class="block text-xs font-bold text-neutral-300 uppercase mb-1">Min</label><input type="number" id="rnd-num-min" class="input-mono text-xs" value="1" /></div>
            <div><label class="block text-xs font-bold text-neutral-300 uppercase mb-1">Max</label><input type="number" id="rnd-num-max" class="input-mono text-xs" value="100" /></div>
            <div><label class="block text-xs font-bold text-neutral-300 uppercase mb-1">Count</label><input type="number" id="rnd-num-cnt" class="input-mono text-xs" value="5" min="1" max="100" /></div>
            <div>
              <label class="block text-xs font-bold text-neutral-300 uppercase mb-1">Type</label>
              <select id="rnd-num-type" class="input-mono text-xs"><option value="int">Integer</option><option value="float">Float</option></select>
            </div>
          </div>
          <button type="button" id="btn-rndnum-gen" class="btn-mono btn-mono-primary !w-full !py-2">Generate Random Numbers</button>
        </div>
        ${renderOutputCard('rndnum-output')}
      `;
    }

    if (toolId === 'string') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="flex items-center justify-between gap-4">
            <div><label class="text-xs font-bold text-neutral-300 uppercase">Length</label><input type="number" id="rnd-str-len" class="input-mono text-xs !w-24 mt-1" value="16" min="4" max="256" /></div>
            <div class="flex flex-wrap items-center gap-3 text-xs text-neutral-300">
              <label class="inline-flex items-center gap-1.5"><input type="checkbox" id="rnd-str-up" checked class="checkbox-mono" /> A-Z</label>
              <label class="inline-flex items-center gap-1.5"><input type="checkbox" id="rnd-str-low" checked class="checkbox-mono" /> a-z</label>
              <label class="inline-flex items-center gap-1.5"><input type="checkbox" id="rnd-str-num" checked class="checkbox-mono" /> 0-9</label>
              <label class="inline-flex items-center gap-1.5"><input type="checkbox" id="rnd-str-sym" class="checkbox-mono" /> !@#$</label>
            </div>
          </div>
          <button type="button" id="btn-rndstr-gen" class="btn-mono btn-mono-primary !w-full !py-2">Generate Random String</button>
        </div>
        ${renderOutputCard('rndstr-output')}
      `;
    }

    if (toolId === 'color') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div id="rnd-color-swatch" class="color-swatch flex items-center justify-center font-bold text-sm"></div>
          <div class="grid grid-cols-3 gap-2 font-mono text-xs">
            <div class="p-2.5 bg-neutral-900 border border-neutral-800 rounded"><span class="text-neutral-500 text-[10px] block">HEX</span><span id="rnd-col-hex" class="text-white font-bold"></span></div>
            <div class="p-2.5 bg-neutral-900 border border-neutral-800 rounded"><span class="text-neutral-500 text-[10px] block">RGB</span><span id="rnd-col-rgb" class="text-white font-bold"></span></div>
            <div class="p-2.5 bg-neutral-900 border border-neutral-800 rounded"><span class="text-neutral-500 text-[10px] block">HSL</span><span id="rnd-col-hsl" class="text-white font-bold"></span></div>
          </div>
          <button type="button" id="btn-rndcol-gen" class="btn-mono btn-mono-primary !w-full !py-2">Generate Random Color</button>
        </div>
      `;
    }

    if (toolId === 'uuid' || toolId === 'customid') {
      return renderIdentifiersTool(toolId);
    }
    return '';
  }

  /* ============================================================
     6. TEXT TEMPLATES
     ============================================================ */
  function renderTextTool(toolId) {
    if (toolId === 'caseconverter') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div><label class="block text-xs font-bold text-neutral-300 uppercase mb-1">Input Text</label><textarea id="txt-case-in" rows="3" class="input-mono text-xs resize-y" placeholder="Type text to convert case…"></textarea></div>
          <div class="flex flex-wrap gap-1.5" id="case-btn-row">
            <button type="button" data-case="camel" class="btn-mono text-xs">camelCase</button>
            <button type="button" data-case="snake" class="btn-mono text-xs">snake_case</button>
            <button type="button" data-case="kebab" class="btn-mono text-xs">kebab-case</button>
            <button type="button" data-case="upper" class="btn-mono text-xs">UPPERCASE</button>
            <button type="button" data-case="lower" class="btn-mono text-xs">lowercase</button>
            <button type="button" data-case="title" class="btn-mono text-xs">Title Case</button>
            <button type="button" data-case="pascal" class="btn-mono text-xs">PascalCase</button>
            <button type="button" data-case="constant" class="btn-mono text-xs">CONSTANT_CASE</button>
          </div>
        </div>
        ${renderOutputCard('txt-case-out')}
      `;
    }

    if (toolId === 'sluggenerator') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div><label class="block text-xs font-bold text-neutral-300 uppercase mb-1">Title / String</label><input type="text" id="txt-slug-in" class="input-mono text-xs" placeholder="e.g. Offline Validator & Suite 2026!" /></div>
          <div class="flex items-center gap-3 text-xs text-neutral-400">
            <span>Delimiter:</span>
            <label class="inline-flex items-center gap-1"><input type="radio" name="slug-delim" value="-" checked /> Hyphen (-)</label>
            <label class="inline-flex items-center gap-1"><input type="radio" name="slug-delim" value="_" /> Underscore (_)</label>
          </div>
        </div>
        ${renderOutputCard('txt-slug-out')}
      `;
    }

    if (toolId === 'textcounter') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <label class="block text-xs font-bold text-neutral-300 uppercase">Input Text</label>
          <textarea id="txt-cnt-in" rows="6" class="input-mono text-xs resize-y" placeholder="Type or paste text to analyze…"></textarea>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="txt-cnt-stats">
            <div class="stat-box"><div class="stat-val" id="st-chars">0</div><div class="stat-lbl">Characters</div></div>
            <div class="stat-box"><div class="stat-val" id="st-words">0</div><div class="stat-lbl">Words</div></div>
            <div class="stat-box"><div class="stat-val" id="st-lines">0</div><div class="stat-lbl">Lines</div></div>
            <div class="stat-box"><div class="stat-val" id="st-bytes">0</div><div class="stat-lbl">Bytes</div></div>
          </div>
        </div>
      `;
    }

    if (toolId === 'reversetext') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div><label class="block text-xs font-bold text-neutral-300 uppercase mb-1">Input Text</label><textarea id="txt-rev-in" rows="3" class="input-mono text-xs resize-y" placeholder="Enter text to reverse…"></textarea></div>
          <div class="flex items-center gap-2" id="rev-mode-row">
            <button type="button" data-mode="chars" class="pill-tab active">Reverse Characters</button>
            <button type="button" data-mode="words" class="pill-tab">Reverse Words</button>
            <button type="button" data-mode="lines" class="pill-tab">Reverse Lines</button>
          </div>
        </div>
        ${renderOutputCard('txt-rev-out')}
      `;
    }

    if (toolId === 'removeduplicates') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div><label class="block text-xs font-bold text-neutral-300 uppercase mb-1">Multiline Text</label><textarea id="txt-dedupe-in" rows="5" class="input-mono text-xs resize-y font-mono" placeholder="Paste lines with duplicates…"></textarea></div>
          <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-3">
              <label class="inline-flex items-center gap-1.5"><input type="checkbox" id="dedupe-case" checked class="checkbox-mono" /> Case Sensitive</label>
              <label class="inline-flex items-center gap-1.5"><input type="checkbox" id="dedupe-trim" checked class="checkbox-mono" /> Trim Whitespace</label>
            </div>
            <select id="dedupe-sort" class="input-mono !py-1 !px-2 text-xs !w-auto">
              <option value="none">Preserve Order</option>
              <option value="asc">Sort A → Z</option>
              <option value="desc">Sort Z → A</option>
            </select>
          </div>
        </div>
        ${renderOutputCard('txt-dedupe-out')}
      `;
    }
    return '';
  }

  /* ============================================================
     7. CONVERTERS TEMPLATES
     ============================================================ */
  function renderConvertersTool(toolId) {
    if (toolId === 'numberbase') {
      return `
        <div class="card-mono p-4 sm:p-5 mb-5 space-y-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-neutral-300 uppercase">Reactive 4-Way Base Converter</span>
            <div class="flex items-center gap-1.5">
              <button type="button" id="btn-nb-sample" class="btn-mono !py-1 !px-2.5 text-xs">⚡ Sample (1337)</button>
              <button type="button" id="btn-nb-clear" class="btn-mono !py-1 !px-2.5 text-xs text-neutral-400 hover:text-white">✕ Clear</button>
            </div>
          </div>
          <div><label class="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Decimal (Base 10)</label><input type="text" id="nb-dec" class="input-mono text-xs font-mono" placeholder="e.g. 1337" /></div>
          <div><label class="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Binary (Base 2)</label><input type="text" id="nb-bin" class="input-mono text-xs font-mono" placeholder="e.g. 10100111001" /></div>
          <div><label class="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Hexadecimal (Base 16)</label><input type="text" id="nb-hex" class="input-mono text-xs font-mono" placeholder="e.g. 539" /></div>
          <div><label class="block text-[11px] font-bold text-neutral-400 uppercase mb-1">Octal (Base 8)</label><input type="text" id="nb-oct" class="input-mono text-xs font-mono" placeholder="e.g. 2471" /></div>
        </div>
      `;
    }

    if (toolId === 'jsonformatter') {
      return `
        <div class="card-mono p-4 sm:p-5 mb-5 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <label class="text-xs font-bold text-neutral-300 uppercase">Input JSON</label>
            <div class="flex flex-wrap items-center gap-1.5">
              <button type="button" id="btn-json-2" class="btn-mono !py-1 !px-2 text-xs">2 Spaces</button>
              <button type="button" id="btn-json-4" class="btn-mono !py-1 !px-2 text-xs">4 Spaces</button>
              <button type="button" id="btn-json-min" class="btn-mono !py-1 !px-2 text-xs">Minify</button>
              <button type="button" id="btn-json-sample" class="btn-mono !py-1 !px-2 text-xs">⚡ Sample</button>
              <button type="button" id="btn-json-clear" class="btn-mono !py-1 !px-2 text-xs text-neutral-400 hover:text-white">✕ Clear</button>
            </div>
          </div>
          <textarea id="json-fmt-in" rows="6" class="input-mono text-xs font-mono resize-y" placeholder='{"key": "value", "list": [1, 2, 3]}'></textarea>
          <div id="json-status" class="text-xs font-mono hidden"></div>
        </div>
        ${renderOutputCard('json-fmt-out')}
      `;
    }

    if (toolId === 'jsonyaml') {
      return `
        <div class="card-mono p-4 sm:p-5 mb-5 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-1.5" id="jy-mode-pills">
              <button type="button" class="pill-tab active" data-mode="toYaml">JSON → YAML</button>
              <button type="button" class="pill-tab" data-mode="toJson">YAML → JSON</button>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" id="btn-jy-sample" class="btn-mono !py-1 !px-2.5 text-xs">⚡ Sample</button>
              <button type="button" id="btn-jy-clear" class="btn-mono !py-1 !px-2.5 text-xs text-neutral-400 hover:text-white">✕ Clear</button>
            </div>
          </div>
          <div>
            <label id="jy-in-lbl" class="block text-xs font-bold text-neutral-400 uppercase mb-1">Input JSON</label>
            <textarea id="jy-in" rows="6" class="input-mono text-xs font-mono resize-y" placeholder="Paste JSON here…"></textarea>
          </div>
        </div>
        ${renderOutputCard('jy-out')}
      `;
    }

    if (toolId === 'csvjson') {
      return `
        <div class="card-mono p-4 sm:p-5 mb-5 space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-1.5" id="cj-mode-pills">
              <button type="button" class="pill-tab active" data-mode="toJson">CSV → JSON</button>
              <button type="button" class="pill-tab" data-mode="toCsv">JSON → CSV</button>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <span class="text-neutral-400">Delimiter:</span>
              <select id="cj-delimiter" class="input-mono !py-1 !px-2 text-xs !w-auto">
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="&#9;">Tab (\t)</option>
              </select>
              <button type="button" id="btn-cj-sample" class="btn-mono !py-1 !px-2.5 text-xs">⚡ Sample</button>
              <button type="button" id="btn-cj-clear" class="btn-mono !py-1 !px-2.5 text-xs text-neutral-400 hover:text-white">✕ Clear</button>
            </div>
          </div>
          <div>
            <label id="cj-in-lbl" class="block text-xs font-bold text-neutral-400 uppercase mb-1">Input CSV</label>
            <textarea id="cj-in" rows="6" class="input-mono text-xs font-mono resize-y" placeholder="id,name,role&#10;1,Alice,admin&#10;2,Bob,dev"></textarea>
          </div>
        </div>
        ${renderOutputCard('cj-out')}
      `;
    }
    return '';
  }

  function renderOutputCard(outputId, hasCompare = false) {
    return `
      <div class="card-mono p-4 sm:p-5 mb-5 border-neutral-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-white">Generated Output</span>
          <button type="button" data-copy-target="${outputId}" class="btn-copy-out btn-mono btn-mono-primary !py-1 !px-3 text-xs font-bold">
            <span>Copy Output</span>
          </button>
        </div>
        <textarea id="${outputId}" rows="3" readonly class="hash-output-box text-xs resize-y w-full" placeholder="Output will appear here…"></textarea>
        ${hasCompare ? `
          <div class="mt-3 pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input type="text" id="hash-compare-input" class="input-mono !py-1.5 text-xs flex-1" placeholder="Paste expected token to compare…" />
            <span id="hash-compare-badge" class="badge-mono text-[10px] hidden self-start sm:self-center"></span>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ============================================================
     EVENT BINDINGS FOR ACTIVE TOOLS
     ============================================================ */
  function bindActiveToolEvents(toolId) {
    const T = window.OVTools;
    if (!T) return;

    // Global copy button handler with visual feedback animation
    document.querySelectorAll('.btn-copy-out').forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetId = btn.dataset.copyTarget;
        const target = document.getElementById(targetId);
        if (!target || !target.value) return;
        try {
          await navigator.clipboard.writeText(target.value);
          const origHtml = btn.innerHTML;
          btn.classList.add('btn-copied');
          btn.innerHTML = '<span>✓ COPIED!</span>';
          setTimeout(() => {
            btn.classList.remove('btn-copied');
            btn.innerHTML = origHtml;
          }, 1500);
          toast('COPIED', target.value.slice(0, 32) + (target.value.length > 32 ? '…' : ''));
        } catch (_) {}
      });
    });

    // 1. Identifiers
    if (toolId === 'uuid') {
      const run = () => {
        const ver = document.getElementById('id-uuid-ver')?.value;
        const fmt = document.getElementById('id-uuid-fmt')?.value;
        const cnt = +document.getElementById('id-uuid-cnt')?.value || 1;
        const res = T.identifiers.uuid(ver, fmt === 'uppercase', fmt !== 'nohyphens', cnt);
        const out = document.getElementById('uuid-output');
        if (out) out.value = Array.isArray(res) ? res.join('\n') : res;
      };
      document.getElementById('btn-uuid-gen')?.addEventListener('click', run);
      run();
    }

    if (toolId === 'userid') {
      const run = () => {
        const pfx = document.getElementById('id-usr-pfx')?.value || '';
        const len = +document.getElementById('id-usr-len')?.value || 12;
        const fmt = document.getElementById('id-usr-fmt')?.value;
        const res = T.identifiers.userId(pfx, len, fmt);
        const out = document.getElementById('userid-output');
        if (out) out.value = res;
      };
      document.getElementById('btn-userid-gen')?.addEventListener('click', run);
      run();
    }

    if (toolId === 'randomid') {
      const run = () => {
        const len = +document.getElementById('id-rand-len')?.value || 16;
        const fmt = document.getElementById('id-rand-fmt')?.value;
        const res = T.identifiers.randomId(len, fmt);
        const out = document.getElementById('randid-output');
        if (out) out.value = res;
      };
      document.getElementById('btn-randid-gen')?.addEventListener('click', run);
      run();
    }

    if (toolId === 'nanoid') {
      const run = () => {
        const size = +document.getElementById('id-nano-size')?.value || 21;
        const alpha = document.getElementById('id-nano-alpha')?.value;
        const cnt = +document.getElementById('id-nano-cnt')?.value || 1;
        const res = T.identifiers.nanoId(size, alpha, cnt);
        const out = document.getElementById('nanoid-output');
        if (out) out.value = Array.isArray(res) ? res.join('\n') : res;
      };
      document.getElementById('btn-nanoid-gen')?.addEventListener('click', run);
      run();
    }

    if (toolId === 'customid') {
      const run = () => {
        const tpl = document.getElementById('id-custom-tpl')?.value || 'ID-####-????';
        const res = T.identifiers.customId(tpl);
        const out = document.getElementById('customid-output');
        if (out) out.value = res;
      };
      document.getElementById('btn-customid-gen')?.addEventListener('click', run);
      run();
    }

    // 2. OUR CUSTOM CODEC
    if (toolId === 'v1encode') {
      let fieldCount = 1;
      const dataIn = document.getElementById('v1-val-data');
      const saltIn = document.getElementById('v1-val-salt');
      const saltWrap = document.getElementById('v1-salt-wrap');
      const out = document.getElementById('v1-out');

      const run = () => {
        const val1 = dataIn?.value || '';
        const val2 = fieldCount === 2 ? (saltIn?.value || '') : '';
        if (!val1) { if (out) out.value = ''; return; }
        const res = T.hashing.v1Encode(val1, val2);
        if (out) out.value = res.token;
      };

      document.querySelectorAll('#v1-field-modes .pill-tab').forEach(p => {
        p.addEventListener('click', () => {
          document.querySelectorAll('#v1-field-modes .pill-tab').forEach(b => b.classList.remove('active'));
          p.classList.add('active');
          fieldCount = +p.dataset.fields;
          saltWrap?.classList.toggle('hidden', fieldCount < 2);
          run();
        });
      });

      dataIn?.addEventListener('input', run);
      saltIn?.addEventListener('input', run);
      document.getElementById('btn-v1-run')?.addEventListener('click', run);
      document.getElementById('btn-v1-sample')?.addEventListener('click', () => {
        if (dataIn) dataIn.value = 'Offline Confidential Payload 2026';
        if (saltIn) saltIn.value = 'user_secret_key_88';
        run();
      });
      run();
    }

    if (toolId === 'v1decode') {
      const tokIn = document.getElementById('v1-dec-token');
      const saltIn = document.getElementById('v1-dec-salt');
      const out = document.getElementById('v1-dec-out');
      const meta = document.getElementById('v1-dec-meta');

      const run = () => {
        const tok = tokIn?.value || '';
        if (!tok) {
          if (out) out.value = '';
          meta?.classList.add('hidden');
          return;
        }
        try {
          const res = T.hashing.v1Decode(tok, saltIn?.value);
          if (out) out.value = res.data;
          if (meta) {
            meta.classList.remove('hidden');
            meta.innerHTML = `
              <div class="text-white font-bold mb-1">INTEGRITY VERIFIED ✓</div>
              <div class="text-neutral-400">Extracted Salt: <span class="text-white">${res.salt}</span></div>
              <div class="text-neutral-400">FNV-1a Checksum: <span class="text-white">${res.checksum}</span></div>
            `;
          }
        } catch (err) {
          if (out) out.value = 'Error: ' + err.message;
          if (meta) meta.classList.add('hidden');
        }
      };

      document.getElementById('btn-v1-dec-run')?.addEventListener('click', run);
      tokIn?.addEventListener('input', run);
      saltIn?.addEventListener('input', run);
    }

    if (toolId === 'v2license') {
      const entIn = document.getElementById('v2-ent');
      const prodIn = document.getElementById('v2-prod');
      const verIn = document.getElementById('v2-ver');
      const serIn = document.getElementById('v2-ser');
      const planIn = document.getElementById('v2-plan');
      const flagsIn = document.getElementById('v2-flags');
      const out = document.getElementById('v2-out');

      const getPayload = () => ({
        entity: entIn?.value || 'user',
        product: prodIn?.value || 'app',
        version: +verIn?.value || 1,
        serial: serIn?.value || 'LIC-000',
        plan: planIn?.value || 'pro',
        flags: (flagsIn?.value || '').split(',').map(f => f.trim()).filter(Boolean),
        issued: Math.floor(Date.now() / 1000),
      });

      const run = () => {
        const payload = getPayload();
        const res = T.hashing.v2Encode(payload);
        if (out) out.value = res.token;
      };

      document.getElementById('btn-v2-run')?.addEventListener('click', run);
      document.getElementById('btn-v2-dl')?.addEventListener('click', () => {
        const payload = getPayload();
        const res = T.hashing.v2Encode(payload);
        const blob = new Blob([JSON.stringify(res.licensePackage, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${payload.entity || 'license'}.ovlicense`;
        a.click();
        URL.revokeObjectURL(url);
        toast('DOWNLOADED', 'Saved .ovlicense package.');
      });

      [entIn, prodIn, verIn, serIn, planIn, flagsIn].forEach(el => el?.addEventListener('input', run));
      run();
    }

    if (toolId === 'v2decode') {
      const dropZone = document.getElementById('v2-drop-zone');
      const fileIn = document.getElementById('v2-file-in');
      const decIn = document.getElementById('v2-dec-in');
      const resultBox = document.getElementById('v2-dec-result');

      const displayResult = (res) => {
        if (!resultBox) return;
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `
          <div class="text-white font-bold mb-2">STRUCTURED LICENSE CLAIMS (VERIFIED ✓)</div>
          <div class="space-y-1 text-neutral-300">
            <div><span class="text-neutral-500">Entity:</span> ${escapeHtml(res.entity || res.product)}</div>
            <div><span class="text-neutral-500">Product:</span> ${escapeHtml(res.product || '-')}</div>
            <div><span class="text-neutral-500">Plan:</span> ${escapeHtml(res.plan || '-')}</div>
            <div><span class="text-neutral-500">Serial:</span> ${escapeHtml(res.serial || '-')}</div>
            <div><span class="text-neutral-500">Version:</span> ${res.version || '-'}</div>
            <div><span class="text-neutral-500">Flags:</span> ${Array.isArray(res.flags) ? res.flags.join(', ') : '-'}</div>
          </div>
        `;
      };

      const parseText = (txt) => {
        const clean = txt.trim();
        if (!clean) return;
        try {
          if (clean.startsWith('{')) {
            const parsed = JSON.parse(clean);
            if (parsed.token) {
              const r = T.hashing.v2Decode(parsed.token);
              displayResult(r.payload);
            } else {
              displayResult(parsed);
            }
          } else if (clean.startsWith('ov2s$')) {
            const r = T.hashing.v2Decode(clean);
            displayResult(r.payload);
          } else if (clean.startsWith('v1$')) {
            const r = T.hashing.v1Decode(clean);
            if (resultBox) {
              resultBox.classList.remove('hidden');
              resultBox.innerHTML = `<div class="text-white font-bold mb-1">DECODED V1 PAYLOAD</div><div>${escapeHtml(r.data)}</div>`;
            }
          }
        } catch (err) {
          if (resultBox) {
            resultBox.classList.remove('hidden');
            resultBox.innerHTML = `<div class="text-neutral-400">Error: ${escapeHtml(err.message)}</div>`;
          }
        }
      };

      dropZone?.addEventListener('click', () => fileIn?.click());
      fileIn?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const txt = await file.text();
          if (decIn) decIn.value = txt;
          parseText(txt);
        }
      });
      dropZone?.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
      dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
      dropZone?.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer?.files?.[0];
        if (file) {
          const txt = await file.text();
          if (decIn) decIn.value = txt;
          parseText(txt);
        }
      });
      document.getElementById('btn-v2-dec-run')?.addEventListener('click', () => parseText(decIn?.value || ''));
    }

    if (toolId === 'verifier') {
      const tokIn = document.getElementById('vf-token');
      const resBox = document.getElementById('vf-result');

      const run = () => {
        const tok = tokIn?.value?.trim() || '';
        if (!tok) { resBox?.classList.add('hidden'); return; }
        const isValid = T.hashing.verifyToken(tok);
        if (resBox) {
          resBox.classList.remove('hidden');
          if (isValid) {
            resBox.className = 'p-4 rounded-lg text-xs font-mono bg-neutral-900 border border-white text-white font-bold';
            resBox.textContent = 'TOKEN VERIFIED ✓: Checksum matched. Token payload is authentic and untampered.';
          } else {
            resBox.className = 'p-4 rounded-lg text-xs font-mono bg-neutral-900 border border-neutral-700 text-neutral-400 font-bold';
            resBox.textContent = 'VERIFICATION FAILED ✗: Checksum mismatch or invalid format. Token has been altered or corrupted.';
          }
        }
      };

      document.getElementById('btn-vf-run')?.addEventListener('click', run);
      tokIn?.addEventListener('input', run);
    }

    // 3. Encoding
    if (['base64', 'url', 'hex', 'binary', 'html', 'customtoken'].includes(toolId)) {
      let mode = 'encode';
      const inputEl = document.getElementById('enc-input');
      const outputEl = document.getElementById('enc-output');
      const swapBtn = document.getElementById('btn-enc-swap');

      const updateStats = (str) => {
        const cntEl = document.getElementById('enc-char-cnt');
        if (cntEl) {
          const bytes = new TextEncoder().encode(str).length;
          cntEl.textContent = `${str.length} chars (${bytes} bytes)`;
        }
      };

      const execute = () => {
        const str = inputEl?.value || '';
        updateStats(str);
        if (!str) { if (outputEl) outputEl.value = ''; return; }

        try {
          let res = '';
          const codec = T.encoding[toolId];
          if (mode === 'encode') {
            res = codec.encode(str);
          } else {
            res = codec.decode(str);
          }
          if (outputEl) outputEl.value = res;
        } catch (err) {
          if (outputEl) outputEl.value = 'Error: ' + err.message;
        }
      };

      document.querySelectorAll('#enc-mode-pills .pill-tab').forEach(p => {
        p.addEventListener('click', () => {
          document.querySelectorAll('#enc-mode-pills .pill-tab').forEach(b => b.classList.remove('active'));
          p.classList.add('active');
          mode = p.dataset.mode;
          const inLbl = document.getElementById('enc-input-lbl');
          if (inLbl) inLbl.textContent = mode === 'encode' ? 'Input Text to Encode' : 'Input Text to Decode';
          execute();
        });
      });

      inputEl?.addEventListener('input', execute);

      swapBtn?.addEventListener('click', () => {
        const currOut = outputEl?.value || '';
        if (currOut && !currOut.startsWith('Error:')) {
          if (inputEl) inputEl.value = currOut;
          mode = mode === 'encode' ? 'decode' : 'encode';
          document.querySelectorAll('#enc-mode-pills .pill-tab').forEach(p => {
            p.classList.toggle('active', p.dataset.mode === mode);
          });
          const inLbl = document.getElementById('enc-input-lbl');
          if (inLbl) inLbl.textContent = mode === 'encode' ? 'Input Text to Encode' : 'Input Text to Decode';
          execute();
        }
      });

      document.getElementById('btn-enc-sample')?.addEventListener('click', () => {
        const samples = {
          base64: 'Offline Suite 2026 — Zero Cloud Telemetry! 🚀',
          url: 'https://example.com/api?user=Alice & Bob&lang=en&safe=true',
          hex: 'Hello Offline World!',
          binary: 'Hi 2026',
          html: '<div class="banner">Hello & "Welcome" to Offline Suite!</div>',
        };
        if (inputEl) {
          inputEl.value = samples[toolId] || 'Sample text 123';
          execute();
        }
      });

      document.getElementById('btn-enc-clear')?.addEventListener('click', () => {
        if (inputEl) inputEl.value = '';
        if (outputEl) outputEl.value = '';
        updateStats('');
      });

      document.getElementById('btn-enc-copy')?.addEventListener('click', async (e) => {
        if (outputEl?.value) {
          await navigator.clipboard.writeText(outputEl.value);
          const btn = e.currentTarget;
          const origHtml = btn.innerHTML;
          btn.classList.add('btn-copied');
          btn.innerHTML = '<span>✓ COPIED!</span>';
          setTimeout(() => {
            btn.classList.remove('btn-copied');
            btn.innerHTML = origHtml;
          }, 1500);
          toast('COPIED', outputEl.value.slice(0, 32) + (outputEl.value.length > 32 ? '…' : ''));
        }
      });
    }

    // 4. Date & Time
    if (toolId === 'dateconverter') {
      const inp = document.getElementById('dt-conv-in');
      const out = document.getElementById('dt-conv-out');
      const run = () => {
        try {
          const r = T.datetime.convertDate(inp?.value);
          if (out) {
            out.innerHTML = `
              <div class="p-2.5 bg-neutral-900 border border-neutral-800 rounded"><span class="text-neutral-500 text-[10px] block">ISO 8601</span>${r.iso}</div>
              <div class="p-2.5 bg-neutral-900 border border-neutral-800 rounded"><span class="text-neutral-500 text-[10px] block">UTC STRING</span>${r.utc}</div>
              <div class="p-2.5 bg-neutral-900 border border-neutral-800 rounded"><span class="text-neutral-500 text-[10px] block">UNIX SECONDS</span>${r.unixSec}</div>
              <div class="p-2.5 bg-neutral-900 border border-neutral-800 rounded"><span class="text-neutral-500 text-[10px] block">UNIX MILLISECONDS</span>${r.unixMs}</div>
            `;
          }
        } catch (_) {}
      };
      inp?.addEventListener('input', run);
      document.getElementById('btn-date-now')?.addEventListener('click', () => {
        if (inp) inp.value = new Date().toISOString();
        run();
      });
      run();
    }

    if (toolId === 'timestampconverter') {
      const inp = document.getElementById('dt-ts-in');
      const out = document.getElementById('dt-ts-out');
      const run = () => {
        try {
          const r = T.datetime.convertTimestamp(inp?.value);
          if (out) {
            out.innerHTML = `
              <div class="p-2.5 bg-neutral-900 border border-neutral-800 rounded"><span class="text-neutral-500 text-[10px] block">UTC TIME</span>${r.utc}</div>
              <div class="p-2.5 bg-neutral-900 border border-neutral-800 rounded"><span class="text-neutral-500 text-[10px] block">LOCAL TIME</span>${r.local}</div>
            `;
          }
        } catch (_) {}
      };
      inp?.addEventListener('input', run);
      document.getElementById('btn-ts-now')?.addEventListener('click', () => {
        if (inp) inp.value = Math.floor(Date.now() / 1000);
        run();
      });
      run();
    }

    if (toolId === 'timezoneconverter') {
      const inp = document.getElementById('dt-tz-in');
      const tbody = document.getElementById('dt-tz-table');
      const run = () => {
        try {
          const d = inp?.value ? new Date(inp.value) : new Date();
          const list = T.datetime.convertTimezones(d);
          if (tbody) {
            tbody.innerHTML = list.map(z => `
              <tr><td class="p-2.5 font-bold">${z.label}</td><td class="p-2.5 text-right">${z.time}</td></tr>
            `).join('');
          }
        } catch (_) {}
      };
      inp?.addEventListener('input', run);
      document.getElementById('btn-tz-now')?.addEventListener('click', () => {
        if (inp) inp.value = new Date().toISOString().slice(0, 16);
        run();
      });
      run();
    }

    if (toolId === 'dateformatter') {
      const dateIn = document.getElementById('dt-fmt-date');
      const patIn = document.getElementById('dt-fmt-pattern');
      const resEl = document.getElementById('dt-fmt-result');
      const run = () => {
        const d = dateIn?.value ? new Date(dateIn.value) : new Date();
        const pat = patIn?.value || 'YYYY-MM-DD';
        const formatted = T.datetime.format(d, pat);
        if (resEl) resEl.textContent = formatted;
      };
      dateIn?.addEventListener('input', run);
      patIn?.addEventListener('change', run);
      run();
    }

    // 5. Random
    if (toolId === 'number') {
      const run = () => {
        const min = +document.getElementById('rnd-num-min')?.value || 1;
        const max = +document.getElementById('rnd-num-max')?.value || 100;
        const cnt = +document.getElementById('rnd-num-cnt')?.value || 5;
        const isFloat = document.getElementById('rnd-num-type')?.value === 'float';
        const res = T.random.number(min, max, isFloat, cnt);
        const out = document.getElementById('rndnum-output');
        if (out) out.value = Array.isArray(res) ? res.join(', ') : res;
      };
      document.getElementById('btn-rndnum-gen')?.addEventListener('click', run);
      run();
    }

    if (toolId === 'string') {
      const run = () => {
        const len = +document.getElementById('rnd-str-len')?.value || 16;
        const opts = {
          upper: document.getElementById('rnd-str-up')?.checked,
          lower: document.getElementById('rnd-str-low')?.checked,
          numbers: document.getElementById('rnd-str-num')?.checked,
          symbols: document.getElementById('rnd-str-sym')?.checked,
        };
        const res = T.random.string(len, opts);
        const out = document.getElementById('rndstr-output');
        if (out) out.value = res;
      };
      document.getElementById('btn-rndstr-gen')?.addEventListener('click', run);
      run();
    }

    if (toolId === 'color') {
      const run = () => {
        const c = T.random.color();
        const sw = document.getElementById('rnd-color-swatch');
        if (sw) {
          sw.style.backgroundColor = c.hex;
          sw.style.color = (parseInt(c.hex.slice(1, 3), 16) > 128) ? '#000' : '#fff';
          sw.textContent = c.hex.toUpperCase();
        }
        const h = document.getElementById('rnd-col-hex');
        const r = document.getElementById('rnd-col-rgb');
        const s = document.getElementById('rnd-col-hsl');
        if (h) h.textContent = c.hex;
        if (r) r.textContent = c.rgb;
        if (s) s.textContent = c.hsl;
      };
      document.getElementById('btn-rndcol-gen')?.addEventListener('click', run);
      run();
    }

    // 6. Text
    if (toolId === 'caseconverter') {
      const inp = document.getElementById('txt-case-in');
      const out = document.getElementById('txt-case-out');
      document.querySelectorAll('#case-btn-row button').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetCase = btn.dataset.case;
          const res = T.text.case(inp?.value || '', targetCase);
          if (out) out.value = res;
        });
      });
    }

    if (toolId === 'sluggenerator') {
      const inp = document.getElementById('txt-slug-in');
      const out = document.getElementById('txt-slug-out');
      const run = () => {
        const delim = document.querySelector('input[name="slug-delim"]:checked')?.value || '-';
        const res = T.text.slug(inp?.value || '', delim);
        if (out) out.value = res;
      };
      inp?.addEventListener('input', run);
      document.querySelectorAll('input[name="slug-delim"]').forEach(r => r.addEventListener('change', run));
      run();
    }

    if (toolId === 'textcounter') {
      const inp = document.getElementById('txt-cnt-in');
      const run = () => {
        const res = T.text.count(inp?.value || '');
        const c = document.getElementById('st-chars');
        const w = document.getElementById('st-words');
        const l = document.getElementById('st-lines');
        const b = document.getElementById('st-bytes');
        if (c) c.textContent = res.chars;
        if (w) w.textContent = res.words;
        if (l) l.textContent = res.lines;
        if (b) b.textContent = res.bytes;
      };
      inp?.addEventListener('input', run);
      run();
    }

    if (toolId === 'reversetext') {
      let mode = 'chars';
      const inp = document.getElementById('txt-rev-in');
      const out = document.getElementById('txt-rev-out');
      const run = () => {
        if (out) out.value = T.text.reverse(inp?.value || '', mode);
      };
      document.querySelectorAll('#rev-mode-row .pill-tab').forEach(p => {
        p.addEventListener('click', () => {
          document.querySelectorAll('#rev-mode-row .pill-tab').forEach(b => b.classList.remove('active'));
          p.classList.add('active');
          mode = p.dataset.mode;
          run();
        });
      });
      inp?.addEventListener('input', run);
      run();
    }

    if (toolId === 'removeduplicates') {
      const inp = document.getElementById('txt-dedupe-in');
      const out = document.getElementById('txt-dedupe-out');
      const run = () => {
        const cs = document.getElementById('dedupe-case')?.checked;
        const tr = document.getElementById('dedupe-trim')?.checked;
        const so = document.getElementById('dedupe-sort')?.value;
        if (out) out.value = T.text.removeDuplicates(inp?.value || '', cs, so, true, tr);
      };
      inp?.addEventListener('input', run);
      document.getElementById('dedupe-case')?.addEventListener('change', run);
      document.getElementById('dedupe-trim')?.addEventListener('change', run);
      document.getElementById('dedupe-sort')?.addEventListener('change', run);
      run();
    }

    // 7. Converters
    if (toolId === 'numberbase') {
      const dec = document.getElementById('nb-dec');
      const bin = document.getElementById('nb-bin');
      const hex = document.getElementById('nb-hex');
      const oct = document.getElementById('nb-oct');

      const updateAll = (sourceBase, val) => {
        try {
          const r = T.converters.numberBase(val, sourceBase);
          if (sourceBase !== 10 && dec) dec.value = r.dec;
          if (sourceBase !== 2 && bin) bin.value = r.bin;
          if (sourceBase !== 16 && hex) hex.value = r.hex;
          if (sourceBase !== 8 && oct) oct.value = r.oct;
        } catch (_) {}
      };

      dec?.addEventListener('input', (e) => updateAll(10, e.target.value));
      bin?.addEventListener('input', (e) => updateAll(2, e.target.value));
      hex?.addEventListener('input', (e) => updateAll(16, e.target.value));
      oct?.addEventListener('input', (e) => updateAll(8, e.target.value));

      document.getElementById('btn-nb-sample')?.addEventListener('click', () => {
        if (dec) {
          dec.value = '1337';
          updateAll(10, '1337');
        }
      });
      document.getElementById('btn-nb-clear')?.addEventListener('click', () => {
        if (dec) dec.value = '';
        if (bin) bin.value = '';
        if (hex) hex.value = '';
        if (oct) oct.value = '';
      });
    }

    if (toolId === 'jsonformatter') {
      const inp = document.getElementById('json-fmt-in');
      const out = document.getElementById('json-fmt-out');
      const st = document.getElementById('json-status');

      const format = (space) => {
        try {
          const formatted = T.converters.formatJson(inp?.value || '', space);
          if (out) out.value = formatted;
          if (st) {
            st.classList.remove('hidden');
            st.textContent = 'JSON VALID ✓';
            st.className = 'text-xs font-mono text-white font-bold';
          }
        } catch (err) {
          if (st) {
            st.classList.remove('hidden');
            st.textContent = err.message;
            st.className = 'text-xs font-mono text-neutral-400';
          }
        }
      };

      document.getElementById('btn-json-2')?.addEventListener('click', () => format(2));
      document.getElementById('btn-json-4')?.addEventListener('click', () => format(4));
      document.getElementById('btn-json-min')?.addEventListener('click', () => format(0));
      document.getElementById('btn-json-sample')?.addEventListener('click', () => {
        if (inp) {
          inp.value = JSON.stringify({ name: 'Offline Suite', version: 2, privacy: '100% Client-Side', tools: 29 }, null, 2);
          format(2);
        }
      });
      document.getElementById('btn-json-clear')?.addEventListener('click', () => {
        if (inp) inp.value = '';
        if (out) out.value = '';
        if (st) st.classList.add('hidden');
      });
      inp?.addEventListener('input', () => format(2));
    }

    if (toolId === 'jsonyaml') {
      let mode = 'toYaml';
      const inp = document.getElementById('jy-in');
      const out = document.getElementById('jy-out');
      const lbl = document.getElementById('jy-in-lbl');

      const run = () => {
        const val = inp?.value || '';
        if (!val) { if (out) out.value = ''; return; }
        try {
          if (mode === 'toYaml') {
            if (out) out.value = T.converters.jsonToYaml(val);
          } else {
            if (out) out.value = T.converters.yamlToJson(val);
          }
        } catch (err) {
          if (out) out.value = 'Error: ' + err.message;
        }
      };

      document.querySelectorAll('#jy-mode-pills .pill-tab').forEach(p => {
        p.addEventListener('click', () => {
          document.querySelectorAll('#jy-mode-pills .pill-tab').forEach(b => b.classList.remove('active'));
          p.classList.add('active');
          mode = p.dataset.mode;
          if (lbl) lbl.textContent = mode === 'toYaml' ? 'Input JSON' : 'Input YAML';
          run();
        });
      });

      inp?.addEventListener('input', run);
      document.getElementById('btn-jy-sample')?.addEventListener('click', () => {
        if (inp) {
          if (mode === 'toYaml') {
            inp.value = JSON.stringify({ app: 'OfflineSuite', build: 2026, tags: ['offline', 'crypto', 'tools'] }, null, 2);
          } else {
            inp.value = 'app: OfflineSuite\nbuild: 2026\ntags:\n  - offline\n  - crypto\n  - tools';
          }
          run();
        }
      });
      document.getElementById('btn-jy-clear')?.addEventListener('click', () => {
        if (inp) inp.value = '';
        if (out) out.value = '';
      });
      run();
    }

    if (toolId === 'csvjson') {
      let mode = 'toJson';
      const inp = document.getElementById('cj-in');
      const out = document.getElementById('cj-out');
      const delim = document.getElementById('cj-delimiter');
      const lbl = document.getElementById('cj-in-lbl');

      const run = () => {
        const val = inp?.value || '';
        const d = delim?.value || ',';
        if (!val) { if (out) out.value = ''; return; }
        try {
          if (mode === 'toJson') {
            if (out) out.value = T.converters.csvToJson(val, d);
          } else {
            if (out) out.value = T.converters.jsonToCsv(val, d);
          }
        } catch (err) {
          if (out) out.value = 'Error: ' + err.message;
        }
      };

      document.querySelectorAll('#cj-mode-pills .pill-tab').forEach(p => {
        p.addEventListener('click', () => {
          document.querySelectorAll('#cj-mode-pills .pill-tab').forEach(b => b.classList.remove('active'));
          p.classList.add('active');
          mode = p.dataset.mode;
          if (lbl) lbl.textContent = mode === 'toJson' ? 'Input CSV' : 'Input JSON';
          run();
        });
      });

      inp?.addEventListener('input', run);
      delim?.addEventListener('change', run);
      document.getElementById('btn-cj-sample')?.addEventListener('click', () => {
        if (inp) {
          if (mode === 'toJson') {
            inp.value = 'id,name,role,status\n1,Alice,Engineer,Active\n2,Bob,Designer,Pending\n3,Carol,Manager,Active';
          } else {
            inp.value = JSON.stringify([
              { id: 1, name: 'Alice', role: 'Engineer' },
              { id: 2, name: 'Bob', role: 'Designer' }
            ], null, 2);
          }
          run();
        }
      });
      document.getElementById('btn-cj-clear')?.addEventListener('click', () => {
        if (inp) inp.value = '';
        if (out) out.value = '';
      });
      run();
    }
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

  // Global API
  window.OVSuite = {
    selectCategory,
    toast,
  };
})();
