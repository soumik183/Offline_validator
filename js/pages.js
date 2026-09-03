/**
 * pages.js
 * Minimalist Black & White Multi-Type Encoder & Decoder Layout.
 * 100% Client-Side. Full Responsive & Compact Design.
 */
(function (global) {
  'use strict';

  function singlePage() {
    return `
    <div class="max-w-3xl mx-auto px-2.5 sm:px-4 py-3 sm:py-5 space-y-3.5 sm:space-y-4">

      <!-- ============================================================
           CARD 1: ENCODER CARD (COMPACT & RESPONSIVE)
           ============================================================ -->
      <div class="card-mono p-3 sm:p-5 space-y-3 sm:space-y-3.5">
        <!-- Encoder Header & Type Selector -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-white"></span>
            <h2 class="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">ENCODER</h2>
            <span id="fields-badge-cnt" class="badge-mono !py-0.5 !px-1.5 text-[9px] sm:text-[10px]">1 TYPE SELECTED</span>
          </div>

          <!-- Type Selector + Add Button (Fluid width on mobile) -->
          <div class="flex items-center gap-1.5 w-full sm:w-auto">
            <select id="sel-add-type" class="input-mono !py-1 !px-2 !text-xs flex-1 sm:flex-initial sm:!w-auto font-semibold cursor-pointer">
              <option value="text">Text / Message</option>
              <option value="uuid">UUID (v4)</option>
              <option value="userid">User ID (usr_...)</option>
              <option value="date">Date &amp; Time (Single) 📅</option>
              <option value="daterange">Date to Date (Range) 📅</option>
              <option value="timerange">Time to Time (Range) ⏰</option>
              <option value="number">Number</option>
              <option value="salt">Secret Key / Salt</option>
              <option value="json">JSON Data</option>
              <option value="custom">Custom Type...</option>
            </select>
            <button type="button" id="btn-add-type" class="btn-mono btn-mono-primary !py-1 !px-2.5 text-xs font-bold whitespace-nowrap flex items-center gap-1" title="Add new type field">
              <span>+ Add</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Fields Container -->
        <div id="encoder-fields-list" class="space-y-2.5 sm:space-y-3">
          <!-- Dynamically populated field rows -->
        </div>

        <!-- Optional Secret Key / Salt -->
        <div class="pt-2 border-t border-neutral-800 space-y-1">
          <label class="block text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase">
            Secret Key / Salt <span class="text-neutral-500 font-normal">(Optional — locks the token)</span>
          </label>
          <input type="text" id="encoder-secret-key" class="input-mono !py-1.5 !px-2.5 text-xs font-mono w-full" placeholder="Optional password or custom salt..." />
          <div class="text-[10px] text-neutral-500 font-mono">Details: Optional password or secret key to lock the token. (ex: <span class="text-neutral-300">"my-secret-key#2026"</span>)</div>
        </div>

        <!-- Encode Action Buttons -->
        <div class="flex items-center gap-2 pt-0.5">
          <button type="button" id="btn-run-encode" class="btn-mono btn-mono-primary !py-2 sm:!py-2.5 flex-1 text-xs font-bold tracking-wider uppercase">
            <span>🔒 Encode Token</span>
          </button>
          <button type="button" id="btn-clear-encoder" class="btn-mono !py-2 sm:!py-2.5 text-xs text-neutral-400 hover:text-white px-3" title="Reset all fields">
            <span>✕ Reset</span>
          </button>
        </div>

        <!-- Encoded Output Result Box -->
        <div id="encoder-output-section" class="hidden space-y-1.5 pt-2.5 border-t border-neutral-800">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white">Generated Encoded Output</span>
              <span id="encoder-stats-badge" class="badge-mono !py-0.5 !px-1.5 text-[9px] sm:text-[10px]"></span>
            </div>
            <button type="button" id="btn-copy-encoded" class="btn-mono btn-mono-primary !py-0.5 !px-2.5 text-xs font-bold">
              <span>Copy Output</span>
            </button>
          </div>
          <textarea id="encoder-output-text" rows="2" readonly class="hash-output-box !py-1.5 !px-2.5 text-xs resize-y w-full font-mono"></textarea>
          <div class="text-[10px] text-neutral-500 font-mono">Details: Fully reversible cryptographic stream token with embedded FNV-1a checksum.</div>
        </div>
      </div>

      <!-- ============================================================
           CARD 2: DECODER CARD (COMPACT & RESPONSIVE)
           ============================================================ -->
      <div class="card-mono p-3 sm:p-5 space-y-3 sm:space-y-3.5">
        <!-- Decoder Header -->
        <div class="flex items-center justify-between border-b border-neutral-800 pb-2.5">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-white"></span>
            <h2 class="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">DECODER</h2>
          </div>
          <span class="badge-mono !py-0.5 !px-1.5 text-[9px] sm:text-[10px]">REVERSE TOKEN</span>
        </div>

        <!-- Encoded Text Input -->
        <div class="space-y-1">
          <div class="flex items-center justify-between mb-0.5">
            <label class="text-[10px] sm:text-[11px] font-bold text-neutral-300 uppercase">Paste Encoded Token</label>
            <button type="button" id="btn-paste-decoder" class="btn-mono !py-0.5 !px-2 text-[10px]">Paste from Clipboard</button>
          </div>
          <textarea id="decoder-input-text" rows="2.5" class="input-mono !py-1.5 !px-2.5 text-xs font-mono resize-y w-full" placeholder="Paste v1$... token here to decode and extract types &amp; values..."></textarea>
          <div class="text-[10px] text-neutral-500 font-mono">Details: Paste the full token generated from the Encoder above. (ex: <span class="text-neutral-300">"v1$salt$checksum$payload..."</span>)</div>
        </div>

        <!-- Optional Secret Key / Salt for Decoding -->
        <div class="space-y-1">
          <label class="block text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase">
            Secret Key / Salt <span class="text-neutral-500 font-normal">(Leave empty if no custom key was used)</span>
          </label>
          <input type="text" id="decoder-secret-key" class="input-mono !py-1.5 !px-2.5 text-xs font-mono w-full" placeholder="Enter salt/key if the token was locked..." />
          <div class="text-[10px] text-neutral-500 font-mono">Details: Enter the secret key only if you locked the token when encoding. (ex: <span class="text-neutral-300">"my-secret-key#2026"</span>)</div>
        </div>

        <!-- Decode Action Buttons -->
        <div class="flex items-center gap-2 pt-0.5">
          <button type="button" id="btn-run-decode" class="btn-mono btn-mono-primary !py-2 sm:!py-2.5 flex-1 text-xs font-bold tracking-wider uppercase">
            <span>🔓 Decode Token</span>
          </button>
          <button type="button" id="btn-clear-decoder" class="btn-mono !py-2 sm:!py-2.5 text-xs text-neutral-400 hover:text-white px-3">
            <span>✕ Clear</span>
          </button>
        </div>

        <!-- Decoded Output Details -->
        <div id="decoder-output-section" class="hidden space-y-2.5 pt-2.5 border-t border-neutral-800">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider" id="decoder-summary-title">DECODED RESULTS</span>
            <span id="decoder-checksum-badge" class="badge-mono !py-0.5 !px-1.5 text-[9px] sm:text-[10px]">FNV-1a Verified ✓</span>
          </div>

          <!-- Decoded Field List -->
          <div id="decoder-fields-list" class="space-y-2 sm:space-y-2.5">
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
