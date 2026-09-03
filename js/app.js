/**
 * app.js
 * Modern 2026 Single-Page Website Controller for Offline Validator.
 * Handles state, interactive workbench, live validator grid,
 * hash playground, audit history, theme switching, and in-page navigation.
 * 100% Client-Side & GitHub Pages Native.
 */
(function () {
  'use strict';

  // Core DOM Elements
  const $app = document.getElementById('app');
  const $navLinks = document.querySelectorAll('#nav-links .nav-link');
  const $mobileLinks = document.querySelectorAll('#mobile-menu .nav-link');
  const $mobileBtn = document.getElementById('mobile-menu-btn');
  const $mobileMenu = document.getElementById('mobile-menu');
  const $onlineStatus = document.getElementById('online-status');
  const $onlineText = document.getElementById('online-status-text');
  const $onlineStatusMobile = document.getElementById('online-status-mobile');
  const $onlineTextMobile = document.getElementById('online-status-text-mobile');
  const $themeToggle = document.getElementById('theme-toggle');

  let currentSlug = 'email';
  let activeWorkbenchRunner = null;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    // 1. Theme initialization
    initTheme();
    setupThemeToggle();

    // 2. Render modern single-page experience
    if (window.OVPages && typeof window.OVPages.singlePage === 'function') {
      $app.innerHTML = window.OVPages.singlePage();
    }

    // 3. Setup system services
    setupOnlineStatus();
    setupMobileMenu();
    setupToast();
    setupInPageNav();
    setupScrollSpy();
    setupKeyboardShortcuts();

    // 4. Wire interactive modules
    wireWorkbench();
    wireValidatorGrid();
    wireHashPlayground();
    wireHistory();

    // 5. Initial hash handling
    if (window.location.hash) {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  /* ============================================================
     THEME (Obsidian Dark / Crisp Light)
     ============================================================ */
  function initTheme() {
    try {
      const saved = localStorage.getItem('ov-theme');
      if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    } catch (_) {}
  }

  function setupThemeToggle() {
    if (!$themeToggle) return;
    $themeToggle.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const next = isLight ? 'dark' : 'light';
      if (next === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      try { localStorage.setItem('ov-theme', next); } catch (_) {}
      toast('info', `${next === 'light' ? '☀️' : '🌙'} ${next[0].toUpperCase() + next.slice(1)} Mode`, 'Theme preference saved.');
    });
  }

  /* ============================================================
     ONLINE STATUS DETECTOR
     ============================================================ */
  function setupOnlineStatus() {
    const update = () => {
      const online = navigator.onLine;
      const setOne = ($el, $txt) => {
        if (!$el) return;
        $el.classList.toggle('online', online);
        $el.classList.toggle('offline', !online);
        if ($txt) $txt.textContent = online ? 'Online' : 'Offline';
      };
      setOne($onlineStatus, $onlineText);
      setOne($onlineStatusMobile, $onlineTextMobile);
    };
    window.addEventListener('online',  update);
    window.addEventListener('offline', update);
    update();
  }

  /* ============================================================
     RESPONSIVE MOBILE DRAWER MENU
     ============================================================ */
  function setupMobileMenu() {
    if (!$mobileBtn || !$mobileMenu) return;
    $mobileBtn.addEventListener('click', () => {
      $mobileMenu.classList.toggle('hidden');
    });
  }

  /* ============================================================
     IN-PAGE NAVIGATION & SMOOTH SCROLLING
     ============================================================ */
  function setupInPageNav() {
    document.body.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        if (history.pushState) history.pushState(null, '', hash);
        if ($mobileMenu) $mobileMenu.classList.add('hidden');
      }
    });
  }

  function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          setActiveNav(id);
        }
      });
    }, { rootMargin: '-25% 0px -65% 0px', threshold: 0.1 });

    sections.forEach(s => observer.observe(s));
  }

  function setActiveNav(id) {
    $navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    $mobileLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  }

  /* ============================================================
     KEYBOARD SHORTCUTS
     ============================================================ */
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      // Cmd/Ctrl+K — focus validator search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const s = document.getElementById('search');
        if (s) {
          s.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => { s.focus(); s.select(); }, 200);
        }
      }

      // Quick jumps
      if (e.key === 'g') {
        document.addEventListener('keydown', (e2) => {
          const map = {
            h: '#overview',
            v: '#validators',
            w: '#workbench',
            c: '#hash',
            H: '#history',
            a: '#about',
          };
          if (map[e2.key]) {
            const target = document.querySelector(map[e2.key]);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }
        }, { once: true });
      }

      if (e.key === 'Escape') {
        if ($mobileMenu) $mobileMenu.classList.add('hidden');
      }
    });
  }

  /* ============================================================
     TOAST NOTIFICATIONS
     ============================================================ */
  function setupToast() {
    document.body.addEventListener('click', (e) => {
      if (e.target.closest('.toast-close')) {
        const t = e.target.closest('.toast');
        if (t) dismissToast(t);
      }
    });
  }

  const TOAST_CFG = {
    success: { cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',  path: 'M5 13l4 4L19 7' },
    error:   { cls: 'bg-rose-500/20 text-rose-300 border-rose-500/30',           path: 'M6 18L18 6M6 6l12 12' },
    warn:    { cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30',         path: 'M12 9v2m0 4h.01M5 19h14a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.268 16A2 2 0 005 19z' },
    info:    { cls: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',      path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  };

  function toast(kind, title, message = '') {
    const cfg = TOAST_CFG[kind] || TOAST_CFG.info;
    const node = document.createElement('div');
    node.className = 'toast pointer-events-auto px-4 py-3 rounded-xl flex items-start gap-3 min-w-[280px] max-w-sm opacity-0 translate-x-6 border shadow-xl z-50';
    node.innerHTML = `
      <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${cfg.cls}">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${cfg.path}"/></svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold leading-tight text-white">${escapeHtml(title)}</p>
        ${message ? `<p class="text-xs opacity-80 mt-0.5 leading-snug">${escapeHtml(message)}</p>` : ''}
      </div>
      <button class="toast-close flex-shrink-0 opacity-60 hover:opacity-100 transition p-1" aria-label="Close">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;
    const container = document.getElementById('toast-container');
    if (!container) return null;
    container.appendChild(node);
    requestAnimationFrame(() => {
      node.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      node.style.opacity = '1';
      node.style.transform = 'translateX(0)';
    });
    setTimeout(() => dismissToast(node), 4000);
    return node;
  }

  function dismissToast(node) {
    if (!node || !node.parentNode) return;
    node.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    node.style.opacity = '0';
    node.style.transform = 'translateX(24px)';
    setTimeout(() => node.remove(), 260);
  }

  /* ============================================================
     INTERACTIVE WORKBENCH CONTROLLER
     ============================================================ */
  function wireWorkbench() {
    const input = document.getElementById('v-input');
    const checkBtn = document.getElementById('check-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-result');
    const toggleVisBtn = document.getElementById('toggle-visibility');
    const resultBox = document.getElementById('result-box');
    const banner = document.getElementById('result-banner');
    const metaBox = document.getElementById('result-meta');
    const autoCheck = document.getElementById('auto-check');
    const saveHistory = document.getElementById('save-history');
    const charCount = document.getElementById('input-char-count');
    const wbSelect = document.getElementById('wb-select');

    const wbIcon = document.getElementById('wb-icon');
    const wbTitle = document.getElementById('wb-title');
    const wbDesc = document.getElementById('wb-desc');
    const wbBadgeCat = document.getElementById('wb-badge-cat');
    const wbBadgeSens = document.getElementById('wb-badge-sens');

    const pwMeter = document.getElementById('pw-meter-wrap');
    const pwFill = document.getElementById('pw-fill');
    const pwText = document.getElementById('pw-strength-text');
    const exHost = document.getElementById('example-chips');

    function selectValidator(slug, initialValue) {
      const v = (window.OVValidators && window.OVValidators[slug]) || window.OVValidators.email;
      currentSlug = slug;

      // Update Workbench Header
      if (wbIcon) wbIcon.textContent = v.icon || '🔎';
      if (wbTitle) wbTitle.textContent = `${v.name} Validator`;
      if (wbDesc) wbDesc.textContent = v.help || '';
      if (wbBadgeCat) wbBadgeCat.textContent = (v.category || 'text').toUpperCase();
      if (wbBadgeSens) wbBadgeSens.classList.toggle('hidden', !v.sensitive);
      if (wbSelect) wbSelect.value = slug;

      // Setup Input Field
      if (input) {
        input.placeholder = v.placeholder || '';
        input.type = v.sensitive ? 'password' : 'text';
        input.value = (initialValue !== undefined) ? initialValue : '';
        input.classList.remove('field-valid', 'field-invalid');
      }

      if (toggleVisBtn) toggleVisBtn.classList.toggle('hidden', !v.sensitive);
      if (pwMeter) pwMeter.classList.toggle('hidden', !v.hasStrength);
      if (pwFill) pwFill.style.width = '0%';
      if (pwText) pwText.textContent = '';

      // Highlight active card in validator directory
      document.querySelectorAll('#validator-grid .validator-card').forEach(card => {
        card.classList.toggle('active', card.dataset.validator === slug);
      });

      // Populate Live Example Chips
      if (exHost && window.OVPages && window.OVPages.examplesFor) {
        const examples = window.OVPages.examplesFor(slug);
        exHost.innerHTML = examples.map(e =>
          `<button type="button" class="ex-chip text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-mono border border-slate-700/80 transition hover:border-indigo-500/50">${escapeHtml(e)}</button>`
        ).join('');

        exHost.querySelectorAll('.ex-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            if (input) {
              input.value = chip.textContent;
              updateCharCount();
              run();
            }
          });
        });
      }

      updateCharCount();

      if (initialValue !== undefined && initialValue.length > 0) {
        run();
      } else {
        if (resultBox) resultBox.classList.add('hidden');
      }
    }

    function updateCharCount() {
      if (charCount && input) {
        const len = input.value.length;
        charCount.textContent = `${len} character${len === 1 ? '' : 's'}`;
      }
    }

    function run() {
      if (!input) return;
      const val = input.value;
      const v = window.OVValidators && window.OVValidators[currentSlug];
      if (!v) return;

      const res = v.fn(val);

      // Dynamic feedback border
      input.classList.toggle('field-valid', res.valid);
      input.classList.toggle('field-invalid', !res.valid);

      renderResult(res, val);

      if (saveHistory && saveHistory.checked && val.trim().length > 0) {
        saveToHistory(currentSlug, val, res);
      }

      // Handle Password Strength Gauge
      if (v.hasStrength && pwFill && pwText) {
        if (res.valid && res.meta && res.meta.score !== undefined) {
          const colors = ['#f43f5e', '#fb7185', '#f59e0b', '#fbbf24', '#10b981', '#34d399'];
          const widths = [15, 30, 50, 70, 90, 100];
          const score = Math.min(5, Math.max(0, res.meta.score));
          pwFill.style.width = widths[score] + '%';
          pwFill.style.backgroundColor = colors[score];
          pwText.textContent = `${res.meta.strength} (${score}/5 score)`;
          pwText.style.color = colors[score];
        } else if (val.length > 0) {
          pwFill.style.width = '15%';
          pwFill.style.backgroundColor = '#f43f5e';
          pwText.textContent = res.reason || 'Too weak';
          pwText.style.color = '#f43f5e';
        } else {
          pwFill.style.width = '0%';
          pwText.textContent = '';
        }
      }
    }

    function renderResult(res, val) {
      if (!resultBox || !banner || !metaBox) return;
      resultBox.classList.remove('hidden');

      banner.className = 'rounded-xl p-4 flex items-start gap-3 border ' +
        (res.valid ? 'result-ok' : 'result-fail');
      banner.innerHTML = `
        <div class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${res.valid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="${res.valid ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-base leading-tight ${res.valid ? 'text-emerald-200' : 'text-rose-200'}">${res.valid ? 'Valid Check Passed' : 'Validation Failed'}</p>
          <p class="text-xs mt-1 leading-snug ${res.valid ? 'text-emerald-300/90' : 'text-rose-300/90'}">${res.reason || (res.valid ? 'Input satisfies all syntactic and semantic criteria.' : 'Input does not match required format.')}</p>
        </div>
        <span class="badge ${res.valid ? 'badge-success' : 'badge-error'} self-start">${res.valid ? 'PASS' : 'FAIL'}</span>
      `;

      // Build metadata property chips
      const items = [
        ['Input Length', `${val.length} characters`],
        ['Validator Target', currentSlug],
      ];

      if (res.meta && typeof res.meta === 'object') {
        Object.entries(res.meta).forEach(([k, v]) => {
          items.push([k.replace(/([A-Z])/g, ' $1').toLowerCase(), String(v)]);
        });
      }

      if (window.OVHash && typeof window.OVHash.encode === 'function' && val.length > 0) {
        try {
          const token = window.OVHash.encode(val);
          const parts = token.split('$');
          items.push(['Checksum Fingerprint', `${parts[0]}$…${(parts[parts.length-1] || '').slice(-8)}`]);
        } catch (_) {}
      }

      metaBox.innerHTML = items.map(([k, v]) => `
        <div class="meta-item">
          <span class="k">${escapeHtml(k)}</span>
          <span class="v">${escapeHtml(v)}</span>
        </div>
      `).join('');
    }

    function saveToHistory(slug, val, res) {
      if (!val || !window.OVStore) return;
      const key = 'history::anon';
      const arr = window.OVStore.get(key, []) || [];
      arr.unshift({
        slug,
        input: (slug === 'password' || slug === 'creditCard') ? '••••••••' : val.slice(0, 100),
        valid: res.valid,
        reason: res.reason || null,
        ts: Date.now(),
      });
      window.OVStore.set(key, arr.slice(0, 150));
      wireHistory();
    }

    // Event Listeners
    checkBtn?.addEventListener('click', run);

    clearBtn?.addEventListener('click', () => {
      if (input) {
        input.value = '';
        input.classList.remove('field-valid', 'field-invalid');
      }
      if (resultBox) resultBox.classList.add('hidden');
      if (pwFill) pwFill.style.width = '0%';
      if (pwText) pwText.textContent = '';
      updateCharCount();
    });

    input?.addEventListener('input', () => {
      updateCharCount();
      input.classList.remove('field-valid', 'field-invalid');
      if (autoCheck && autoCheck.checked) {
        run();
      }
    });

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        run();
      }
    });

    copyBtn?.addEventListener('click', async () => {
      if (!input || !input.value) return;
      try {
        await navigator.clipboard.writeText(input.value);
        toast('success', 'Copied to Clipboard', input.value.slice(0, 32));
      } catch (_) {
        toast('warn', 'Copy Failed', 'Clipboard access denied.');
      }
    });

    toggleVisBtn?.addEventListener('click', () => {
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });

    wbSelect?.addEventListener('change', (e) => {
      selectValidator(e.target.value);
    });

    // Category pills click handler above the workbench
    document.querySelectorAll('.wb-cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.wb-cat-pill').forEach(p => p.classList.remove('active', 'btn-primary'));
        pill.classList.add('active', 'btn-primary');
        const cat = pill.dataset.cat;

        // Select first validator in this category
        const validators = Object.entries(window.OVValidators || {})
          .filter(([k]) => !['range', 'regex', '_internal'].includes(k));

        let match = validators.find(([k, v]) => cat === 'all' || v.category === cat || (cat === 'security' && v.sensitive));
        if (match) selectValidator(match[0]);
      });
    });

    // Initialize with default 'email'
    selectValidator('email');
    activeWorkbenchRunner = selectValidator;
  }

  /* ============================================================
     VALIDATOR DIRECTORY GRID & SEARCH FILTER
     ============================================================ */
  function wireValidatorGrid() {
    const grid = document.getElementById('validator-grid');
    const search = document.getElementById('search');
    const filter = document.getElementById('filter');
    if (!grid) return;

    // Card click selects validator in workbench and scrolls to it
    grid.querySelectorAll('.validator-card').forEach(card => {
      card.addEventListener('click', () => {
        const slug = card.dataset.validator;
        if (activeWorkbenchRunner) {
          activeWorkbenchRunner(slug);
          const wb = document.getElementById('workbench');
          if (wb) wb.scrollIntoView({ behavior: 'smooth' });
          const inp = document.getElementById('v-input');
          if (inp) setTimeout(() => inp.focus(), 300);
        }
      });
    });

    const filterCards = () => {
      const q = (search ? search.value : '').toLowerCase().trim();
      const f = filter ? filter.value : 'all';

      grid.querySelectorAll('.validator-card').forEach(card => {
        const slug = card.dataset.validator;
        const category = card.dataset.category || 'text';
        const v = window.OVValidators && window.OVValidators[slug];
        if (!v) return;

        const text = `${v.name} ${v.help} ${slug} ${category}`.toLowerCase();
        const matchesQuery = !q || text.includes(q);
        const matchesFilter = (f === 'all') ||
          (f === 'security' && (category === 'security' || v.sensitive)) ||
          (f === category);

        card.style.display = matchesQuery && matchesFilter ? '' : 'none';
      });
    };

    search?.addEventListener('input', filterCards);
    filter?.addEventListener('change', filterCards);
  }

  /* ============================================================
     HASH PLAYGROUND
     ============================================================ */
  function wireHashPlayground() {
    const modeText = document.getElementById('hp-mode-text');
    const modeStruct = document.getElementById('hp-mode-struct');
    const encText = document.getElementById('hp-encoder-text');
    const encStruct = document.getElementById('hp-encoder-struct');

    const encIn = document.getElementById('hp-input');
    const encSalt = document.getElementById('hp-salt');
    const encBtn = document.getElementById('hp-encode-btn');
    const encSample = document.getElementById('hp-sample');
    const encOut = document.getElementById('hp-output');
    const encCopy = document.getElementById('hp-copy');

    const structFields = document.getElementById('hp-struct-fields');
    const structGen = document.getElementById('hp-struct-generate');
    const structSample = document.getElementById('hp-struct-sample');
    const structDl = document.getElementById('hp-struct-download');
    const structOut = document.getElementById('hp-struct-output');
    const structCopy = document.getElementById('hp-struct-copy');
    const structSize = document.getElementById('hp-struct-size');
    const structCksum = document.getElementById('hp-struct-checksum');
    const structBits = document.getElementById('hp-struct-bits');

    const decIn = document.getElementById('hp-token');
    const decBtn = document.getElementById('hp-decode-btn');
    const swapBtn = document.getElementById('hp-swap');
    const fileIn = document.getElementById('hp-file');
    const dropZone = document.getElementById('hp-drop-zone');
    const decWrap = document.getElementById('hp-decoded-wrap');
    const decBanner = document.getElementById('hp-decoded-banner');
    const decFields = document.getElementById('hp-decoded-fields');
    const decRaw = document.getElementById('hp-decoded-raw');

    let lastLicensePayload = null;

    // Mode toggling
    modeText?.addEventListener('click', () => {
      encText?.classList.remove('hidden');
      encStruct?.classList.add('hidden');
      modeText.className = 'hp-mode-btn px-4 py-2 rounded-lg text-sm font-semibold text-white bg-slate-700/50';
      modeStruct.className = 'hp-mode-btn px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white transition';
    });

    modeStruct?.addEventListener('click', () => {
      encText?.classList.add('hidden');
      encStruct?.classList.remove('hidden');
      modeStruct.className = 'hp-mode-btn px-4 py-2 rounded-lg text-sm font-semibold text-white bg-slate-700/50';
      modeText.className = 'hp-mode-btn px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white transition';
    });

    // v1 Plain Text Encode
    function runTextEncode() {
      if (!encIn || !encOut) return;
      const text = encIn.value;
      const salt = (encSalt?.value || '').trim();
      if (!text) { encOut.value = ''; return; }

      try {
        const token = window.OVHash.encode(text, salt || undefined);
        encOut.value = token;
        toast('success', 'Token Encoded', `${token.length} chars (v1)`);
      } catch (e) {
        encOut.value = 'Error: ' + e.message;
        toast('error', 'Encoding Failed', e.message);
      }
    }

    encBtn?.addEventListener('click', runTextEncode);
    encSample?.addEventListener('click', () => {
      if (encIn) encIn.value = 'Offline Validator 2026 🔐 Privacy-First Client Validation';
      runTextEncode();
    });

    encCopy?.addEventListener('click', async () => {
      if (!encOut || !encOut.value) return;
      try {
        await navigator.clipboard.writeText(encOut.value);
        toast('success', 'Token Copied');
      } catch (_) {}
    });

    // v2 Structured Encode
    function updateStructBits() {
      if (!structFields || !structBits) return;
      let count = 0;
      structFields.querySelectorAll('.struct-field').forEach(row => {
        if (row.querySelector('.struct-included')?.checked) count++;
      });
      structBits.textContent = `${count}/8 fields`;
    }

    structFields?.querySelectorAll('.struct-included').forEach(cb => {
      cb.addEventListener('change', updateStructBits);
    });

    function runStructGenerate() {
      if (!structFields || !structOut) return;
      const obj = {};
      structFields.querySelectorAll('.struct-field').forEach(row => {
        const cb = row.querySelector('.struct-included');
        const inp = row.querySelector('.struct-input');
        const key = row.dataset.key;
        if (cb && cb.checked && inp && inp.value.trim()) {
          const val = inp.value.trim();
          if (inp.dataset.kind === 'uint') {
            obj[key] = parseInt(val, 10) || 0;
          } else if (inp.dataset.kind === 'flags') {
            obj[key] = val.split(',').map(s => s.trim()).filter(Boolean);
          } else {
            obj[key] = val;
          }
        }
      });

      const required = ['entity', 'product', 'version', 'issued', 'serial'];
      const missing = required.filter(k => obj[k] === undefined || obj[k] === '');
      if (missing.length > 0) {
        toast('warn', 'Missing Fields', missing.join(', '));
        return;
      }

      try {
        const r = window.OVHash.structEncode(obj);
        structOut.value = r.token;
        if (structSize) structSize.textContent = `${r.token.length} chars`;
        if (structCksum) structCksum.textContent = `fnv=${r.checksum}`;
        if (structDl) {
          structDl.disabled = false;
          lastLicensePayload = window.OVHash.makeLicenseFile(obj);
        }
        toast('success', 'v2 Token Generated', `${r.token.length} chars`);
      } catch (e) {
        toast('error', 'Generation Error', e.message);
      }
    }

    structGen?.addEventListener('click', runStructGenerate);

    structSample?.addEventListener('click', () => {
      const now = Math.floor(Date.now() / 1000);
      const sampleData = {
        entity: 'usr_enterprise_' + Math.floor(Math.random() * 9000 + 1000),
        product: 'offline-validator-suite',
        version: 2,
        issued: now,
        expires: now + (365 * 24 * 60 * 60),
        plan: 'enterprise',
        flags: 'api,export,audit_trail,pro',
        serial: 'LIC-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      };

      structFields?.querySelectorAll('.struct-field').forEach(row => {
        const key = row.dataset.key;
        const inp = row.querySelector('.struct-input');
        const cb = row.querySelector('.struct-included');
        if (cb && !cb.disabled) cb.checked = true;
        if (inp && sampleData[key] !== undefined) inp.value = sampleData[key];
      });

      updateStructBits();
      runStructGenerate();
    });

    structDl?.addEventListener('click', () => {
      if (!lastLicensePayload) return;
      const blob = new Blob([JSON.stringify(lastLicensePayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lastLicensePayload.payload?.serial || 'license'}.ovlicense`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('success', 'License Downloaded', a.download);
    });

    structCopy?.addEventListener('click', async () => {
      if (!structOut || !structOut.value) return;
      try {
        await navigator.clipboard.writeText(structOut.value);
        toast('success', 'Token Copied');
      } catch (_) {}
    });

    // Universal Decoder
    function runDecode() {
      if (!decIn || !decWrap) return;
      const raw = decIn.value.trim();
      if (!raw) { decWrap.classList.add('hidden'); return; }

      decWrap.classList.remove('hidden');

      // 1. JSON License file (.ovlicense or standard JSON)
      if (raw.startsWith('{')) {
        try {
          const json = JSON.parse(raw);
          if (json.token && json.payload) {
            const r = window.OVHash.structDecode(json.token);
            if (r) {
              renderDecodeResult(true, 'Verified .ovlicense File', json.payload, 'Checksum verified · Tamper-free');
              return;
            }
          }
        } catch (_) {}
        renderDecodeResult(false, 'Corrupt JSON File', null, 'Failed JSON validation or token integrity.');
        return;
      }

      // 2. Structured text headers (.ovstruct or .ovhash)
      if (raw.startsWith('OV-STRUCT') || raw.startsWith('OV-HASH')) {
        if (window.OVFileIO && typeof window.OVFileIO.parseAndDecode === 'function') {
          const pad = window.OVFileIO.parseAndDecode(raw);
          if (pad && pad.valid) {
            const isStruct = pad.header && pad.header._kind === 'ovstruct';
            renderDecodeResult(true, `Verified ${isStruct ? '.ovstruct' : '.ovhash'} File`, pad.decoded || pad.header, 'Checksum verified · Tamper-free');
            return;
          } else {
            renderDecodeResult(false, 'File Decode Failed', null, (pad && pad.errors && pad.errors.join(', ')) || 'Integrity check failed');
            return;
          }
        }
      }

      // 3. v2 structured token (ov2s$)
      if (raw.startsWith('ov2s$')) {
        const r = window.OVHash.structDecode(raw);
        if (r && r.payload) {
          renderDecodeResult(true, 'v2 Structured Payload', r.payload, `Integrity verified · ${r.checksum}`);
        } else {
          renderDecodeResult(false, 'Invalid v2 Token', null, 'Token checksum mismatch or corrupted data.');
        }
        return;
      }

      // 4. v1 plain text token (v1$)
      if (raw.startsWith('v1$')) {
        const plain = window.OVHash.decode(raw);
        if (plain !== null) {
          renderDecodeResult(true, 'v1 Plain Text Token', { decodedText: plain }, 'Checksum matched · Reversible format');
        } else {
          renderDecodeResult(false, 'Invalid v1 Token', null, 'Token checksum mismatch or corrupt payload.');
        }
        return;
      }

      renderDecodeResult(false, 'Unrecognized Format', null, 'Token must begin with v1$, ov2s$, OV-STRUCT, OV-HASH, or contain a valid JSON license.');
    }

    function renderDecodeResult(ok, title, data, subtitle) {
      if (!decBanner || !decFields || !decRaw) return;

      decBanner.className = 'rounded-xl p-3 flex items-center gap-2.5 border ' +
        (ok ? 'result-ok' : 'result-fail');
      decBanner.innerHTML = `
        <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="${ok ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm ${ok ? 'text-emerald-200' : 'text-rose-200'}">${escapeHtml(title)}</p>
          <p class="text-[11px] ${ok ? 'text-emerald-300/80' : 'text-rose-300/80'}">${escapeHtml(subtitle)}</p>
        </div>
      `;

      if (ok && data) {
        const filtered = Object.entries(data).filter(([k]) => !k.startsWith('_') && k !== 'token');
        decFields.innerHTML = filtered.map(([k, v]) => `
          <div class="meta-item">
            <span class="k">${escapeHtml(k)}</span>
            <span class="v">${escapeHtml(Array.isArray(v) ? v.join(', ') : String(v))}</span>
          </div>
        `).join('');
        decRaw.textContent = JSON.stringify(data, null, 2);
      } else {
        decFields.innerHTML = '';
        decRaw.textContent = '';
      }
    }

    decBtn?.addEventListener('click', runDecode);
    decIn?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        runDecode();
      }
    });

    swapBtn?.addEventListener('click', () => {
      const src = (structOut && structOut.value) ? structOut.value : (encOut ? encOut.value : '');
      if (src && decIn) {
        decIn.value = src;
        runDecode();
        toast('info', 'Loaded Token into Decoder');
      }
    });

    fileIn?.addEventListener('change', async () => {
      const f = fileIn.files?.[0];
      if (!f || !decIn) return;
      const text = await f.text();
      decIn.value = text;
      runDecode();
      toast('info', 'File Loaded', f.name);
    });

    // Drag and drop zone
    if (dropZone) {
      ['dragenter', 'dragover'].forEach(ev => {
        dropZone.addEventListener(ev, (e) => {
          e.preventDefault();
          dropZone.classList.add('drag-over');
        });
      });
      ['dragleave', 'drop'].forEach(ev => {
        dropZone.addEventListener(ev, (e) => {
          e.preventDefault();
          dropZone.classList.remove('drag-over');
        });
      });
      dropZone.addEventListener('drop', async (e) => {
        const f = e.dataTransfer?.files?.[0];
        if (!f || !decIn) return;
        const text = await f.text();
        decIn.value = text;
        runDecode();
        toast('info', 'File Dropped & Decoded', f.name);
      });
    }
  }

  /* ============================================================
     AUDIT TRAIL LOG (History)
     ============================================================ */
  function wireHistory() {
    const tbody = document.getElementById('history-tbody');
    const emptyState = document.getElementById('history-empty');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-history');
    if (!tbody) return;

    const items = (window.OVStore && window.OVStore.get('history::anon', [])) || [];

    if (items.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    tbody.innerHTML = items.map((it, idx) => {
      const v = (window.OVValidators && window.OVValidators[it.slug]) || { name: it.slug, icon: '🔎' };
      const when = new Date(it.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' · ' + new Date(it.ts).toLocaleDateString();
      return `
        <tr class="hover:bg-slate-900/40 transition">
          <td class="px-5 py-3.5">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sm">${v.icon || '🔎'}</span>
              <div>
                <p class="font-medium text-sm text-slate-200">${escapeHtml(v.name)}</p>
                <p class="text-[10px] text-slate-400 font-mono">${escapeHtml(it.slug)}</p>
              </div>
            </div>
          </td>
          <td class="px-5 py-3.5 font-mono text-xs text-slate-300 max-w-[240px] truncate">${escapeHtml(it.input)}</td>
          <td class="px-5 py-3.5">
            <span class="badge ${it.valid ? 'badge-success' : 'badge-error'} text-[10px]">${it.valid ? 'PASS' : 'FAIL'}</span>
          </td>
          <td class="px-5 py-3.5 text-xs text-slate-400">${when}</td>
          <td class="px-5 py-3.5 text-right">
            <button type="button" data-idx="${idx}" class="re-run btn btn-secondary btn-sm text-xs">
              Re-test
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.re-run').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = items[+btn.dataset.idx];
        if (item && activeWorkbenchRunner) {
          const inpVal = item.input === '••••••••' ? '' : item.input;
          activeWorkbenchRunner(item.slug, inpVal);
          const wb = document.getElementById('workbench');
          if (wb) wb.scrollIntoView({ behavior: 'smooth' });
          toast('info', 'Loaded into Workbench', `${item.slug}: ${inpVal || '(sensitive)'}`);
        }
      });
    });

    exportBtn?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `validation-audit-log-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('success', 'Audit Log Exported', `${items.length} records`);
    });

    clearBtn?.addEventListener('click', () => {
      if (!confirm('Clear all stored validation history?')) return;
      if (window.OVStore) window.OVStore.remove('history::anon');
      wireHistory();
      toast('info', 'Audit Log Cleared');
    });
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // Expose global controller API
  window.OVApp = {
    toast,
    refreshHistory: wireHistory,
    selectValidator: (slug, initialVal) => {
      if (activeWorkbenchRunner) activeWorkbenchRunner(slug, initialVal);
    }
  };
})();
