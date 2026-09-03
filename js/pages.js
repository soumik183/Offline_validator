/**
 * pages.js
 * Minimalist Black & White Multi-Type Encoder & Decoder Layout.
 * 100% Client-Side. Clean & Responsive.
 */
(function (global) {
  'use strict';

  function singlePage() {
    return `
    <div class="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">

      <!-- ============================================================
           CARD 1: ENCODER CARD
           ============================================================ -->
      <div class="card-mono p-4 sm:p-6 space-y-5">
        <!-- Encoder Header & Type Selector -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-white"></span>
            <h2 class="text-sm font-extrabold uppercase tracking-wider text-white">ENCODER</h2>
            <span id="fields-badge-cnt" class="badge-mono text-[10px]">1 TYPE SELECTED</span>
          </div>

          <!-- Type Selector + Add Button -->
          <div class="flex items-center gap-2">
            <select id="sel-add-type" class="input-mono !py-1.5 !px-2.5 !text-xs !w-auto font-semibold cursor-pointer">
              <option value="text">Text / Message</option>
              <option value="uuid">UUID (v4)</option>
              <option value="userid">User ID (usr_...)</option>
              <option value="date">Date &amp; Time</option>
              <option value="number">Number</option>
              <option value="salt">Secret Key / Salt</option>
              <option value="json">JSON Data</option>
            </select>
            <button type="button" id="btn-add-type" class="btn-mono btn-mono-primary !py-1.5 !px-3 text-xs font-bold flex items-center gap-1">
              <span>+ Add Type</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Fields Container -->
        <div id="encoder-fields-list" class="space-y-4">
          <!-- Dynamically populated field rows -->
        </div>

        <!-- Optional Secret Key / Salt -->
        <div class="pt-2 border-t border-neutral-800">
          <label class="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
            Secret Key / Salt <span class="text-neutral-500 font-normal">(Optional — used to encrypt/lock the token)</span>
          </label>
          <input type="text" id="encoder-secret-key" class="input-mono text-xs font-mono" placeholder="Optional password or secret salt..." />
        </div>

        <!-- Encode Action Buttons -->
        <div class="flex items-center gap-2 pt-1">
          <button type="button" id="btn-run-encode" class="btn-mono btn-mono-primary !py-2.5 flex-1 text-xs font-bold tracking-wider uppercase">
            <span>🔒 Encode Token</span>
          </button>
          <button type="button" id="btn-clear-encoder" class="btn-mono !py-2.5 text-xs text-neutral-400 hover:text-white" title="Reset all fields">
            <span>✕ Reset</span>
          </button>
        </div>

        <!-- Encoded Output Result Box -->
        <div id="encoder-output-section" class="hidden space-y-2 pt-4 border-t border-neutral-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-white">Generated Encoded Output</span>
              <span id="encoder-stats-badge" class="badge-mono text-[10px]"></span>
            </div>
            <button type="button" id="btn-copy-encoded" class="btn-mono btn-mono-primary !py-1 !px-3 text-xs font-bold">
              <span>Copy Output</span>
            </button>
          </div>
          <textarea id="encoder-output-text" rows="3" readonly class="hash-output-box text-xs resize-y w-full font-mono"></textarea>
        </div>
      </div>

      <!-- ============================================================
           CARD 2: DECODER CARD
           ============================================================ -->
      <div class="card-mono p-4 sm:p-6 space-y-5">
        <!-- Decoder Header -->
        <div class="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-white"></span>
            <h2 class="text-sm font-extrabold uppercase tracking-wider text-white">DECODER</h2>
          </div>
          <span class="badge-mono text-[10px]">REVERSE TOKEN &amp; DETECT TYPES</span>
        </div>

        <!-- Encoded Text Input -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-[11px] font-bold text-neutral-300 uppercase">Paste Encoded Token</label>
            <button type="button" id="btn-paste-decoder" class="btn-mono !py-0.5 !px-2 text-[10px]">Paste from Clipboard</button>
          </div>
          <textarea id="decoder-input-text" rows="3" class="input-mono text-xs font-mono resize-y" placeholder="Paste v1$... token here to decode and extract types &amp; values..."></textarea>
        </div>

        <!-- Optional Secret Key / Salt for Decoding -->
        <div>
          <label class="block text-[11px] font-bold text-neutral-400 uppercase mb-1">
            Secret Key / Salt <span class="text-neutral-500 font-normal">(Leave empty if no custom key was used)</span>
          </label>
          <input type="text" id="decoder-secret-key" class="input-mono text-xs font-mono" placeholder="Enter salt/key if the token was locked..." />
        </div>

        <!-- Decode Action Buttons -->
        <div class="flex items-center gap-2">
          <button type="button" id="btn-run-decode" class="btn-mono btn-mono-primary !py-2.5 flex-1 text-xs font-bold tracking-wider uppercase">
            <span>🔓 Decode Token</span>
          </button>
          <button type="button" id="btn-clear-decoder" class="btn-mono !py-2.5 text-xs text-neutral-400 hover:text-white">
            <span>✕ Clear</span>
          </button>
        </div>

        <!-- Decoded Output Details -->
        <div id="decoder-output-section" class="hidden space-y-3 pt-4 border-t border-neutral-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-white uppercase tracking-wider" id="decoder-summary-title">DECODED RESULTS</span>
            <span id="decoder-checksum-badge" class="badge-mono text-[10px]">FNV-1a Verified ✓</span>
          </div>

          <!-- Decoded Field List -->
          <div id="decoder-fields-list" class="space-y-3">
            <!-- Rendered list of decoded types and values -->
          </div>
        </div>
      </div>

    </div>
    `;
  }

  global.OVPages = {
    singlePage,
  };
})(window);
