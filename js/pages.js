/**
 * pages.js
 * Single Page Website templates for Offline Validator.
 * Pure client-side, zero build step, GitHub Pages compatible.
 */
(function (global) {
  'use strict';

  /* -------- SVG Icons -------- */
  const icon = (path, opts = {}) => {
    const cls = opts.class || 'w-5 h-5';
    const stroke = opts.stroke || '2';
    return `<svg class="${cls}" fill="none" stroke="currentColor" stroke-width="${stroke}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${path}"/></svg>`;
  };

  const ICO = {
    arrow:     'M13 7l5 5m0 0l-5 5m5-5H6',
    check:     'M5 13l4 4L19 7',
    x:         'M6 18L18 6M6 6l12 12',
    spark:     'M13 10V3L4 14h7v7l9-11h-7z',
    lock:      'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    speed:     'M13 10V3L4 14h7v7l9-11h-7z',
    shield:    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    cpu:       'M9 3v2m0 14v2m6-18v2m0 14v2m3-10h2M3 12h2m12.364-5.364l1.414 1.414M4.222 19.778l1.414-1.414m12.728 0l1.414 1.414M4.222 4.222l1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z',
    layers:    'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2m10-6V3a1 1 0 00-1-1H9a1 1 0 00-1 1v2',
    key:       'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    globe:     'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    code:      'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    inbox:     'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
    bolt:      'M13 10V3L4 14h7v7l9-11h-7z',
    info:      'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    copy:      'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
    refresh:   'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    upload:    'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
    download:  'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
    cube:      'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    history:   'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    eye:       'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    trash:     'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3',
    search:    'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  };

  /* ============================================================
     EXAMPLES PER VALIDATOR
     ============================================================ */
  function examplesFor(slug) {
    const EX = {
      email:      ['user@example.com', 'admin@github.io', 'team.leads+alpha@company.org'],
      phone:      ['+91 98765 43210', '+1 415 555 0132', '9876543210'],
      url:        ['https://example.com', 'https://github.com/soumik183', 'ftp://files.example.org/archive.zip'],
      password:   ['Sup3r$ecurePass!42', 'Hunter2!', 'weakpass'],
      username:   ['alice_01', 'bob-the-builder', 'dev_specialist'],
      ipv4:       ['192.168.1.1', '10.0.0.42', '8.8.8.8'],
      ipv6:       ['2001:db8::1', 'fe80::1', '::1'],
      date:       ['2026-03-09', '2026-12-31T23:59:59Z', 'July 4, 2026'],
      color:      ['#6366f1', 'rgb(99, 102, 241)', 'tomato'],
      hex:        ['0x48656c6c6f', 'deadbeef', '0xFF00AA'],
      creditCard: ['4111 1111 1111 1111', '5500 0000 0000 0004', '378282246310005'],
      json:       ['{"name": "Alice", "role": "admin"}', '[1, 2, 3, 4]', '{"valid": true}'],
      base64:     ['SGVsbG8gV29ybGQ=', 'T2ZmbGluZSBWYWxpZGF0b3I='],
      uuid:       ['550e8400-e29b-41d4-a716-446655440000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'],
      hash:       ['5d41402abc4b2a76b9719d911017c592', '2ef7bde608ce5404e97d5f042f95f89f1c232871'],
      slug:       ['offline-validator-tool', 'my-awesome-post-2026', 'privacy-first'],
      semver:     ['1.2.3', '2.0.0-beta.1', '1.0.0+20260309'],
      number:     ['42', '3.14159', '-100'],
    };
    return EX[slug] || [];
  }

  /* ============================================================
     SINGLE PAGE COMPOSITOR
     ============================================================ */
  function singlePage() {
    const validators = Object.entries(global.OVValidators || {})
      .filter(([k]) => !['range', 'regex', '_internal'].includes(k));

    const SCHEMA = (global.OVHash && global.OVHash.SCHEMA) || [
      { key: 'entity',  label: 'Entity / Device ID', hint: 'user-9821, laptop-x9', required: true,  kind: 'string' },
      { key: 'product', label: 'Product ID',        hint: 'offline-validator, my-saas-app', required: true,  kind: 'string' },
      { key: 'version', label: 'Version',           hint: '1, 2, 42 — numeric',   required: true,  kind: 'uint'   },
      { key: 'issued',  label: 'Issued (unix time)', hint: '1717353600 (seconds)',  required: true,  kind: 'uint'   },
      { key: 'expires', label: 'Expiry (optional)', hint: '1750000000',            required: false, kind: 'uint'   },
      { key: 'plan',    label: 'Plan / Role',       hint: 'pro, enterprise, admin', required: false, kind: 'string' },
      { key: 'flags',   label: 'Feature flags',     hint: 'api,export,beta',       required: false, kind: 'flags'  },
      { key: 'serial',  label: 'Serial / License ID',hint: 'LIC-9821-XK4Q',        required: true,  kind: 'string' },
    ];

    return `
    <!-- ==================== HERO / OVERVIEW ==================== -->
    <section id="overview" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-20 sm:pb-20">
      <div class="text-center max-w-4xl mx-auto">
        <!-- Live status pill -->
        <div class="inline-flex items-center gap-2 pl-1 pr-4 py-1 rounded-full text-xs font-medium border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm mb-6 fade-up">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold text-[10px] tracking-wide">OFFLINE FIRST</span>
          <span class="text-slate-300">100% In-Browser &amp; Zero Cloud Tracking</span>
        </div>

        <h1 class="font-display text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.08]">
          Validate anything<br/>
          <span class="gradient-text">without the cloud.</span>
        </h1>

        <p class="mt-6 text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Professional-grade form &amp; data validation running <strong class="text-white font-semibold">100% inside your browser</strong>.
          18+ validators, custom encrypted tokens, and persistent audit logs — zero servers, zero tracking.
        </p>

        <!-- CTAs -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#workbench" class="btn btn-primary btn-lg shadow-xl shadow-violet-500/25">
            Test in workbench
            ${icon(ICO.arrow, { class: 'w-4 h-4' })}
          </a>
          <a href="#validators" class="btn btn-secondary btn-lg">
            ${icon(ICO.layers, { class: 'w-4 h-4' })}
            Browse 18+ validators
          </a>
          <a href="#hash" class="btn btn-secondary btn-lg">
            ${icon(ICO.key, { class: 'w-4 h-4' })}
            Hash playground
          </a>
        </div>

        <!-- Trust indicators -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
          <span class="flex items-center gap-1.5">${icon(ICO.shield, { class: 'w-3.5 h-3.5 text-emerald-400' })}Zero server telemetry</span>
          <span class="flex items-center gap-1.5">${icon(ICO.speed,  { class: 'w-3.5 h-3.5 text-cyan-400' })}Microsecond execution</span>
          <span class="flex items-center gap-1.5">${icon(ICO.lock,   { class: 'w-3.5 h-3.5 text-violet-400' })}Custom hash security</span>
          <span class="flex items-center gap-1.5">${icon(ICO.globe,  { class: 'w-3.5 h-3.5 text-fuchsia-400' })}Works 100% offline</span>
        </div>
      </div>

      <!-- Live metrics strip -->
      <div class="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-5xl mx-auto">
        <div class="glass rounded-2xl p-4 sm:p-5 text-center card-lift">
          <div class="font-display text-3xl sm:text-4xl gradient-text-static stat-num">${validators.length}</div>
          <div class="mt-1.5 text-sm font-semibold text-slate-100">Live Validators</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Email, credit card, IPs, JSON…</div>
        </div>
        <div class="glass rounded-2xl p-4 sm:p-5 text-center card-lift">
          <div class="font-display text-3xl sm:text-4xl gradient-text-static stat-num">&lt; 1ms</div>
          <div class="mt-1.5 text-sm font-semibold text-slate-100">Response Speed</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Local CPU execution</div>
        </div>
        <div class="glass rounded-2xl p-4 sm:p-5 text-center card-lift">
          <div class="font-display text-3xl sm:text-4xl gradient-text-static stat-num">v1 + v2</div>
          <div class="mt-1.5 text-sm font-semibold text-slate-100">Hash Pipelines</div>
          <div class="text-[11px] text-slate-400 mt-0.5">XOR + FNV-1a checksums</div>
        </div>
        <div class="glass rounded-2xl p-4 sm:p-5 text-center card-lift">
          <div class="font-display text-3xl sm:text-4xl gradient-text-static stat-num">100%</div>
          <div class="mt-1.5 text-sm font-semibold text-slate-100">Data Privacy</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Stored only on your device</div>
        </div>
      </div>
    </section>

    <!-- ==================== FEATURES HIGHLIGHT ==================== -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="eyebrow">Engine Features</span>
        <h2 class="font-display text-2xl sm:text-4xl tracking-tight">Engineered for privacy, speed, &amp; precision</h2>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${[
          { icon: '⚡', title: 'Instant Execution', desc: 'No network round-trips. Every validation algorithm runs instantaneously in your browser memory.' },
          { icon: '🔐', title: 'Reversible Hash System', desc: 'Custom multi-layer XOR, positional byte-shift, and FNV-1a checksum pipeline for tamper-evident tokens.' },
          { icon: '🎯', title: '18 Specialized Checks', desc: 'Handcrafted validators for Email, Phone, Credit Card (Luhn check), JSON, IPv4/IPv6, Semver, UUID, and more.' },
          { icon: '📜', title: 'Encrypted Local History', desc: 'Recent validation checks are saved to encrypted localStorage. Re-run or export anytime.' },
          { icon: '🚀', title: 'True Single Page App', desc: 'Unified single-page architecture. No page reloads, smooth anchor navigation, zero GitHub Pages 404s.' },
          { icon: '🎨', title: 'Dark & Light Themes', desc: 'High-contrast glass design system with spring animations and responsive mobile ergonomics.' },
        ].map((f, i) => `
          <div class="glass glass-hover rounded-2xl p-5 relative group">
            <div class="text-2xl mb-3 transition-transform group-hover:scale-110">${f.icon}</div>
            <h3 class="font-semibold text-base text-white tracking-tight">${f.title}</h3>
            <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">${f.desc}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- ==================== INTERACTIVE WORKBENCH ==================== -->
    <section id="workbench" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <span class="eyebrow">Interactive Testing</span>
          <h2 class="font-display text-3xl sm:text-4xl tracking-tight">Validation Workbench</h2>
          <p class="text-slate-400 mt-1 text-sm">Select any validator, type or pick an example, and observe instant feedback.</p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs font-semibold text-slate-400 uppercase">Switch Check:</label>
          <select id="wb-select" class="field-input px-3 py-1.5 rounded-lg border-slate-700/60 text-sm font-medium">
            ${validators.map(([k, v]) => `<option value="${k}">${v.icon} ${v.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main testing panel -->
        <div class="lg:col-span-2 glass rounded-2xl p-6 sm:p-7 relative overflow-hidden">
          <div class="flex items-start gap-4 mb-6">
            <div id="wb-icon" class="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center text-3xl p-3 flex-shrink-0">
              ✉️
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 id="wb-title" class="font-display text-2xl tracking-tight">Email Validator</h3>
                <span id="wb-badge-cat" class="badge badge-brand text-[10px]">Network</span>
                <span id="wb-badge-sens" class="badge badge-warn text-[10px] hidden">Sensitive</span>
              </div>
              <p id="wb-desc" class="text-xs text-slate-400 leading-relaxed">Validates RFC 5322 email syntax and domain format</p>
            </div>
          </div>

          <form id="validator-form" onsubmit="return false;" novalidate>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-semibold uppercase tracking-wider text-slate-300">Input Data</label>
              <span id="input-char-count" class="text-[11px] font-mono text-slate-400">0 characters</span>
            </div>

            <div class="relative">
              <input id="v-input" type="text"
                class="field-input w-full px-4 py-3 rounded-xl border-slate-700/60 text-sm placeholder-slate-500 font-mono pr-20"
                placeholder="user@example.com" autocomplete="off" spellcheck="false" />
              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" id="toggle-visibility" class="p-1.5 text-slate-400 hover:text-slate-200 transition rounded hidden" title="Toggle visibility">
                  ${icon(ICO.eye, { class: 'w-4 h-4' })}
                </button>
                <button type="button" id="copy-result" class="p-1.5 text-slate-400 hover:text-slate-200 transition rounded" title="Copy input">
                  ${icon(ICO.copy, { class: 'w-4 h-4' })}
                </button>
              </div>
            </div>

            <!-- Password strength meter -->
            <div id="pw-meter-wrap" class="mt-3 hidden">
              <div class="strength-bar"><div id="pw-fill" class="strength-bar-fill"></div></div>
              <p id="pw-strength-text" class="text-[11px] text-slate-400 mt-1"></p>
            </div>

            <!-- Options & Action Bar -->
            <div class="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800/60">
              <div class="flex items-center gap-4 flex-wrap">
                <label class="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input type="checkbox" id="auto-check" checked class="rounded bg-slate-800 border-slate-700 text-violet-500 focus:ring-violet-500" />
                  <span>Auto-check while typing</span>
                </label>
                <label class="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input type="checkbox" id="save-history" checked class="rounded bg-slate-800 border-slate-700 text-violet-500 focus:ring-violet-500" />
                  <span>Save to audit history</span>
                </label>
              </div>
              <div class="flex items-center gap-2 ml-auto">
                <button type="button" id="clear-btn" class="btn btn-ghost btn-sm">Clear</button>
                <button type="button" id="check-btn" class="btn btn-primary btn-sm">
                  Run Check
                  ${icon(ICO.arrow, { class: 'w-3.5 h-3.5' })}
                </button>
              </div>
            </div>
          </form>

          <!-- Result Display Box -->
          <div id="result-box" class="mt-6 hidden">
            <div id="result-banner" class="rounded-xl p-4 flex items-start gap-3 border"></div>
            <div class="mt-4">
              <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Detailed Properties</div>
              <div id="result-meta" class="meta-grid"></div>
            </div>
          </div>
        </div>

        <!-- Workbench Sidebar -->
        <div class="space-y-4">
          <!-- Example chips -->
          <div class="glass rounded-2xl p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
                ${icon(ICO.spark, { class: 'w-3.5 h-3.5 text-amber-300' })}
              </div>
              <h4 class="font-semibold text-sm tracking-tight">Try Live Examples</h4>
            </div>
            <p class="text-xs text-slate-400 mb-3">Click any chip to immediately test it:</p>
            <div class="flex flex-wrap gap-1.5" id="example-chips"></div>
          </div>

          <!-- Pro tips card -->
          <div class="glass rounded-2xl p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center">
                ${icon(ICO.bolt, { class: 'w-3.5 h-3.5 text-emerald-300' })}
              </div>
              <h4 class="font-semibold text-sm tracking-tight">Keyboard &amp; Speed Tips</h4>
            </div>
            <ul class="text-xs text-slate-400 space-y-2">
              <li class="flex gap-2"><span class="text-emerald-400">▸</span>Press <kbd class="kbd">Enter</kbd> to execute check immediately</li>
              <li class="flex gap-2"><span class="text-emerald-400">▸</span>Press <kbd class="kbd">⌘K</kbd> / <kbd class="kbd">Ctrl+K</kbd> to search validators</li>
              <li class="flex gap-2"><span class="text-emerald-400">▸</span>Inputs are saved encrypted in local storage</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== ALL VALIDATORS GRID ==================== -->
    <section id="validators" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <span class="eyebrow">Complete Suite</span>
          <h2 class="font-display text-3xl sm:text-4xl tracking-tight">All 18 Validators</h2>
          <p class="text-slate-400 mt-1 text-sm">Click any card to load it in the workbench above.</p>
        </div>
        <div class="flex items-center gap-2.5 flex-wrap">
          <div class="relative">
            <input id="search" type="search" placeholder="Search validators..."
              class="field-input pl-9 pr-10 py-2 rounded-xl text-sm w-60 border-slate-700/60" />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${ICO.search}"/></svg>
            <kbd class="kbd absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex text-[10px]">⌘K</kbd>
          </div>
          <select id="filter" class="field-input px-3.5 py-2 rounded-xl text-sm border-slate-700/60">
            <option value="all">All Categories</option>
            <option value="security">Security &amp; Auth</option>
            <option value="network">Network &amp; Web</option>
            <option value="formats">Formats &amp; Encodings</option>
            <option value="text">General Text</option>
          </select>
        </div>
      </div>

      <!-- Validator Cards Grid -->
      <div id="validator-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        ${validators.map(([k, v]) => `
          <div class="validator-card glass glass-hover rounded-2xl p-5 cursor-pointer group transition-all" data-validator="${k}" data-category="${v.category || 'text'}">
            <div class="flex items-start justify-between mb-3.5">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 border border-indigo-500/30 flex items-center justify-center text-2xl transition-all group-hover:scale-105 group-hover:border-violet-500/60">
                ${v.icon}
              </div>
              <div class="flex items-center gap-1.5">
                <span class="badge badge-neutral text-[9px] uppercase">${v.category || 'text'}</span>
                ${v.sensitive ? '<span class="badge badge-warn text-[9px]">Sensitive</span>' : ''}
              </div>
            </div>
            <h3 class="font-semibold text-slate-100 text-sm tracking-tight group-hover:text-indigo-300 transition">${v.name}</h3>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">${v.help}</p>
            <div class="mt-4 pt-3.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span class="font-mono text-slate-400 text-[10px]">${k}</span>
              <span class="text-indigo-400 group-hover:text-indigo-200 font-medium flex items-center gap-1 transition">
                Test now ${icon(ICO.arrow, { class: 'w-3 h-3 transition-transform group-hover:translate-x-0.5' })}
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- ==================== HASH PLAYGROUND ==================== -->
    <section id="hash" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="eyebrow">Local Cryptography</span>
        <h2 class="font-display text-3xl sm:text-4xl tracking-tight">Custom Hash Playground</h2>
        <p class="mt-2 text-slate-400 text-sm">
          Deterministic, reversible, and tamper-evident encoding. Pipeline <span class="font-mono text-indigo-300">v1</span> for text, and <span class="font-mono text-fuchsia-300">v2</span> for structured 8-field payloads.
        </p>
      </div>

      <!-- Mode switcher -->
      <div class="flex justify-center mb-8">
        <div class="inline-flex p-1 rounded-xl border border-slate-800/60 bg-slate-900/40">
          <button id="hp-mode-text" type="button" class="hp-mode-btn px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-700/50" data-mode="text">
            ${icon(ICO.code, { class: 'w-4 h-4' })}<span class="ml-1.5">Plain text (v1)</span>
          </button>
          <button id="hp-mode-struct" type="button" class="hp-mode-btn px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition" data-mode="struct">
            ${icon(ICO.cube, { class: 'w-4 h-4' })}<span class="ml-1.5">Structured payload (v2)</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Encoder: Plain Text (v1) -->
        <div id="hp-encoder-text" class="glass rounded-2xl p-6 relative overflow-hidden">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              ${icon(ICO.lock, { class: 'w-5 h-5 text-white' })}
            </div>
            <div>
              <h3 class="font-semibold tracking-tight text-white">Encode Plain Text</h3>
              <p class="text-xs text-slate-400">Reversible XOR + byte-shift + FNV-1a checksum</p>
            </div>
          </div>

          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Raw Text</label>
          <textarea id="hp-input" rows="3" placeholder="Type or paste any text to encode…"
            class="field-input px-3.5 py-2.5 rounded-xl border-slate-700/60 text-sm font-mono resize-y"></textarea>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Salt <span class="text-slate-500 font-normal">(optional)</span></label>
              <input id="hp-salt" type="text" placeholder="auto-generated if blank"
                class="field-input px-3 py-2 rounded-lg border-slate-700/60 text-xs font-mono" />
            </div>
            <div class="flex items-end gap-2">
              <button id="hp-sample" type="button" class="btn btn-secondary btn-sm">
                ${icon(ICO.spark, { class: 'w-3.5 h-3.5' })}
                Sample
              </button>
              <button id="hp-encode-btn" type="button" class="btn btn-primary btn-sm flex-1">
                Encode
                ${icon(ICO.arrow, { class: 'w-3.5 h-3.5' })}
              </button>
            </div>
          </div>

          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mt-4 mb-1.5">Encoded Token (v1$…)</label>
          <div class="relative">
            <textarea id="hp-output" rows="3" readonly placeholder="v1$salt$checksum$payload will appear here…"
              class="code-block w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950/80 border border-slate-700/60 text-emerald-300 resize-y text-xs"></textarea>
            <button id="hp-copy" type="button" title="Copy token" class="absolute right-2 top-2 p-1.5 rounded-md text-slate-400 hover:text-white transition">
              ${icon(ICO.copy, { class: 'w-4 h-4' })}
            </button>
          </div>
        </div>

        <!-- Encoder: Structured (v2) -->
        <div id="hp-encoder-struct" class="glass rounded-2xl p-6 relative overflow-hidden hidden">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
              ${icon(ICO.cube, { class: 'w-5 h-5 text-white' })}
            </div>
            <div class="flex-1">
              <h3 class="font-semibold tracking-tight text-white">Encode Structured Payload</h3>
              <p class="text-xs text-slate-400">8-field license / entitlement schema</p>
            </div>
            <span class="badge badge-brand text-[10px]" id="hp-struct-bits">8/8 fields</span>
          </div>

          <div class="space-y-2 max-h-72 overflow-y-auto pr-1" id="hp-struct-fields">
            ${SCHEMA.map(f => `
              <div class="struct-field flex items-start gap-2" data-key="${f.key}">
                <label class="flex items-center pt-2 select-none">
                  <input type="checkbox" class="struct-included rounded bg-slate-800 border-slate-700 text-violet-500 focus:ring-violet-500" ${f.required ? 'checked disabled' : 'checked'} data-key="${f.key}" />
                </label>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5 mb-1">
                    <span class="text-[10px] font-semibold text-slate-300 uppercase">${f.label}</span>
                    ${f.required ? '<span class="badge badge-error text-[8px] !px-1 !py-0">REQ</span>' : '<span class="badge badge-neutral text-[8px] !px-1 !py-0">OPT</span>'}
                  </div>
                  <input type="text" data-key="${f.key}" data-kind="${f.kind}"
                    class="struct-input field-input px-2.5 py-1.5 rounded-lg border-slate-700/60 text-xs font-mono w-full"
                    placeholder="${f.hint}" />
                </div>
              </div>
            `).join('')}
          </div>

          <div class="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/60">
            <button id="hp-struct-generate" type="button" class="btn btn-primary btn-sm flex-1 sm:flex-none">
              ${icon(ICO.lock, { class: 'w-3.5 h-3.5' })}
              Generate Token
            </button>
            <button id="hp-struct-sample" type="button" class="btn btn-secondary btn-sm">
              ${icon(ICO.spark, { class: 'w-3.5 h-3.5' })}
              Fill Sample
            </button>
            <button id="hp-struct-download" type="button" class="btn btn-secondary btn-sm" disabled>
              ${icon(ICO.download, { class: 'w-3.5 h-3.5' })}
              Download .ovlicense
            </button>
          </div>

          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mt-3 mb-1">Generated v2 Token</label>
          <div class="relative">
            <textarea id="hp-struct-output" rows="2" readonly placeholder="ov2s$… token will appear here"
              class="code-block w-full px-3 py-2 pr-10 rounded-xl bg-slate-950/80 border border-slate-700/60 text-emerald-300 resize-y text-xs"></textarea>
            <button id="hp-struct-copy" type="button" title="Copy token" class="absolute right-2 top-2 p-1.5 rounded-md text-slate-400 hover:text-white transition">
              ${icon(ICO.copy, { class: 'w-4 h-4' })}
            </button>
          </div>
          <div class="flex items-center justify-between mt-1 text-[10px] text-slate-400">
            <span>Size: <span id="hp-struct-size" class="text-slate-300 font-mono">0 chars</span></span>
            <span id="hp-struct-checksum" class="font-mono"></span>
          </div>
        </div>

        <!-- Universal Decoder -->
        <div class="glass rounded-2xl p-6 relative overflow-hidden">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                ${icon(ICO.key, { class: 'w-5 h-5 text-white' })}
              </div>
              <div>
                <h3 class="font-semibold tracking-tight text-white">Universal Decoder</h3>
                <p class="text-xs text-slate-400">Auto-detects v1, v2, and .ovlicense</p>
              </div>
            </div>
            <label class="btn btn-secondary btn-sm cursor-pointer">
              ${icon(ICO.upload, { class: 'w-3.5 h-3.5' })}
              <span>Upload File</span>
              <input id="hp-file" type="file" accept=".ovlicense,.ovstruct,.ovhash,.json,.txt" class="hidden" />
            </label>
          </div>

          <!-- Drag and drop zone -->
          <div id="hp-drop-zone" class="drag-zone rounded-xl p-3 text-center mb-3">
            <p class="text-xs text-slate-400">Drag &amp; drop a <span class="font-mono text-indigo-300">.ovlicense</span> or token file here</p>
          </div>

          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Token or File Content</label>
          <textarea id="hp-token" rows="3" placeholder="Paste a v1$… or ov2s$… token or drop a license file…"
            class="code-block field-input px-3.5 py-2.5 rounded-xl border-slate-700/60 text-xs resize-y font-mono"></textarea>

          <div class="flex items-center justify-between flex-wrap gap-2 mt-3">
            <button id="hp-swap" type="button" class="btn btn-ghost btn-sm text-xs">
              ${icon(ICO.refresh, { class: 'w-3 h-3' })} Paste From Output
            </button>
            <button id="hp-decode-btn" type="button" class="btn btn-primary btn-sm" style="background:linear-gradient(135deg,#06b6d4,#10b981);">
              Decode Token
              ${icon(ICO.arrow, { class: 'w-3.5 h-3.5' })}
            </button>
          </div>

          <!-- Decoded Output -->
          <div id="hp-decoded-wrap" class="mt-4 hidden">
            <div id="hp-decoded-banner" class="rounded-xl p-3 flex items-center gap-2.5 border mb-3"></div>
            <div id="hp-decoded-fields" class="meta-grid"></div>
            <details class="mt-3">
              <summary class="text-[11px] text-slate-400 cursor-pointer hover:text-slate-200">View Raw Decoded Payload</summary>
              <pre id="hp-decoded-raw" class="mt-2 text-[10px] font-mono text-slate-300 bg-slate-950/60 border border-slate-800/60 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all"></pre>
            </details>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== AUDIT HISTORY ==================== -->
    <section id="history" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <span class="eyebrow">Local Storage</span>
          <h2 class="font-display text-3xl sm:text-4xl tracking-tight">Validation Audit Log</h2>
          <p class="text-slate-400 mt-1 text-sm">Review your past checks. Everything is stored locally on this machine.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="export-btn" type="button" class="btn btn-secondary btn-sm">
            ${icon(ICO.download, { class: 'w-3.5 h-3.5' })}
            Export JSON
          </button>
          <button id="clear-history" type="button" class="btn btn-ghost btn-sm text-rose-400 hover:bg-rose-500/10">
            ${icon(ICO.trash, { class: 'w-3.5 h-3.5' })}
            Clear Log
          </button>
        </div>
      </div>

      <div class="glass rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-900/40 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800/60">
              <tr>
                <th class="text-left px-5 py-3.5 font-semibold">Validator</th>
                <th class="text-left px-5 py-3.5 font-semibold">Input (Encrypted in Storage)</th>
                <th class="text-left px-5 py-3.5 font-semibold">Verdict</th>
                <th class="text-left px-5 py-3.5 font-semibold">Timestamp</th>
                <th class="text-right px-5 py-3.5 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody id="history-tbody" class="divide-y divide-slate-800/60">
              <!-- Rendered via wireHistory() -->
            </tbody>
          </table>
        </div>
        <div id="history-empty" class="p-10 text-center hidden">
          <div class="inline-flex w-12 h-12 rounded-xl bg-slate-800/60 items-center justify-center text-2xl mb-3">🗂️</div>
          <h4 class="font-semibold text-slate-200 text-sm">No validation records yet</h4>
          <p class="text-xs text-slate-400 mt-1">Run a validation in the workbench above and it will appear here.</p>
        </div>
      </div>
    </section>

    <!-- ==================== ABOUT & PRIVACY ==================== -->
    <section id="about" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
      <div class="text-center max-w-3xl mx-auto mb-10">
        <span class="eyebrow">Zero Server Architecture</span>
        <h2 class="font-display text-3xl sm:text-4xl tracking-tight">Privacy by Design</h2>
        <p class="mt-2 text-slate-300 text-sm leading-relaxed">
          Offline Validator never sends your sensitive form inputs, passwords, credit card numbers, or cryptographic tokens to any third-party server.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 gap-4 mb-10">
        <div class="glass rounded-2xl p-5">
          <div class="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-3">
            ${icon(ICO.shield, { class: 'w-5 h-5' })}
          </div>
          <h3 class="font-semibold text-white text-base">Client-Only Execution</h3>
          <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">Every regular expression, Luhn check, checksum, and codec executes entirely in your browser's JavaScript runtime.</p>
        </div>
        <div class="glass rounded-2xl p-5">
          <div class="w-9 h-9 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 flex items-center justify-center mb-3">
            ${icon(ICO.lock, { class: 'w-5 h-5' })}
          </div>
          <h3 class="font-semibold text-white text-base">Encrypted Storage</h3>
          <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">Stored items are encrypted through our XOR-shift pipeline before touching localStorage. Sensitive credentials are never stored in plaintext.</p>
        </div>
        <div class="glass rounded-2xl p-5">
          <div class="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-3">
            ${icon(ICO.globe, { class: 'w-5 h-5' })}
          </div>
          <h3 class="font-semibold text-white text-base">GitHub Pages Native</h3>
          <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">Single-page design eliminates 404 routing errors on static hosts. You can host this repository anywhere with zero configuration.</p>
        </div>
        <div class="glass rounded-2xl p-5">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3">
            ${icon(ICO.bolt, { class: 'w-5 h-5' })}
          </div>
          <h3 class="font-semibold text-white text-base">Zero Dependencies</h3>
          <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">No bundlers, no node_modules required to run. Just open index.html in any modern browser.</p>
        </div>
      </div>

      <!-- Tech Stack Badges -->
      <div class="glass rounded-2xl p-6 text-center">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Technology Stack</h4>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <span class="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">HTML5</span>
          <span class="badge bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Tailwind CSS</span>
          <span class="badge bg-amber-500/20 text-amber-300 border border-amber-500/30">Vanilla JavaScript</span>
          <span class="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Custom Hash Engine</span>
          <span class="badge bg-purple-500/20 text-purple-300 border border-purple-500/30">Encrypted localStorage</span>
          <span class="badge bg-pink-500/20 text-pink-300 border border-pink-500/30">GitHub Pages</span>
        </div>
      </div>
    </section>
    `;
  }

  /* Expose to global scope cleanly */
  global.OVPages = {
    singlePage,
    examplesFor,
    // Backward compatibility helpers
    landing: singlePage,
    dashboard: singlePage,
    validatorDetail: singlePage,
    history: singlePage,
    hashPlayground: singlePage,
    about: singlePage,
    notFound: singlePage,
    payloadTemplate: () => (global.OVHash && global.OVHash.payloadTemplate)
      ? global.OVHash.payloadTemplate()
      : { schemaVersion: 'ovstruct-v1', required: ['entity','product','version','issued','plan','serial'], optional: ['expires','flags'] },
  };
})(window);
