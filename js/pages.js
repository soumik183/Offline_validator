/**
 * pages.js
 * Minimalist Black & White Single-Page Template for Offline Validator.
 * Purely focused on the Hash Option and Fields.
 */
(function (global) {
  'use strict';

  function singlePage() {
    return `
    <div class="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <!-- Minimalist Header -->
      <div class="mb-8 border-b border-neutral-800 pb-6">
        <div class="flex items-center justify-between gap-4 mb-2">
          <div class="inline-flex items-center gap-2">
            <span class="w-2.5 h-2.5 bg-white rounded-full"></span>
            <span class="text-xs font-bold tracking-widest uppercase text-neutral-400">OFFLINE HASH ENGINE</span>
          </div>
          <span class="badge-mono text-[10px]">100% IN-BROWSER</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">Hash Generator</h1>
        <p class="text-xs sm:text-sm text-neutral-400 mt-1">Select 1 or multiple values to generate cryptographic hashes and reversible tokens instantly.</p>
      </div>

      <!-- Step 1: Select Hash Algorithm -->
      <div class="card-mono p-5 mb-5">
        <div class="flex items-center justify-between mb-3">
          <label class="text-xs font-bold uppercase tracking-wider text-neutral-300">1. Select Algorithm</label>
          <span id="algo-spec" class="text-[11px] text-neutral-400 font-mono">256-bit secure hash</span>
        </div>
        <div class="flex flex-wrap gap-2" id="algo-pills">
          <button type="button" class="pill-tab active" data-algo="SHA-256">SHA-256</button>
          <button type="button" class="pill-tab" data-algo="SHA-512">SHA-512</button>
          <button type="button" class="pill-tab" data-algo="SHA-1">SHA-1</button>
          <button type="button" class="pill-tab" data-algo="MD5">MD5</button>
          <button type="button" class="pill-tab" data-algo="FNV-1a">FNV-1a (32-bit)</button>
          <button type="button" class="pill-tab" data-algo="v1-token">Reversible Token (v1)</button>
          <button type="button" class="pill-tab" data-algo="v2-token">Structured Token (v2)</button>
        </div>
      </div>

      <!-- Step 2: Select Fields & Mode -->
      <div class="card-mono p-5 mb-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <label class="text-xs font-bold uppercase tracking-wider text-neutral-300">2. Select Values to Hash</label>
          <div class="flex items-center gap-1.5" id="mode-pills">
            <button type="button" class="pill-tab active" data-mode="1">1 Value</button>
            <button type="button" class="pill-tab" data-mode="2">2 Values (Data + Salt/Key)</button>
            <button type="button" class="pill-tab" data-mode="multi">Multiple Values</button>
          </div>
        </div>

        <!-- Checkbox selection for active fields -->
        <div class="flex flex-wrap items-center gap-4 py-2 border-y border-neutral-800 text-xs text-neutral-300">
          <label class="inline-flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" id="check-field-1" checked disabled class="checkbox-mono" />
            <span>Value 1 (Primary Data)</span>
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" id="check-field-2" class="checkbox-mono" />
            <span>Value 2 (Salt / Key)</span>
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" id="check-field-3" class="checkbox-mono" />
            <span>Value 3 (Extra Value)</span>
          </label>
        </div>

        <!-- Combination strategy (shown when 2 or more values are active) -->
        <div id="combine-wrap" class="mt-3.5 pt-1 hidden">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span class="text-neutral-400 font-semibold uppercase text-[11px]">Combine Method:</span>
            <select id="combine-mode" class="input-mono !py-1 !px-2.5 !text-xs !w-auto">
              <option value="salted">Salted: Value 1 + Value 2</option>
              <option value="colon">Colon Separated: Value 1 : Value 2</option>
              <option value="concat">Concatenated: Value 1 + Value 2 (No separator)</option>
              <option value="newline">Newline Separated</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Step 3: Input Values -->
      <div class="card-mono p-5 mb-5 space-y-4">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold uppercase tracking-wider text-neutral-300">3. Input Value(s)</label>
          <div class="flex items-center gap-2">
            <button type="button" id="btn-sample" class="btn-mono btn-mono-ghost !py-1 !px-2 text-xs">Load Sample</button>
            <button type="button" id="btn-clear" class="btn-mono btn-mono-ghost !py-1 !px-2 text-xs">Clear</button>
          </div>
        </div>

        <!-- Field 1 -->
        <div id="field-wrap-1">
          <div class="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
            <span class="font-bold text-neutral-300">VALUE 1: PRIMARY DATA / MESSAGE</span>
            <span id="char-count-1">0 chars</span>
          </div>
          <textarea id="val-1" rows="3" class="input-mono resize-y" placeholder="Type or paste primary text to hash…"></textarea>
        </div>

        <!-- Field 2 -->
        <div id="field-wrap-2" class="hidden">
          <div class="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
            <span class="font-bold text-neutral-300">VALUE 2: SALT / SECRET KEY / SUFFIX</span>
            <span id="char-count-2">0 chars</span>
          </div>
          <input type="text" id="val-2" class="input-mono" placeholder="Enter salt, secret key, or second value…" />
        </div>

        <!-- Field 3 -->
        <div id="field-wrap-3" class="hidden">
          <div class="flex items-center justify-between mb-1 text-[11px] text-neutral-400">
            <span class="font-bold text-neutral-300">VALUE 3: EXTRA VALUE</span>
            <span id="char-count-3">0 chars</span>
          </div>
          <input type="text" id="val-3" class="input-mono" placeholder="Enter third value…" />
        </div>
      </div>

      <!-- Step 4: Output Hash -->
      <div class="card-mono p-5 mb-5 border-neutral-700">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-white">Generated Hash</span>
            <span id="hash-info-badge" class="badge-mono text-[10px]">SHA-256</span>
          </div>
          <div class="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
            <span id="hash-length">0 chars</span>
          </div>
        </div>

        <!-- Output display box -->
        <div id="hash-output" class="hash-output-box min-h-[3.5rem] break-all select-all flex items-center">
          <span class="text-neutral-500 font-normal">Hash will generate automatically as you type…</span>
        </div>

        <!-- Output actions toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-neutral-800">
          <div class="flex items-center gap-2">
            <button type="button" id="btn-case" class="btn-mono !py-1 !px-2.5 text-xs">UPPERCASE</button>
            <button type="button" id="btn-format" class="btn-mono !py-1 !px-2.5 text-xs">HEX</button>
          </div>
          <button type="button" id="btn-copy" class="btn-mono btn-mono-primary !py-1.5 !px-4 text-xs font-bold">
            Copy Hash
          </button>
        </div>
      </div>

      <!-- Step 5: Verify / Compare Hash -->
      <div class="card-mono p-5 mb-5">
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-bold uppercase tracking-wider text-neutral-300">Verify / Compare Hash</label>
          <span id="match-badge" class="badge-mono text-[10px] hidden"></span>
        </div>
        <input type="text" id="val-compare" class="input-mono text-xs" placeholder="Paste an expected hash here to compare against the output…" />
      </div>

      <!-- Step 6: Universal Token Decoder / Dehash -->
      <div class="card-mono p-5">
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-bold uppercase tracking-wider text-neutral-300">Decode Reversible Token (v1 / v2 / .ovlicense)</label>
          <button type="button" id="btn-decode-run" class="btn-mono !py-1 !px-2.5 text-xs">Decode Token</button>
        </div>
        <textarea id="token-decode-input" rows="2" class="input-mono text-xs resize-y" placeholder="Paste a v1$… or ov2s$… token or JSON license here to reverse it into original values…"></textarea>
        <div id="token-decode-result" class="mt-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono hidden"></div>
      </div>
    </div>
    `;
  }

  global.OVPages = {
    singlePage,
    landing: singlePage,
    dashboard: singlePage,
    hashPlayground: singlePage,
    about: singlePage,
  };
})(window);
