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
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const catId = tab.dataset.cat;
        selectCategory(catId);
      });
    });
  }

  function selectCategory(catId, defaultToolId) {
    activeCatId = catId;
    const cat = (window.OVPages.CATEGORIES || []).find(c => c.id === catId);
    if (!cat) return;

    activeToolId = defaultToolId || (cat.tools[0] && cat.tools[0].id);

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
     2. HASHING TEMPLATES & HANDLERS
     ============================================================ */
  function renderHashingTool(toolId) {
    if (toolId === 'filehash') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-neutral-300">File Hashing</label>
            <select id="fh-algo" class="input-mono !py-1 !px-2.5 !text-xs !w-auto">
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-384">SHA-384</option>
              <option value="SHA-512">SHA-512</option>
            </select>
          </div>
          <div id="fh-drop-zone" class="drag-zone-mono">
            <p class="text-sm font-bold text-white mb-1">Drag &amp; Drop any file here</p>
            <p class="text-xs text-neutral-400">or click to browse from device. Hash runs 100% locally in browser memory.</p>
            <input type="file" id="fh-file-input" class="hidden" />
          </div>
          <div id="fh-file-details" class="hidden text-xs text-neutral-400 font-mono pt-2 border-t border-neutral-800"></div>
        </div>
        ${renderOutputCard('filehash-output')}
      `;
    }

    if (toolId === 'customcodec') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-bold uppercase tracking-wider text-neutral-300">Reversible Token Codec (v1 / v2)</label>
            <div class="flex gap-1.5" id="codec-mode-pills">
              <button type="button" class="pill-tab active" data-mode="encode">Encode</button>
              <button type="button" class="pill-tab" data-mode="decode">Decode</button>
            </div>
          </div>
          <div id="codec-field-data">
            <label class="block text-xs font-bold text-neutral-400 uppercase mb-1">Payload / Text</label>
            <textarea id="codec-in-data" rows="3" class="input-mono text-xs resize-y" placeholder="Type text to encode, or paste token to decode…"></textarea>
          </div>
          <div id="codec-field-salt">
            <label class="block text-xs font-bold text-neutral-400 uppercase mb-1">Salt / Key <span class="text-neutral-500 font-normal">(optional)</span></label>
            <input type="text" id="codec-in-salt" class="input-mono text-xs font-mono" placeholder="Custom salt (optional)" />
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="btn-codec-run" class="btn-mono btn-mono-primary !py-2 flex-1">Encode Token</button>
            <button type="button" id="btn-codec-sample" class="btn-mono !py-2">Sample</button>
          </div>
        </div>
        ${renderOutputCard('codec-output')}
      `;
    }

    // Standard SHA-256, SHA-384, SHA-512 with 1 or multiple values
    return `
      <div class="card-mono p-5 mb-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
          <label class="text-xs font-bold uppercase tracking-wider text-neutral-300">Values to Hash</label>
          <div class="flex items-center gap-1.5" id="hash-val-modes">
            <button type="button" class="pill-tab active" data-count="1">1 Value</button>
            <button type="button" class="pill-tab" data-count="2">2 Values (Data + Salt/Key)</button>
            <button type="button" class="pill-tab" data-count="3">3 Values</button>
          </div>
        </div>

        <div id="hash-combine-row" class="hidden flex items-center justify-between text-xs py-2 border-y border-neutral-800">
          <span class="text-neutral-400 font-semibold uppercase text-[11px]">Combine Method:</span>
          <select id="hash-combine-mode" class="input-mono !py-1 !px-2 !text-xs !w-auto">
            <option value="salted">Salted: Value 1 + Value 2</option>
            <option value="colon">Colon Separated: Value 1 : Value 2</option>
            <option value="newline">Newline Separated</option>
          </select>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
            <span class="font-bold text-neutral-300">VALUE 1: DATA / MESSAGE</span>
            <span id="h-char-cnt-1">0 chars</span>
          </div>
          <textarea id="h-val-1" rows="2" class="input-mono text-xs resize-y" placeholder="Enter primary value to hash…"></textarea>
        </div>

        <div id="h-wrap-2" class="hidden">
          <div class="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
            <span class="font-bold text-neutral-300">VALUE 2: SALT / SECRET KEY</span>
            <span id="h-char-cnt-2">0 chars</span>
          </div>
          <input type="text" id="h-val-2" class="input-mono text-xs" placeholder="Enter salt or secondary value…" />
        </div>

        <div id="h-wrap-3" class="hidden">
          <div class="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
            <span class="font-bold text-neutral-300">VALUE 3: EXTRA VALUE</span>
            <span id="h-char-cnt-3">0 chars</span>
          </div>
          <input type="text" id="h-val-3" class="input-mono text-xs" placeholder="Enter third value…" />
        </div>
      </div>
      ${renderOutputCard('hash-output', true)}
    `;
  }

  /* ============================================================
     3. ENCODING TEMPLATES & HANDLERS
     ============================================================ */
  function renderEncodingTool(toolId) {
    return `
      <div class="card-mono p-5 mb-5 space-y-4">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1.5" id="enc-mode-pills">
            <button type="button" class="pill-tab active" data-mode="encode">Encode</button>
            <button type="button" class="pill-tab" data-mode="decode">Decode</button>
          </div>
          <button type="button" id="btn-enc-swap" class="btn-mono !py-1 !px-2.5 text-xs">⇄ Swap</button>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
            <span id="enc-input-lbl" class="font-bold text-neutral-300 uppercase">Input Text to Encode</span>
            <span id="enc-char-cnt">0 chars</span>
          </div>
          <textarea id="enc-input" rows="4" class="input-mono text-xs resize-y" placeholder="Type or paste input…"></textarea>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
            <span id="enc-output-lbl" class="font-bold text-neutral-300 uppercase">Output Result</span>
            <button type="button" id="btn-enc-copy" class="btn-mono !py-1 !px-2 text-[10px]">Copy</button>
          </div>
          <textarea id="enc-output" rows="4" readonly class="hash-output-box text-xs resize-y w-full"></textarea>
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
        <div class="card-mono p-5 mb-5 space-y-3">
          <div><label class="block text-xs font-bold text-neutral-400 uppercase mb-1">Decimal (Base 10)</label><input type="text" id="nb-dec" class="input-mono text-xs font-mono" placeholder="12345" /></div>
          <div><label class="block text-xs font-bold text-neutral-400 uppercase mb-1">Binary (Base 2)</label><input type="text" id="nb-bin" class="input-mono text-xs font-mono" placeholder="11000000111001" /></div>
          <div><label class="block text-xs font-bold text-neutral-400 uppercase mb-1">Hexadecimal (Base 16)</label><input type="text" id="nb-hex" class="input-mono text-xs font-mono" placeholder="3039" /></div>
          <div><label class="block text-xs font-bold text-neutral-400 uppercase mb-1">Octal (Base 8)</label><input type="text" id="nb-oct" class="input-mono text-xs font-mono" placeholder="30071" /></div>
        </div>
      `;
    }

    if (toolId === 'jsonformatter') {
      return `
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-neutral-300 uppercase">Input JSON</label>
            <div class="flex items-center gap-1.5">
              <button type="button" id="btn-json-2" class="btn-mono !py-1 !px-2 text-xs">2 Spaces</button>
              <button type="button" id="btn-json-4" class="btn-mono !py-1 !px-2 text-xs">4 Spaces</button>
              <button type="button" id="btn-json-min" class="btn-mono !py-1 !px-2 text-xs">Minify</button>
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
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5" id="jy-mode-pills">
              <button type="button" class="pill-tab active" data-mode="toYaml">JSON → YAML</button>
              <button type="button" class="pill-tab" data-mode="toJson">YAML → JSON</button>
            </div>
            <button type="button" id="btn-jy-sample" class="btn-mono !py-1 !px-2 text-xs">Sample</button>
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
        <div class="card-mono p-5 mb-5 space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-1.5" id="cj-mode-pills">
              <button type="button" class="pill-tab active" data-mode="toJson">CSV → JSON</button>
              <button type="button" class="pill-tab" data-mode="toCsv">JSON → CSV</button>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-neutral-400">Delimiter:</span>
              <select id="cj-delimiter" class="input-mono !py-1 !px-2 text-xs !w-auto">
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="&#9;">Tab (\t)</option>
              </select>
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
      <div class="card-mono p-5 mb-5 border-neutral-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-white">Generated Output</span>
          <button type="button" data-copy-target="${outputId}" class="btn-copy-out btn-mono btn-mono-primary !py-1 !px-3 text-xs font-bold">Copy Output</button>
        </div>
        <textarea id="${outputId}" rows="3" readonly class="hash-output-box text-xs resize-y w-full"></textarea>
        ${hasCompare ? `
          <div class="mt-3 pt-3 border-t border-neutral-800 flex items-center gap-2">
            <input type="text" id="hash-compare-input" class="input-mono !py-1.5 text-xs" placeholder="Paste expected hash to compare…" />
            <span id="hash-compare-badge" class="badge-mono text-[10px] hidden"></span>
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

    // Global copy button handler
    document.querySelectorAll('.btn-copy-out').forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetId = btn.dataset.copyTarget;
        const target = document.getElementById(targetId);
        if (!target || !target.value) return;
        try {
          await navigator.clipboard.writeText(target.value);
          toast('COPIED', target.value.slice(0, 28) + '…');
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

    // 2. Hashing
    if (toolId === 'sha256' || toolId === 'sha384' || toolId === 'sha512') {
      const algo = toolId.toUpperCase();
      let activeCnt = 1;

      const run = async () => {
        const v1 = document.getElementById('h-val-1')?.value || '';
        const v2 = document.getElementById('h-val-2')?.value || '';
        const v3 = document.getElementById('h-val-3')?.value || '';
        const combine = document.getElementById('hash-combine-mode')?.value || 'salted';

        const vals = [v1];
        if (activeCnt >= 2) vals.push(v2);
        if (activeCnt >= 3) vals.push(v3);

        const res = await T.hashing.hashValues(algo, vals, combine);
        const out = document.getElementById('hash-output');
        if (out) out.value = res.hex;
      };

      document.querySelectorAll('#hash-val-modes .pill-tab').forEach(p => {
        p.addEventListener('click', () => {
          document.querySelectorAll('#hash-val-modes .pill-tab').forEach(b => b.classList.remove('active'));
          p.classList.add('active');
          activeCnt = +p.dataset.count;

          document.getElementById('hash-combine-row')?.classList.toggle('hidden', activeCnt < 2);
          document.getElementById('h-wrap-2')?.classList.toggle('hidden', activeCnt < 2);
          document.getElementById('h-wrap-3')?.classList.toggle('hidden', activeCnt < 3);
          run();
        });
      });

      ['h-val-1', 'h-val-2', 'h-val-3'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', run);
      });
      document.getElementById('hash-combine-mode')?.addEventListener('change', run);

      // Compare feature
      document.getElementById('hash-compare-input')?.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        const current = (document.getElementById('hash-output')?.value || '').trim().toLowerCase();
        const badge = document.getElementById('hash-compare-badge');
        if (!badge) return;
        if (!val || !current) {
          badge.classList.add('hidden');
          return;
        }
        badge.classList.remove('hidden');
        badge.textContent = val === current ? 'MATCH ✓' : 'MISMATCH ✗';
        badge.className = 'badge-mono text-[10px] ' + (val === current ? 'badge-mono-invert' : 'border-neutral-600');
      });

      run();
    }

    if (toolId === 'filehash') {
      const dropZone = document.getElementById('fh-drop-zone');
      const fileIn = document.getElementById('fh-file-input');
      const algoSel = document.getElementById('fh-algo');
      const details = document.getElementById('fh-file-details');
      const out = document.getElementById('filehash-output');

      const processFile = async (f) => {
        if (!f) return;
        const algo = algoSel?.value || 'SHA-256';
        if (details) {
          details.classList.remove('hidden');
          details.textContent = `File: ${f.name} · Size: ${(f.size / 1024).toFixed(2)} KB`;
        }
        const res = await T.hashing.hashFile(f, algo);
        if (out) out.value = res.hex;
      };

      dropZone?.addEventListener('click', () => fileIn?.click());
      fileIn?.addEventListener('change', (e) => processFile(e.target.files?.[0]));
      dropZone?.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
      dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
      dropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        processFile(e.dataTransfer?.files?.[0]);
      });
    }

    if (toolId === 'customcodec') {
      let mode = 'encode';
      const inData = document.getElementById('codec-in-data');
      const inSalt = document.getElementById('codec-in-salt');
      const runBtn = document.getElementById('btn-codec-run');
      const sampleBtn = document.getElementById('btn-codec-sample');
      const out = document.getElementById('codec-output');

      const run = () => {
        const val = inData?.value || '';
        const salt = inSalt?.value || '';
        if (mode === 'encode') {
          const tok = global.OVHash.encode(val, salt || undefined);
          if (out) out.value = tok;
        } else {
          const plain = global.OVHash.decode(val, salt || undefined);
          if (out) out.value = plain !== null ? plain : 'Error: Invalid token or salt mismatch.';
        }
      };

      document.querySelectorAll('#codec-mode-pills .pill-tab').forEach(p => {
        p.addEventListener('click', () => {
          document.querySelectorAll('#codec-mode-pills .pill-tab').forEach(b => b.classList.remove('active'));
          p.classList.add('active');
          mode = p.dataset.mode;
          if (runBtn) runBtn.textContent = mode === 'encode' ? 'Encode Token' : 'Decode Token';
          run();
        });
      });

      runBtn?.addEventListener('click', run);
      sampleBtn?.addEventListener('click', () => {
        if (inData) inData.value = 'Secret User Credentials 2026';
        if (inSalt) inSalt.value = 'app_salt_xyz';
        run();
      });
      run();
    }

    // 3. Encoding
    if (['base64', 'url', 'hex', 'binary', 'html', 'customtoken'].includes(toolId)) {
      let mode = 'encode';
      const inputEl = document.getElementById('enc-input');
      const outputEl = document.getElementById('enc-output');
      const swapBtn = document.getElementById('btn-enc-swap');

      const execute = () => {
        const str = inputEl?.value || '';
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
          execute();
        }
      });

      document.getElementById('btn-enc-copy')?.addEventListener('click', async () => {
        if (outputEl?.value) {
          await navigator.clipboard.writeText(outputEl.value);
          toast('COPIED', 'Encoded output copied.');
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
          inp.value = JSON.stringify({ app: 'OfflineSuite', version: 2, features: ['identifiers', 'hashing', 'encoding'] }, null, 2);
          run();
        }
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
