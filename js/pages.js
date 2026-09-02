/**
 * pages.js
 * Premium page templates using the design system from css/style.css.
 */
(function (global) {
  'use strict';

  /* -------- Icons -------- */
  const icon = (path, opts = {}) => {
    const cls = opts.class || 'w-5 h-5';
    const stroke = opts.stroke || '2';
    return `<svg class="${cls}" fill="none" stroke="currentColor" stroke-width="${stroke}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${path}"/></svg>`;
  };

  const ICO = {
    arrow:  'M13 7l5 5m0 0l-5 5m5-5H6',
    check:  'M5 13l4 4L19 7',
    x:      'M6 18L18 6M6 6l12 12',
    spark:  'M13 10V3L4 14h7v7l9-11h-7z',
    lock:   'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    speed:  'M13 10V3L4 14h7v7l9-11h-7z',
    shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    cpu:    'M9 3v2m0 14v2m6-18v2m0 14v2m3-10h2M3 12h2m12.364-5.364l1.414 1.414M4.222 19.778l1.414-1.414m12.728 0l1.414 1.414M4.222 4.222l1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z',
    layers: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2m10-6V3a1 1 0 00-1-1H9a1 1 0 00-1 1v2',
    key:    'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    zap:    'M13 10V3L4 14h7v7l9-11h-7z',
    globe:  'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    code:   'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    inbox:  'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
    bolt:   'M13 10V3L4 14h7v7l9-11h-7z',
    folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    info:   'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    copy:   'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
    refresh:'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',

    /* --- extended icons for bulk + decode pages --- */
    file:      'M9 13h6m-6 4h6m-1 5l-4 0a2 2 0 01-2-2V6a2 2 0 012-2h7.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V20a2 2 0 01-2 2h-1',
    upload:    'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
    download:  'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
    list:      'M4 6h16M4 10h16M4 14h16M4 18h16',
    'x-circle':'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    cube:      'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    tag:       'M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z',
    flag:      'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm0 0h16',
    clock:     'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    hash:      'M9 3h2m4 0h2M9 21h2m4 0h2M5 9h14M5 15h14M10 3l-1 18M15 3l-1 18',
    dice:      'M19 11h2m-2 4h2M5 11H3m2 4H3m11-7a2 2 0 11-4 0 2 2 0 014 0zM11 17a2 2 0 11-4 0 2 2 0 014 0zM17 17a2 2 0 11-4 0 2 2 0 014 0zM19 5a2 2 0 11-4 0 2 2 0 014 0z',
    calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    plus:      'M12 4v16m8-8H4',
    trash:     'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3',
    sparkle:   'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  };

  /* ============================================================
     LANDING PAGE
     ============================================================ */
  function landing() {
    const validators = Object.entries(OVValidators)
      .filter(([k]) => !['range','regex','_internal'].includes(k));

    return `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16">
      <div class="text-center max-w-4xl mx-auto">

        <!-- Announcement pill -->
        <div class="inline-flex items-center gap-2 pl-1 pr-4 py-1 rounded-full text-xs font-medium border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm mb-8 fade-up reveal">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold text-[10px] tracking-wide">NEW</span>
          <span class="text-slate-300">Hash playground now live</span>
          <a href="/hash" data-link class="text-indigo-300 hover:text-indigo-200 link-underline inline-flex items-center gap-1">Try it ${icon(ICO.arrow, { class: 'w-3 h-3' })}</a>
        </div>

        <!-- Hero headline -->
        <h1 class="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] reveal">
          Validate anything<br/>
          <span class="gradient-text">without the cloud.</span>
        </h1>

        <p class="mt-7 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto reveal">
          Professional-grade form &amp; data validation that runs <strong class="text-white font-semibold">100% in your browser</strong>.
          Email, JSON, credit cards, IPs, UUIDs and more — all local, all instant.
        </p>

        <!-- CTA -->
        <div class="mt-9 flex flex-wrap items-center justify-center gap-3 reveal">
          <a href="/dashboard" data-link class="btn btn-primary btn-xl shadow-2xl shadow-violet-500/30">
            Start validating
            ${icon(ICO.arrow, { class: 'w-4 h-4' })}
          </a>
          <a href="/hash" data-link class="btn btn-secondary btn-xl">
            ${icon(ICO.key, { class: 'w-4 h-4' })}
            Hash playground
          </a>
        </div>

        <!-- Trust line -->
        <div class="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 reveal">
          <span class="flex items-center gap-1.5">${icon(ICO.shield, { class: 'w-3.5 h-3.5 text-emerald-400' })}Zero tracking</span>
          <span class="flex items-center gap-1.5">${icon(ICO.speed,  { class: 'w-3.5 h-3.5 text-cyan-400' })}Sub-millisecond checks</span>
          <span class="flex items-center gap-1.5">${icon(ICO.lock,   { class: 'w-3.5 h-3.5 text-violet-400' })}Custom hash encryption</span>
          <span class="flex items-center gap-1.5">${icon(ICO.globe,  { class: 'w-3.5 h-3.5 text-fuchsia-400' })}Works offline</span>
        </div>
      </div>

      <!-- Stats strip -->
      <div class="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-5xl mx-auto reveal">
        ${[
          { n: validators.length, label: 'Validators', sub: 'email, json, ip…' },
          { n: '18+',             label: 'Data formats', sub: 'from UUID to semver' },
          { n: '< 1ms',           label: 'Check speed', sub: 'pure client-side' },
          { n: '100%',            label: 'Local-only', sub: 'no server calls' },
        ].map(s => `
          <div class="glass rounded-2xl p-5 text-center card-lift">
            <div class="font-display text-3xl sm:text-4xl gradient-text-static stat-num">${s.n}</div>
            <div class="mt-2 text-sm font-semibold text-slate-100">${s.label}</div>
            <div class="text-[11px] text-slate-500 mt-0.5">${s.sub}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Feature grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div class="text-center max-w-2xl mx-auto mb-12 reveal">
        <span class="eyebrow">Why Offline Validator</span>
        <h2 class="font-display text-3xl sm:text-4xl tracking-tight">Built for engineers who care about <span class="gradient-text-static">privacy &amp; speed.</span></h2>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${[
          { icon: '⚡', title: 'Instant validation',   desc: 'No network round-trips. Every check runs in microseconds on the client. Test forms as you build them.',            tone: 'indigo' },
          { icon: '🔐', title: 'Custom hash pipeline', desc: 'XOR + byte-shift + Base64 + FNV checksum. Encode, decode, and verify with a tiny but powerful crypto-style layer.', tone: 'fuchsia' },
          { icon: '🎯', title: '18 production validators', desc: 'Email, phone, URL, password strength, credit card (Luhn), JSON, base64, UUID, hash detection, color, semver, and more.', tone: 'cyan' },
          { icon: '📜', title: 'Local history',        desc: 'Every check is logged in encrypted localStorage. Search, filter, export to JSON — your data never leaves your device.',     tone: 'emerald' },
          { icon: '🛣️', title: 'SPA architecture',     desc: 'Powered by Navigo routing with GSAP-powered transitions. Feels like a native app, works like a website.',              tone: 'amber' },
          { icon: '🎨', title: 'Premium by design',    desc: 'Glass-morphism, gradient meshes, spring physics, micro-interactions, and full light/dark theming. Built for 2026.',     tone: 'rose' },
        ].map((f, i) => `
          <div class="glass glass-hover rounded-2xl p-6 relative group reveal">
            <div class="absolute top-4 right-4 text-xs font-mono text-slate-600">0${i+1}</div>
            <div class="text-3xl mb-4 transition-transform group-hover:scale-110">${f.icon}</div>
            <h3 class="font-semibold text-base text-white tracking-tight">${f.title}</h3>
            <p class="text-sm text-slate-400 mt-2 leading-relaxed">${f.desc}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Validator showcase -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div class="flex flex-wrap items-end justify-between gap-4 mb-8 reveal">
        <div>
          <span class="eyebrow">Validators</span>
          <h2 class="font-display text-3xl sm:text-4xl tracking-tight">Every check you'll ever need</h2>
          <p class="text-slate-400 mt-2 text-sm">Click any card to open the validator.</p>
        </div>
        <a href="/dashboard" data-link class="btn btn-secondary btn-md">
          View all
          ${icon(ICO.arrow, { class: 'w-3.5 h-3.5' })}
        </a>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        ${validators.slice(0, 12).map(([k, v]) => `
          <div class="validator-card glass glass-hover rounded-2xl p-5 cursor-pointer group reveal" data-validator="${k}">
            <div class="flex items-start justify-between">
              <div class="text-3xl transition-transform group-hover:scale-110">${v.icon}</div>
              ${v.sensitive ? '<span class="badge badge-warn text-[10px]">Sensitive</span>' : ''}
            </div>
            <h3 class="mt-4 font-semibold text-slate-100 text-sm tracking-tight">${v.name}</h3>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">${v.help}</p>
            <div class="mt-4 pt-4 border-t border-slate-700/40 flex items-center justify-between text-xs">
              <span class="font-mono text-slate-500 text-[10px]">${k}</span>
              <span class="text-indigo-300 group-hover:text-indigo-200 flex items-center gap-1 transition">
                Open ${icon(ICO.arrow, { class: 'w-3 h-3 transition-transform group-hover:translate-x-0.5' })}
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- CTA strip -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div class="relative overflow-hidden glass rounded-3xl p-8 sm:p-14 text-center reveal">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/10 to-amber-500/10"></div>
        <div class="absolute -top-20 -right-20 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 -left-20 w-72 h-72 bg-fuchsia-500/30 rounded-full blur-3xl"></div>
        <div class="relative">
          <span class="eyebrow">Get started in seconds</span>
          <h2 class="font-display text-3xl sm:text-5xl tracking-tight">No signup. No downloads.<br/><span class="gradient-text-static">Just open and validate.</span></h2>
          <p class="mt-5 text-slate-300 max-w-xl mx-auto">Your data stays in your browser. Nothing is sent to any server. We're committed to making the most privacy-respecting validation tool on the web.</p>
          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="/dashboard" data-link class="btn btn-primary btn-xl shadow-2xl shadow-violet-500/40">
              Launch dashboard
              ${icon(ICO.arrow, { class: 'w-4 h-4' })}
            </a>
            <a href="/about" data-link class="btn btn-secondary btn-xl">Learn more</a>
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ============================================================
     DASHBOARD
     ============================================================ */
  function dashboard() {
    const validators = Object.entries(OVValidators)
      .filter(([k]) => !['range','regex','_internal'].includes(k));
    const historyCount = (OVStore.get('history::anon', []) || []).length;

    return `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
      <!-- Page header -->
      <div class="flex flex-wrap items-end justify-between gap-4 mb-8 reveal">
        <div>
          <span class="eyebrow">Dashboard</span>
          <h1 class="font-display text-3xl sm:text-4xl tracking-tight">Validators</h1>
          <p class="text-slate-400 mt-2 text-sm">${validators.length} production-grade checks at your fingertips.</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <input id="search" type="search" placeholder="Search validators..."
              class="field-input pl-9 pr-12 py-2 rounded-lg border-slate-700/60 bg-slate-900/60 text-sm w-56" />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <kbd class="kbd absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex">⌘K</kbd>
          </div>
          <select id="filter" class="field-input px-3 py-2 rounded-lg border-slate-700/60 bg-slate-900/60 text-sm">
            <option value="all">All types</option>
            <option value="secure">Sensitive</option>
            <option value="text">Text input</option>
          </select>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 reveal">
        ${[
          { label: 'Total validators', value: validators.length,                                 tone: 'from-indigo-500 to-violet-500' },
          { label: 'Checks stored',    value: historyCount,                                      tone: 'from-fuchsia-500 to-pink-500' },
          { label: 'Sensitive',        value: validators.filter(([,v]) => v.sensitive).length,   tone: 'from-amber-500 to-orange-500' },
          { label: 'Avg. response',    value: '< 1ms',                                            tone: 'from-emerald-500 to-teal-500' },
        ].map(s => `
          <div class="glass rounded-2xl p-4 card-lift">
            <div class="text-xs text-slate-400 font-medium">${s.label}</div>
            <div class="mt-2 font-display text-2xl stat-num bg-gradient-to-br ${s.tone} bg-clip-text text-transparent">${s.value}</div>
          </div>
        `).join('')}
      </div>

      <!-- Validator grid -->
      <div id="validator-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        ${validators.map(([k, v]) => `
          <div class="validator-card glass glass-hover rounded-2xl p-5 cursor-pointer group reveal" data-validator="${k}">
            <div class="flex items-start justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 border border-indigo-500/30 flex items-center justify-center text-2xl transition-all group-hover:border-violet-500/60 group-hover:shadow-lg group-hover:shadow-violet-500/25 group-hover:scale-105">
                ${v.icon}
              </div>
              ${v.sensitive ? '<span class="badge badge-warn text-[10px]">⚠</span>' : ''}
            </div>
            <h3 class="font-semibold text-slate-100 text-sm tracking-tight">${v.name}</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">${v.help}</p>
            <div class="mt-4 pt-4 border-t border-slate-700/40 flex items-center justify-between text-xs">
              <span class="font-mono text-slate-600 text-[10px]">${k}</span>
              <span class="text-indigo-300 group-hover:text-indigo-200 flex items-center gap-1 transition">
                Open ${icon(ICO.arrow, { class: 'w-3 h-3 transition-transform group-hover:translate-x-0.5' })}
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>`;
  }

  /* ============================================================
     VALIDATOR DETAIL
     ============================================================ */
  function validatorDetail(slug) {
    const v = OVValidators[slug];
    if (!v) return notFound();

    return `
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      <a href="/dashboard" data-link class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 mb-5 transition group reveal">
        ${icon(ICO.arrow, { class: 'w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1' })}
        Back to dashboard
      </a>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main panel -->
        <div class="lg:col-span-2 glass rounded-2xl p-6 sm:p-8 reveal">
          <div class="flex items-start gap-4 mb-6">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center text-3xl">
              ${v.icon}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h1 class="font-display text-2xl tracking-tight">${v.name} validator</h1>
                ${v.sensitive ? '<span class="badge badge-warn">Sensitive</span>' : ''}
              </div>
              <p class="text-sm text-slate-400">${v.help}</p>
            </div>
          </div>

          <form id="validator-form" data-validator="${slug}" novalidate>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Input</label>
            <div class="relative">
              <input id="v-input" name="value" type="${v.sensitive ? 'password' : 'text'}"
                class="field-input w-full px-4 py-3 rounded-xl border-slate-700/60 text-sm placeholder-slate-500 font-mono pr-10"
                placeholder="${v.placeholder}" autocomplete="off" />
              <button type="button" id="copy-result" data-tip="Copy" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 opacity-0 transition" title="Copy">
                ${icon(ICO.copy, { class: 'w-4 h-4' })}
              </button>
            </div>

            ${v.hasStrength ? `
              <div class="mt-3 strength-bar"><div id="pw-fill" class="strength-bar-fill"></div></div>
              <p id="pw-strength-text" class="text-[11px] text-slate-400 mt-1.5"></p>
            ` : ''}

            <div class="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 pt-5 border-t border-slate-800/60">
              <label class="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input type="checkbox" id="auto-check" class="rounded bg-slate-800 border-slate-700 text-violet-500 focus:ring-violet-500 focus:ring-offset-0" />
                <span>Auto-validate while typing</span>
              </label>
              <label class="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input type="checkbox" id="save-history" checked class="rounded bg-slate-800 border-slate-700 text-violet-500 focus:ring-violet-500 focus:ring-offset-0" />
                <span>Save to history</span>
              </label>
              <div class="flex items-center gap-2 ml-auto">
                <button type="button" id="clear-btn" class="btn btn-ghost btn-sm">Clear</button>
                <button type="button" id="check-btn" class="btn btn-primary btn-sm">
                  Validate
                  ${icon(ICO.arrow, { class: 'w-3.5 h-3.5' })}
                </button>
              </div>
            </div>
          </form>

          <!-- Result -->
          <div id="result-box" class="mt-7 hidden">
            <div id="result-banner" class="rounded-xl p-4 sm:p-5 flex items-start gap-3 border"></div>
            <div id="result-meta" class="mt-5 meta-grid"></div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="space-y-4">
          <div class="glass rounded-2xl p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 flex items-center justify-center">
                ${icon(ICO.info, { class: 'w-3.5 h-3.5 text-indigo-300' })}
              </div>
              <h3 class="font-semibold text-sm tracking-tight">About this check</h3>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              ${v.help}. Validation runs entirely client-side. ${v.sensitive ? 'Sensitive inputs are <strong class="text-amber-300">never</strong> logged in plaintext.' : ''}
            </p>
          </div>

          <div class="glass rounded-2xl p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center">
                ${icon(ICO.bolt, { class: 'w-3.5 h-3.5 text-emerald-300' })}
              </div>
              <h3 class="font-semibold text-sm tracking-tight">Pro tips</h3>
            </div>
            <ul class="text-xs text-slate-400 space-y-2">
              <li class="flex gap-2"><span class="text-emerald-400">▸</span>Press Enter to validate</li>
              <li class="flex gap-2"><span class="text-emerald-400">▸</span>Toggle auto-check for live feedback</li>
              <li class="flex gap-2"><span class="text-emerald-400">▸</span>Past checks appear in <a href="/history" data-link class="text-indigo-300 link-underline">History</a></li>
            </ul>
          </div>

          <div class="glass rounded-2xl p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
                ${icon(ICO.spark, { class: 'w-3.5 h-3.5 text-amber-300' })}
              </div>
              <h3 class="font-semibold text-sm tracking-tight">Try examples</h3>
            </div>
            <div class="flex flex-wrap gap-1.5" id="example-chips"></div>
          </div>
        </aside>
      </div>
    </section>`;
  }

  function examplesFor(slug) {
    const EX = {
      email:      ['user@example.com', 'bad@', 'admin@github.io'],
      phone:      ['+91 98765 43210', '12345', '+1 415 555 0132'],
      url:        ['https://example.com', 'ftp://files.test/x', 'not a url'],
      password:   ['Hunter2!', 'weakpass', 'Sup3r$ecurePass!42'],
      username:   ['alice_01', 'a!', 'bob-the-builder'],
      ipv4:       ['192.168.1.1', '999.1.1.1', '10.0.0.42'],
      ipv6:       ['2001:db8::1', '::1', 'fe80::1'],
      date:       ['2026-03-09', 'now', 'not a date'],
      color:      ['#6366f1', 'rgb(99, 102, 241)', 'tomato'],
      hex:        ['48656c6c6f', '0xABCD', 'xyz'],
      creditCard: ['4111 1111 1111 1111', '4111111111111112', '378282246310005'],
      json:       ['{"a":1}', '[1,2,3]', '{broken'],
      base64:     ['SGVsbG8gV29ybGQ=', '###'],
      uuid:       ['550e8400-e29b-41d4-a716-446655440000', '123'],
      hash:       ['5d41402abc4b2a76b9719d911017c592', 'abc'],
      slug:       ['my-cool-post', 'Bad Slug', 'foo--bar'],
      semver:     ['1.2.3', '1.2.3-beta.1', 'v1.2'],
      number:     ['42', '3.14', 'NaN'],
    };
    return EX[slug] || [];
  }

  /* ============================================================
     HISTORY PAGE
     ============================================================ */
  function history() {
    const items = OVStore.get('history::anon', []) || [];

    const empty = `
      <div class="glass rounded-3xl p-12 text-center relative overflow-hidden">
        <div class="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div class="relative">
          <div class="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 items-center justify-center text-3xl mb-4">🗂️</div>
          <h3 class="font-display text-xl tracking-tight">No history yet</h3>
          <p class="text-sm text-slate-400 mt-2 max-w-md mx-auto">Run a few validations and they'll appear here. Your history is stored only in your browser.</p>
          <a href="/dashboard" data-link class="btn btn-primary btn-md mt-6">
            Browse validators
            ${icon(ICO.arrow, { class: 'w-3.5 h-3.5' })}
          </a>
        </div>
      </div>`;

    const rows = items.length === 0 ? empty : `
      <div class="glass rounded-2xl overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="font-semibold text-sm tracking-tight">Recent validations</h3>
            <p class="text-xs text-slate-500 mt-0.5">${items.length} check${items.length === 1 ? '' : 's'} stored locally</p>
          </div>
          <div class="flex items-center gap-2">
            <button id="export-btn" class="btn btn-secondary btn-sm">
              ${icon(ICO.inbox, { class: 'w-3.5 h-3.5' })}
              Export JSON
            </button>
            <button id="clear-history" class="btn btn-ghost btn-sm text-rose-400 hover:bg-rose-500/10">Clear all</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-900/40 text-slate-400 text-[10px] uppercase tracking-wider">
              <tr>
                <th class="text-left px-5 py-3 font-semibold">Validator</th>
                <th class="text-left px-5 py-3 font-semibold">Input</th>
                <th class="text-left px-5 py-3 font-semibold">Result</th>
                <th class="text-left px-5 py-3 font-semibold">When</th>
                <th class="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody id="history-tbody" class="divide-y divide-slate-800/60"></tbody>
          </table>
        </div>
      </div>`;

    return `
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
      <div class="flex flex-wrap items-end justify-between gap-4 mb-8 reveal">
        <div>
          <span class="eyebrow">History</span>
          <h1 class="font-display text-3xl sm:text-4xl tracking-tight">Validation log</h1>
          <p class="text-slate-400 mt-2 text-sm">Your recent validation checks — stored only in your browser.</p>
        </div>
        <div class="text-xs text-slate-500 flex items-center gap-1.5">
          ${icon(ICO.lock, { class: 'w-3.5 h-3.5' })}
          Encrypted with custom hash
        </div>
      </div>
      ${rows}
    </section>`;
  }

  /* ============================================================
     HASH PLAYGROUND
     ============================================================ */
  function hashPlayground() {
    // Pull schema from OVHash (fallback to a static list)
    const SCHEMA = (global.OVHash && global.OVHash.SCHEMA) || global.OVPages.payloadTemplate();
    return `
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
      <div class="text-center max-w-2xl mx-auto mb-10 reveal">
        <span class="eyebrow">Hash Playground</span>
        <h1 class="font-display text-4xl sm:text-5xl tracking-tight">
          <span class="gradient-text">Encode &amp; decode</span> anything.
        </h1>
        <p class="mt-4 text-slate-400">
          Two pipelines: <span class="font-mono text-indigo-300">v1</span> for plain text, and
          <span class="font-mono text-fuchsia-300">v2</span> for structured 8-field payloads.
          Both are deterministic, reversible, and tamper-evident.
        </p>
      </div>

      <!-- Mode switcher -->
      <div class="flex justify-center mb-8 reveal">
        <div class="inline-flex p-1 rounded-xl border border-slate-800/60 bg-slate-900/40">
          <button id="hp-mode-text" type="button" class="hp-mode-btn px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-700/50" data-mode="text">
            ${icon(ICO.code, { class: 'w-4 h-4' })}<span class="ml-1.5">Plain text (v1)</span>
          </button>
          <button id="hp-mode-struct" type="button" class="hp-mode-btn px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition" data-mode="struct">
            ${icon(ICO.cube, { class: 'w-4 h-4' })}<span class="ml-1.5">Structured payload (v2)</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- ===== ENCODER — TEXT ===== -->
        <div id="hp-encoder-text" class="glass rounded-2xl p-6 relative overflow-hidden reveal">
          <div class="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div class="relative">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                ${icon(ICO.lock, { class: 'w-5 h-5 text-white' })}
              </div>
              <div>
                <h2 class="font-semibold tracking-tight">Encode text</h2>
                <p class="text-xs text-slate-400">Plain text → v1 token</p>
              </div>
            </div>

            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Plain text</label>
            <textarea id="hp-input" rows="4" placeholder="Type or paste anything to encode…"
              class="field-input px-4 py-3 rounded-xl border-slate-700/60 text-sm placeholder-slate-500 font-mono resize-y"></textarea>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Salt <span class="text-slate-500 font-normal normal-case">(optional)</span></label>
                <input id="hp-salt" type="text" placeholder="auto-generate if empty"
                  class="field-input px-3.5 py-2.5 rounded-xl border-slate-700/60 text-sm placeholder-slate-500 font-mono" />
              </div>
              <div class="flex items-end gap-2">
                <button id="hp-sample" type="button" class="btn btn-secondary btn-md">
                  ${icon(ICO.spark, { class: 'w-3.5 h-3.5' })}
                  Sample
                </button>
                <button id="hp-encode-btn" type="button" class="btn btn-primary btn-md flex-1">
                  Encode
                  ${icon(ICO.arrow, { class: 'w-3.5 h-3.5' })}
                </button>
              </div>
            </div>

            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mt-5 mb-2">Encoded token</label>
            <div class="relative">
              <textarea id="hp-output" rows="3" readonly placeholder="Encoded output will appear here…"
                class="code-block w-full px-4 py-3 pr-10 rounded-xl bg-slate-950/80 border border-slate-700/60 text-emerald-300 resize-y"></textarea>
              <button id="hp-copy" type="button" data-tip="Copy token" class="absolute right-2 top-2 p-1.5 rounded-md text-slate-500 hover:text-slate-100 hover:bg-slate-800 transition">
                ${icon(ICO.copy, { class: 'w-4 h-4' })}
              </button>
            </div>
          </div>
        </div>

        <!-- ===== ENCODER — STRUCTURED ===== -->
        <div id="hp-encoder-struct" class="glass rounded-2xl p-6 relative overflow-hidden reveal hidden">
          <div class="absolute -top-12 -right-12 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl"></div>
          <div class="relative">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                ${icon(ICO.cube, { class: 'w-5 h-5 text-white' })}
              </div>
              <div class="flex-1">
                <h2 class="font-semibold tracking-tight">Encode payload</h2>
                <p class="text-xs text-slate-400">8-field object → compact v2 token</p>
              </div>
              <span class="badge badge-brand text-[10px]" id="hp-struct-bits">8/8 fields</span>
            </div>

            <div class="space-y-2.5" id="hp-struct-fields">
              ${SCHEMA.map(f => `
                <div class="struct-field flex items-start gap-2.5" data-key="${f.key}">
                  <label class="flex items-center gap-1.5 pt-2 select-none">
                    <input type="checkbox" class="struct-included rounded bg-slate-800 border-slate-700 text-violet-500 focus:ring-violet-500 focus:ring-offset-0" ${f.required ? 'checked disabled' : 'checked'} data-key="${f.key}" />
                  </label>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 mb-1">
                      <label class="text-[11px] font-semibold text-slate-300 tracking-wide uppercase">${f.label}</label>
                      ${f.required ? '<span class="badge badge-error text-[9px] !px-1.5 !py-0">REQ</span>' : '<span class="badge badge-neutral text-[9px] !px-1.5 !py-0">OPT</span>'}
                      <span class="text-[10px] text-slate-500 ml-auto font-mono">${f.kind}</span>
                    </div>
                    <input type="text" data-key="${f.key}" data-kind="${f.kind}"
                      class="struct-input field-input px-3 py-1.5 rounded-lg border-slate-700/60 text-xs placeholder-slate-600 font-mono w-full"
                      placeholder="${f.hint}" />
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-800/60">
              <button id="hp-struct-generate" type="button" class="btn btn-primary btn-md flex-1 sm:flex-none">
                ${icon(ICO.lock, { class: 'w-3.5 h-3.5' })}
                Generate token
              </button>
              <button id="hp-struct-sample" type="button" class="btn btn-secondary btn-sm">
                ${icon(ICO.spark, { class: 'w-3.5 h-3.5' })}
                Sample
              </button>
              <button id="hp-struct-download" type="button" class="btn btn-secondary btn-sm" disabled>
                ${icon(ICO.download, { class: 'w-3.5 h-3.5' })}
                Download .ovlicense
              </button>
            </div>

            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mt-5 mb-2">Generated token</label>
            <div class="relative">
              <textarea id="hp-struct-output" rows="2" readonly placeholder="ov2s$… will appear here"
                class="code-block w-full px-4 py-3 pr-10 rounded-xl bg-slate-950/80 border border-slate-700/60 text-emerald-300 resize-y text-xs"></textarea>
              <button id="hp-struct-copy" type="button" data-tip="Copy token" class="absolute right-2 top-2 p-1.5 rounded-md text-slate-500 hover:text-slate-100 hover:bg-slate-800 transition">
                ${icon(ICO.copy, { class: 'w-4 h-4' })}
              </button>
            </div>
            <div class="flex items-center justify-between mt-2 text-[10px] text-slate-500">
              <span>Token size: <span id="hp-struct-size" class="text-slate-300 font-mono">0 chars</span></span>
              <span id="hp-struct-checksum" class="font-mono"></span>
            </div>
          </div>
        </div>

        <!-- ===== DECODER ===== -->
        <div class="glass rounded-2xl p-6 relative overflow-hidden reveal">
          <div class="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div class="relative">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                ${icon(ICO.key, { class: 'w-5 h-5 text-white' })}
              </div>
              <div class="flex-1">
                <h2 class="font-semibold tracking-tight">Decode</h2>
                <p class="text-xs text-slate-400">Auto-detects v1, v2, or .ovlicense file</p>
              </div>
              <label class="btn btn-secondary btn-sm cursor-pointer">
                ${icon(ICO.upload, { class: 'w-3.5 h-3.5' })}
                <span>Upload file</span>
                <input id="hp-file" type="file" accept=".ovlicense,.json,.txt" class="hidden" />
              </label>
            </div>

            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">Token or .ovlicense</label>
            <textarea id="hp-token" rows="4" placeholder="Paste a v1$… or ov2s$… token, or drop a .ovlicense file"
              class="code-block field-input px-4 py-3 rounded-xl border-slate-700/60 text-sm placeholder-slate-500 resize-y"></textarea>

            <div class="flex items-center justify-between flex-wrap gap-2 mt-4">
              <div class="flex items-center gap-2">
                <label class="text-[11px] text-slate-400 uppercase tracking-wider">Flag names</label>
                <input id="hp-flagnames" type="text" placeholder="api,export,beta,admin,support"
                  class="field-input px-2.5 py-1 rounded-md text-[11px] font-mono w-56" />
              </div>
              <div class="flex items-center gap-2">
                <button id="hp-swap" type="button" class="btn btn-ghost btn-sm">${icon(ICO.refresh, { class: 'w-3.5 h-3.5' })} From output</button>
                <button id="hp-decode-btn" type="button" class="btn btn-primary btn-md" style="background:linear-gradient(135deg,#06b6d4,#10b981);">
                  Decode
                  ${icon(ICO.arrow, { class: 'w-3.5 h-3.5' })}
                </button>
              </div>
            </div>

            <!-- Decoded result panel -->
            <div id="hp-decoded-wrap" class="mt-5 hidden">
              <div id="hp-decoded-banner" class="rounded-xl p-3.5 flex items-center gap-2.5 border mb-3"></div>
              <div id="hp-decoded-fields" class="meta-grid"></div>
              <details class="mt-3">
                <summary class="text-[11px] text-slate-400 cursor-pointer hover:text-slate-200">Show raw JSON</summary>
                <pre id="hp-decoded-raw" class="mt-2 text-[11px] font-mono text-slate-300 bg-slate-950/60 border border-slate-800/60 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all"></pre>
              </details>
            </div>
          </div>
        </div>
      </div>

      <!-- Pipeline -->
      <div class="mt-10 glass rounded-2xl p-6 sm:p-8 reveal">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/30 flex items-center justify-center">
            ${icon(ICO.layers, { class: 'w-4 h-4 text-violet-300' })}
          </div>
          <div>
            <h2 class="font-semibold tracking-tight">How the hash system works</h2>
            <p class="text-xs text-slate-400">Two pipelines — pick the one that fits your payload</p>
          </div>
        </div>
        <div class="grid sm:grid-cols-2 gap-5">
          <!-- v1 -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="badge badge-info text-[10px]">v1</span>
              <span class="text-sm font-semibold text-slate-200">Plain text pipeline</span>
            </div>
            <div class="grid grid-cols-5 gap-2">
              ${[
                { e: '📝', t: 'UTF-8',     c: 'from-indigo-500/20  to-indigo-500/5  border-indigo-500/30' },
                { e: '🔑', t: 'XOR',       c: 'from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/30' },
                { e: '🔄', t: 'Byte-shift', c: 'from-amber-500/20   to-amber-500/5   border-amber-500/30' },
                { e: '🧮', t: 'FNV-1a',    c: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30' },
                { e: '📦', t: 'Base64',    c: 'from-cyan-500/20    to-cyan-500/5    border-cyan-500/30' },
              ].map((s, i, arr) => `
                <div class="bg-gradient-to-br ${s.c} border rounded-lg p-2 text-center">
                  <div class="text-base">${s.e}</div>
                  <p class="text-[9px] font-semibold text-white mt-0.5">${s.t}</p>
                </div>
              `).join('')}
            </div>
          </div>
          <!-- v2 -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="badge badge-brand text-[10px]">v2</span>
              <span class="text-sm font-semibold text-slate-200">Structured payload pipeline</span>
            </div>
            <div class="grid grid-cols-5 gap-2">
              ${[
                { e: '📦', t: 'Pack',     c: 'from-indigo-500/20  to-indigo-500/5  border-indigo-500/30' },
                { e: '🗺️', t: 'Bitmask',   c: 'from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/30' },
                { e: '🔑', t: 'XOR',       c: 'from-amber-500/20   to-amber-500/5   border-amber-500/30' },
                { e: '🧮', t: 'FNV-1a',    c: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30' },
                { e: '📤', t: 'URL-B64',   c: 'from-cyan-500/20    to-cyan-500/5    border-cyan-500/30' },
              ].map(s => `
                <div class="bg-gradient-to-br ${s.c} border rounded-lg p-2 text-center">
                  <div class="text-base">${s.e}</div>
                  <p class="text-[9px] font-semibold text-white mt-0.5">${s.t}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ============================================================
     ABOUT PAGE
     ============================================================ */
  function about() {
    const tech = [
      { name: 'HTML5',          color: 'from-orange-500 to-red-500' },
      { name: 'Tailwind CSS',   color: 'from-cyan-500 to-blue-500' },
      { name: 'Vanilla JS',     color: 'from-yellow-500 to-amber-500' },
      { name: 'Navigo',         color: 'from-violet-500 to-purple-500' },
      { name: 'GSAP',           color: 'from-emerald-500 to-teal-500' },
      { name: 'Axios',          color: 'from-indigo-500 to-blue-500' },
      { name: 'localStorage',   color: 'from-slate-500 to-slate-700' },
      { name: 'Custom Hash',    color: 'from-pink-500 to-rose-500' },
    ];

    return `
    <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
      <div class="text-center max-w-3xl mx-auto mb-12 reveal">
        <span class="eyebrow">About</span>
        <h1 class="font-display text-4xl sm:text-5xl tracking-tight">
          A privacy-first <span class="gradient-text-static">validation platform.</span>
        </h1>
        <p class="mt-5 text-lg text-slate-300 leading-relaxed">
          Built with HTML, Tailwind, vanilla JavaScript. Routing via Navigo, animations via GSAP,
          and an optional online-fetch layer via Axios. Every byte stays in your browser.
        </p>
      </div>

      <!-- Pillars -->
      <div class="grid sm:grid-cols-2 gap-5 mb-12">
        ${[
          {
            icon: ICO.layers, tone: 'indigo',
            title: 'Custom hash pipeline',
            body: 'Strings are encoded with a multi-layer pipeline: UTF-8 → rotating XOR key stream → positional byte-shift → FNV checksum → Base64. Fully reversible via the <a href="/hash" data-link class="text-indigo-300 link-underline">Hash playground</a> — encode and decode any string with an optional salt, plus <code class="text-indigo-300 font-mono text-xs">verify()</code> for constant-time compare.',
          },
          {
            icon: ICO.globe, tone: 'fuchsia',
            title: 'SPA architecture',
            body: 'Routing is handled by Navigo (a tiny hash router), animations by GSAP with spring physics, and optional online checks via Axios. No build step, no bundler, no dependencies — just a folder of HTML, CSS and JS you can host anywhere.',
          },
          {
            icon: ICO.cpu, tone: 'cyan',
            title: 'Production validators',
            body: '18 hand-rolled validators covering email, phone, URL, password strength (zxcvbn-style heuristic), credit card (Luhn check + brand detection), JSON, IPv4/IPv6, date, color, hex, base64, UUID, hash fingerprint, slug, semver, and number range.',
          },
          {
            icon: ICO.shield, tone: 'emerald',
            title: 'Privacy by default',
            body: 'Zero server calls by default. All checks run on the client. localStorage is encrypted via our custom hash. No analytics, no telemetry, no tracking pixels. The Axios layer is included only as a utility — it is never invoked without explicit user action.',
          },
        ].map(p => `
          <div class="glass glass-hover rounded-2xl p-6 sm:p-7 reveal">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-${p.tone}-500/30 to-${p.tone}-500/10 border border-${p.tone}-500/30 flex items-center justify-center mb-4">
              ${icon(p.icon, { class: 'w-5 h-5 text-' + p.tone + '-300' })}
            </div>
            <h3 class="font-semibold text-lg tracking-tight">${p.title}</h3>
            <p class="text-sm text-slate-400 mt-2 leading-relaxed">${p.body}</p>
          </div>
        `).join('')}
      </div>

      <!-- Tech stack -->
      <div class="glass rounded-2xl p-6 sm:p-8 text-center reveal">
        <h2 class="font-display text-xl tracking-tight mb-5">Built with</h2>
        <div class="flex flex-wrap items-center justify-center gap-2">
          ${tech.map(t => `
            <span class="badge text-xs font-semibold bg-gradient-to-r ${t.color} text-white border-0 px-3 py-1.5">${t.name}</span>
          `).join('')}
        </div>
        <p class="text-xs text-slate-500 mt-6">© ${new Date().getFullYear()} Offline Validator. Crafted with precision for engineers who care.</p>
      </div>
    </section>`;
  }

  function notFound() {
    return `
    <section class="min-h-[60vh] flex items-center justify-center px-4">
      <div class="text-center max-w-md reveal">
        <div class="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 items-center justify-center text-5xl mb-5">🤷</div>
        <h1 class="font-display text-4xl tracking-tight">Page not found</h1>
        <p class="text-slate-400 mt-3">The page you're looking for doesn't exist or has been moved.</p>
        <a href="/" data-link class="btn btn-primary btn-md mt-6">
          ${icon(ICO.refresh, { class: 'w-4 h-4' })}
          Go home
        </a>
      </div>
    </section>`;
  }

  global.OVPages = {
    landing, dashboard, validatorDetail, history, hashPlayground, about, notFound,
    examplesFor,
    bulkPage, fileDecodePage,
    payloadTemplate: () => (global.OVHash && global.OVHash.payloadTemplate)
      ? global.OVHash.payloadTemplate()
      : { schemaVersion: 'ovstruct-v1', required: ['entity','product','version','issued','plan','serial'], optional: ['expires','flags'] },
  };
})(window);
