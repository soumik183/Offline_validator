/**
 * app.js
 * Bootstrap, routing (Navigo), animations (GSAP), event wiring.
 */
(function () {
  'use strict';

  const $app = document.getElementById('app');
  const $navLinks = document.querySelectorAll('#nav-links .nav-link');
  const $mobileLinks = document.querySelectorAll('#mobile-menu .nav-link');
  const $mobileBtn = document.getElementById('mobile-menu-btn');
  const $mobileMenu = document.getElementById('mobile-menu');
  const $onlineStatus = document.getElementById('online-status');
  const $onlineText = document.getElementById('online-status-text');
  const $onlineStatusMobile = document.getElementById('online-status-mobile');
  const $onlineTextMobile = document.getElementById('online-status-text-mobile');
  const $year = document.getElementById('year');
  const $themeToggle = document.getElementById('theme-toggle');

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    if ($year) $year.textContent = new Date().getFullYear();
    initTheme();
    setupOnlineStatus();
    setupMobileMenu();
    setupThemeToggle();
    setupToast();
    setupKeyboardShortcuts();
    setupRouter();
  }

  /* -------- Theme (dark/light) -------- */
  function initTheme() {
    try {
      const saved = localStorage.getItem('ov-theme');
      if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
    } catch (_) {}
  }
  function setupThemeToggle() {
    if (!$themeToggle) return;
    $themeToggle.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const next = isLight ? 'dark' : 'light';
      if (next === 'light') document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('ov-theme', next); } catch (_) {}
      toast('info', `${next === 'light' ? '☀️' : '🌙'} ${next[0].toUpperCase() + next.slice(1)} theme`, 'Theme preference saved.');
    });
  }

  /* -------- Online status -------- */
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

  /* -------- Mobile menu -------- */
  function setupMobileMenu() {
    if (!$mobileBtn) return;
    $mobileBtn.addEventListener('click', () => $mobileMenu.classList.toggle('hidden'));
    $mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => $mobileMenu.classList.add('hidden'))
    );
  }

  /* -------- Keyboard shortcuts (Cmd/Ctrl+K to focus search, / too) -------- */
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      // Cmd/Ctrl+K — focus dashboard search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const s = document.getElementById('search');
        if (s) { s.focus(); s.select(); }
      }
      // g then h/d/h/a — nav shortcuts
      if (e.key === 'g') {
        const next = (cb) => document.addEventListener('keydown', cb, { once: true });
        next((e2) => {
          if (e2.key === 'h') router.navigate('/');
          else if (e2.key === 'd') router.navigate('/dashboard');
          else if (e2.key === 'H') router.navigate('/history');
          else if (e2.key === 'a') router.navigate('/about');
        });
      }
    });
  }

  /* -------- Toast (self-contained, no template) -------- */
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
    info:    { cls: 'bg-violet-500/20 text-violet-300 border-violet-500/30',       path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  };

  function toast(kind, title, message = '') {
    const cfg = TOAST_CFG[kind] || TOAST_CFG.info;
    const node = document.createElement('div');
    node.className = 'toast pointer-events-auto px-4 py-3 rounded-xl flex items-start gap-3 min-w-[280px] max-w-sm opacity-0 translate-x-6 border';
    node.innerHTML = `
      <div class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border ${cfg.cls}">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${cfg.path}"/></svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold leading-tight">${escape(title)}</p>
        ${message ? `<p class="text-xs opacity-80 mt-0.5 leading-snug">${escape(message)}</p>` : ''}
      </div>
      <button class="toast-close flex-shrink-0 opacity-60 hover:opacity-100 transition" aria-label="Close">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;
    const container = document.getElementById('toast-container');
    if (!container) return null;
    container.appendChild(node);
    requestAnimationFrame(() => {
      node.style.transition = 'opacity 0.4s var(--ease-spring), transform 0.4s var(--ease-spring)';
      node.style.opacity = '1';
      node.style.transform = 'translateX(0)';
    });
    setTimeout(() => dismissToast(node), 4200);
    return node;
  }

  function dismissToast(node) {
    if (!node || !node.parentNode) return;
    node.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    node.style.opacity = '0';
    node.style.transform = 'translateX(24px)';
    setTimeout(() => node.remove(), 320);
  }

  /* -------- Reveal-on-scroll (IntersectionObserver) -------- */
  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    els.forEach(el => io.observe(el));
  }

  /* -------- Router -------- */
  const router = new Navigo('/', { hash: false });

  function setActiveLink(path) {
    $navLinks.forEach(l => {
      const r = l.getAttribute('data-route');
      l.classList.toggle('active', path === r || (r !== '/' && path.startsWith(r)));
    });
  }

  function render(html, path = location.pathname) {
    $app.innerHTML = `<div class="page-enter">${html}</div>`;
    setActiveLink(path);
    setActiveMobileLink(path);
    window.scrollTo({ top: 0, behavior: 'instant' });

    const root = $app.firstElementChild;
    if (window.gsap) {
      gsap.fromTo(root,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
          onComplete: () => root.classList.add('page-ready')
        }
      );
      gsap.to(root.querySelectorAll('.fade-up, .glass'), {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power2.out', delay: 0.08,
      });
    }
    setupReveal();
  }

  function setActiveMobileLink(path) {
    $mobileLinks.forEach(l => {
      const r = l.getAttribute('data-route');
      l.classList.toggle('active', path === r || (r && r !== '/' && path.startsWith(r)));
    });
  }

  function setupRouter() {
    router
      .on('/', () => render(OVPages.landing(), '/'))
      .on('/dashboard', () => { render(OVPages.dashboard(), '/dashboard'); wireDashboard(); })
      .on('/validator/:slug', ({ data }) => {
        render(OVPages.validatorDetail(data.slug), `/validator/${data.slug}`);
        wireValidator(data.slug);
      })
      .on('/history', () => { render(OVPages.history(), '/history'); wireHistory(); })
      .on('/hash', () => { render(OVPages.hashPlayground(), '/hash'); wireHashPlayground(); })
      .on('/bulk', () => { if (OVPages.bulkPage) { render(OVPages.bulkPage(), '/bulk'); wireBulk && wireBulk(); } else { render(OVPages.notFound(), '/bulk'); } })
      .on('/file', () => { if (OVPages.fileDecodePage) { render(OVPages.fileDecodePage(), '/file'); wireFile && wireFile(); } else { render(OVPages.notFound(), '/file'); } })
      .on('/about', () => render(OVPages.about(), '/about'))
      .notFound(() => render(OVPages.notFound(), location.pathname));

    document.body.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-link]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http')) return;
      e.preventDefault();
      router.navigate(href);
    });

    router.resolve();
  }

  /* -------- Dashboard -------- */
  function wireDashboard() {
    const grid = document.getElementById('validator-grid');
    const search = document.getElementById('search');
    const filter = document.getElementById('filter');

    grid.querySelectorAll('.validator-card').forEach(card => {
      card.addEventListener('click', () => router.navigate('/validator/' + card.dataset.validator));
    });

    search?.addEventListener('input', () => filterGrid(grid, search.value, filter.value));
    filter?.addEventListener('change', () => filterGrid(grid, search.value, filter.value));
  }

  function filterGrid(grid, q, f) {
    q = (q || '').toLowerCase();
    grid.querySelectorAll('.validator-card').forEach(card => {
      const slug = card.dataset.validator;
      const v = OVValidators[slug];
      const text = (v.name + ' ' + v.help + ' ' + slug).toLowerCase();
      const okSearch = !q || text.includes(q);
      let okFilter = true;
      if (f === 'secure') okFilter = !!v.sensitive;
      else if (f === 'text') okFilter = !v.sensitive;
      card.style.display = okSearch && okFilter ? '' : 'none';
    });
  }

  /* -------- Validator detail -------- */
  function wireValidator(slug) {
    const form = document.getElementById('validator-form');
    const input = document.getElementById('v-input');
    const btn = document.getElementById('check-btn');
    const clear = document.getElementById('clear-btn');
    const resultBox = document.getElementById('result-box');
    const banner = document.getElementById('result-banner');
    const metaBox = document.getElementById('result-meta');
    const auto = document.getElementById('auto-check');
    const save = document.getElementById('save-history');
    const copyBtn = document.getElementById('copy-result');

    const pwFill = document.getElementById('pw-fill');
    const pwText = document.getElementById('pw-strength-text');

    const examples = OVPages.examplesFor(slug);
    const exHost = document.getElementById('example-chips');
    if (exHost) {
      exHost.innerHTML = examples.map(e =>
        `<button class="ex-chip text-[11px] px-2.5 py-1 rounded-md bg-slate-800/70 hover:bg-slate-700 text-slate-300 font-mono border border-slate-700 transition hover:border-violet-500/40">${escape(e)}</button>`
      ).join('');
      exHost.querySelectorAll('.ex-chip').forEach(c => {
        c.addEventListener('click', () => { input.value = c.textContent; run(); });
      });
    }

    function run() {
      const val = input.value;
      const v = OVValidators[slug];
      const res = v.fn(val);
      renderResult(res, val);
      if (save?.checked) saveToHistory(slug, val, res);
      if (v.hasStrength && pwFill) {
        if (res.valid) {
          const palette = ['bg-rose-500','bg-rose-500','bg-amber-500','bg-yellow-500','bg-emerald-500','bg-emerald-400'];
          const widths = [10,25,45,65,85,100];
          pwFill.style.width = widths[res.meta.score] + '%';
          pwFill.className = 'strength-bar-fill ' + palette[res.meta.score];
          pwText.textContent = `Strength: ${res.meta.strength}`;
          pwText.className = 'text-[11px] mt-1.5 text-emerald-300';
        } else if (val.length) {
          pwFill.style.width = '15%';
          pwFill.className = 'strength-bar-fill bg-rose-500';
          pwText.textContent = res.reason;
          pwText.className = 'text-[11px] mt-1.5 text-rose-300';
        } else {
          pwFill.style.width = '0%';
          pwText.textContent = '';
        }
      }
    }

    function renderResult(res, val) {
      resultBox.classList.remove('hidden');
      copyBtn.classList.remove('opacity-0');

      banner.className = 'rounded-xl p-4 sm:p-5 flex items-start gap-3 border ' +
        (res.valid ? 'result-ok' : 'result-fail');
      banner.innerHTML = `
        <div class="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${res.valid ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/25 text-rose-300 border border-rose-500/40'}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="${res.valid ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold ${res.valid ? 'text-emerald-200' : 'text-rose-200'} text-base tracking-tight">${res.valid ? 'Valid' : 'Invalid'}</p>
          <p class="text-sm ${res.valid ? 'text-emerald-300/80' : 'text-rose-300/80'} mt-0.5 leading-snug">${res.reason || (res.valid ? 'Looks good! All checks passed.' : 'Failed validation')}</p>
        </div>
        <span class="badge ${res.valid ? 'badge-success' : 'badge-error'} self-start">${res.valid ? 'PASS' : 'FAIL'}</span>
      `;

      const items = [];
      items.push(['Length', val.length + ' chars']);
      if (res.meta) {
        Object.entries(res.meta).forEach(([k, v]) => items.push([k, String(v)]));
      }
      try {
        const tok = OVHash.encode(val);
        const parts = tok.split('$');
        items.push(['Fingerprint', parts[0] + '$…' + (parts[parts.length-1] || '').slice(-6)]);
      } catch (_) {}

      metaBox.innerHTML = items.map(([k, v]) => `
        <div class="meta-item">
          <span class="k">${escape(k)}</span>
          <span class="v">${escape(v)}</span>
        </div>
      `).join('');

      gsap.fromTo(banner, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' });
      gsap.fromTo(metaBox.children, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' });
    }

    function saveToHistory(slug, val, res) {
      if (!val) return;
      const key = 'history::anon';
      const arr = OVStore.get(key, []) || [];
      arr.unshift({
        slug,
        input: slug === 'password' || slug === 'creditCard' ? '•••••' : val.slice(0, 80),
        valid: res.valid,
        reason: res.reason || null,
        ts: Date.now(),
      });
      OVStore.set(key, arr.slice(0, 200));
    }

    btn?.addEventListener('click', run);
    clear?.addEventListener('click', () => {
      input.value = '';
      resultBox.classList.add('hidden');
      copyBtn.classList.add('opacity-0');
      if (pwFill) pwFill.style.width = '0%';
      if (pwText) pwText.textContent = '';
    });
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    input?.addEventListener('input', () => {
      input.classList.remove('field-valid', 'field-invalid');
      if (auto?.checked) run();
    });

    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(input.value);
        toast('success', 'Copied', 'Input copied to clipboard.');
      } catch (_) {
        toast('warn', 'Copy failed', 'Clipboard permission denied.');
      }
    });
  }

  /* -------- History -------- */
  function wireHistory() {
    const tbody = document.getElementById('history-tbody');
    const items = OVStore.get('history::anon', []) || [];
    if (!tbody) return;
    if (items.length === 0) return;

    tbody.innerHTML = items.map((it, i) => {
      const v = OVValidators[it.slug];
      const when = new Date(it.ts).toLocaleString();
      return `
        <tr class="hover:bg-slate-900/40 transition">
          <td class="px-5 py-3.5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-base">${v ? v.icon : '🔎'}</div>
              <div>
                <p class="font-medium text-sm">${v ? v.name : it.slug}</p>
                <p class="text-[10px] text-slate-500 font-mono">${it.slug}</p>
              </div>
            </div>
          </td>
          <td class="px-5 py-3.5 font-mono text-xs text-slate-300 max-w-[260px] truncate">${escape(it.input)}</td>
          <td class="px-5 py-3.5"><span class="badge ${it.valid ? 'badge-success' : 'badge-error'}">${it.valid ? 'PASS' : 'FAIL'}</span></td>
          <td class="px-5 py-3.5 text-xs text-slate-400">${when}</td>
          <td class="px-5 py-3.5 text-right">
            <button data-idx="${i}" class="re-run btn btn-secondary btn-sm">Re-run</button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.re-run').forEach(b => {
      b.addEventListener('click', () => {
        const it = items[+b.dataset.idx];
        router.navigate('/validator/' + it.slug);
      });
    });

    document.getElementById('export-btn')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'validation-history.json';
      a.click();
      URL.revokeObjectURL(url);
      toast('success', 'Exported', 'History downloaded as JSON.');
    });

    document.getElementById('clear-history')?.addEventListener('click', () => {
      if (!confirm('Clear all validation history?')) return;
      OVStore.remove('history::anon');
      router.navigate('/history');
      toast('info', 'History cleared');
    });
  }

  /* -------- Hash playground -------- */
  function wireHashPlayground() {
    // --- v1 (text) elements
    const encIn     = document.getElementById('hp-input');
    const encSalt   = document.getElementById('hp-salt');
    const encOut    = document.getElementById('hp-output');
    const encCopy   = document.getElementById('hp-copy');
    const encBtn    = document.getElementById('hp-encode-btn');
    const sampleBtn = document.getElementById('hp-sample');

    // --- v2 (structured) elements
    const structFields = document.getElementById('hp-struct-fields');
    const structOut    = document.getElementById('hp-struct-output');
    const structCopy   = document.getElementById('hp-struct-copy');
    const structGen    = document.getElementById('hp-struct-generate');
    const structSample = document.getElementById('hp-struct-sample');
    const structDl     = document.getElementById('hp-struct-download');
    const structSize   = document.getElementById('hp-struct-size');
    const structCksum  = document.getElementById('hp-struct-checksum');
    const structBits   = document.getElementById('hp-struct-bits');

    // --- decoder elements
    const decIn   = document.getElementById('hp-token');
    const decBtn  = document.getElementById('hp-decode-btn');
    const swapBtn = document.getElementById('hp-swap');
    const fileIn  = document.getElementById('hp-file');
    const flagInp = document.getElementById('hp-flagnames');
    const decWrap = document.getElementById('hp-decoded-wrap');
    const decBan  = document.getElementById('hp-decoded-banner');
    const decFlds = document.getElementById('hp-decoded-fields');
    const decRaw  = document.getElementById('hp-decoded-raw');

    // --- mode switcher
    const modeText   = document.getElementById('hp-mode-text');
    const modeStruct = document.getElementById('hp-mode-struct');
    const encText    = document.getElementById('hp-encoder-text');
    const encStruct  = document.getElementById('hp-encoder-struct');

    function setMode(mode) {
      const isText = mode === 'text';
      encText.classList.toggle('hidden', !isText);
      encStruct.classList.toggle('hidden', isText);
      modeText.classList.toggle('bg-slate-700/50', isText);
      modeText.classList.toggle('text-white', isText);
      modeText.classList.toggle('text-slate-400', !isText);
      modeStruct.classList.toggle('bg-slate-700/50', !isText);
      modeStruct.classList.toggle('text-white', !isText);
      modeStruct.classList.toggle('text-slate-400', isText);
    }
    modeText?.addEventListener('click', () => setMode('text'));
    modeStruct?.addEventListener('click', () => setMode('struct'));

    /* ---------- V1 (text) ---------- */
    function runEncode() {
      const text = encIn.value;
      const salt = encSalt.value.trim();
      if (!text) { encOut.value = ''; return; }
      try {
        const token = OVHash.encode(text, salt || undefined);
        encOut.value = token;
        if (salt) encSalt.value = salt;
        gsap.fromTo(encOut, { scale: 0.97, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' });
      } catch (e) { encOut.value = 'Error: ' + e.message; }
    }

    /* ---------- V2 (structured) ---------- */
    function gatherStruct() {
      const obj = {};
      const fields = structFields?.querySelectorAll('.struct-field') || [];
      fields.forEach(row => {
        const cb    = row.querySelector('.struct-included');
        const input = row.querySelector('.struct-input');
        const key   = row.dataset.key;
        if (!cb || !input) return;
        if (!cb.checked) return;
        const v = input.value.trim();
        if (!v) return;
        if (input.dataset.kind === 'uint') {
          const n = parseInt(v, 10);
          if (isNaN(n)) { input.classList.add('field-invalid'); return; }
          input.classList.remove('field-invalid');
          obj[key] = n;
        } else if (input.dataset.kind === 'flags') {
          obj[key] = v.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          obj[key] = v;
        }
      });
      return obj;
    }

    function updateStructBits() {
      const fields = structFields?.querySelectorAll('.struct-field') || [];
      let count = 0;
      fields.forEach(row => {
        if (row.querySelector('.struct-included')?.checked) count++;
      });
      if (structBits) structBits.textContent = `${count}/8 fields`;
    }

    structFields?.querySelectorAll('.struct-included').forEach(cb => {
      cb.addEventListener('change', updateStructBits);
    });
    updateStructBits();

    let lastLic = null;

    function runStructGenerate() {
      const obj = gatherStruct();
      const required = ['entity', 'product', 'version', 'issued', 'serial'];
      const missing = required.filter(k => obj[k] === undefined || obj[k] === '');
      if (missing.length) {
        toast('warn', 'Missing required fields', missing.join(', '));
        return;
      }
      try {
        const r = OVHash.structEncode(obj);
        structOut.value = r.token;
        if (structSize) structSize.textContent = r.token.length + ' chars';
        if (structCksum) structCksum.textContent = 'fnv=' + r.checksum;
        if (structDl) {
          structDl.disabled = false;
          lastLic = OVHash.makeLicenseFile(obj);
        }
        gsap.fromTo(structOut, { scale: 0.97, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' });
        toast('success', 'Token generated', r.token.length + ' chars');
      } catch (e) {
        toast('error', 'Encode failed', e.message);
      }
    }

    function runStructSample() {
      const now = Math.floor(Date.now() / 1000);
      const fields = structFields?.querySelectorAll('.struct-field') || [];
      const data = {
        entity:  'user-' + Math.floor(Math.random() * 9000 + 1000),
        product: 'offline-validator',
        version: 3,
        issued:  now,
        expires: now + 365 * 24 * 60 * 60,
        plan:    'pro',
        flags:   'api,export,beta',
        serial:  'LIC-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      };
      fields.forEach(row => {
        const cb = row.querySelector('.struct-included');
        const inp = row.querySelector('.struct-input');
        const k = row.dataset.key;
        if (cb && !cb.disabled) cb.checked = true;
        if (inp && data[k] !== undefined) inp.value = data[k];
      });
      updateStructBits();
      runStructGenerate();
    }

    function downloadLicense() {
      if (!lastLic) {
        toast('warn', 'Generate first', 'Click Generate before downloading.');
        return;
      }
      const blob = new Blob([JSON.stringify(lastLic, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const name = (lastLic.payload?.serial || 'license') + '.ovlicense';
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('success', 'Downloaded', name);
    }

    structGen?.addEventListener('click', runStructGenerate);
    structSample?.addEventListener('click', runStructSample);
    structDl?.addEventListener('click', downloadLicense);

    structCopy?.addEventListener('click', async () => {
      if (!structOut.value) return;
      try { await navigator.clipboard.writeText(structOut.value); toast('success', 'Copied', 'Token copied.'); }
      catch (_) { toast('warn', 'Copy failed'); }
    });

    /* ---------- DECODER (handles v1, v2, .ovlicense) ---------- */
    function showDecodeResult(ok, kind, data, message) {
      decWrap.classList.remove('hidden');
      if (ok) {
        decBan.className = 'rounded-xl p-3.5 flex items-center gap-2.5 border result-ok';
        decBan.innerHTML = `
          <div class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-emerald-200 text-sm tracking-tight">${escape(kind)} decoded</p>
            <p class="text-xs text-emerald-300/80 mt-0.5">${escape(message || 'Token is valid and untampered.')}</p>
          </div>
        `;
        const fields = (kind === 'v2' || kind === 'ovlicense')
          ? Object.entries(data).filter(([k]) => !k.startsWith('_') && k !== 'token' && k !== 'fileType' && k !== 'version' && k !== 'schema' && k !== 'generatedAt')
          : null;
        if (fields && fields.length) {
          decFlds.innerHTML = fields.map(([k, v]) => `
            <div class="meta-item">
              <span class="k">${escape(k)}</span>
              <span class="v">${escape(Array.isArray(v) ? v.join(', ') : String(v))}</span>
            </div>
          `).join('');
        } else if (kind === 'v1') {
          decFlds.innerHTML = `
            <div class="meta-item col-span-full">
              <span class="k">decoded text</span>
              <span class="v whitespace-pre-wrap break-all">${escape(data)}</span>
            </div>
          `;
        } else {
          decFlds.innerHTML = '';
        }
        decRaw.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      } else {
        decBan.className = 'rounded-xl p-3.5 flex items-center gap-2.5 border result-fail';
        decBan.innerHTML = `
          <div class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-rose-500/25 text-rose-300 border border-rose-500/40">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-rose-200 text-sm tracking-tight">Decode failed</p>
            <p class="text-xs text-rose-300/80 mt-0.5">${escape(message)}</p>
          </div>
        `;
        decFlds.innerHTML = '';
        decRaw.textContent = '';
      }
    }

    function runDecode() {
      const raw = decIn.value.trim();
      if (!raw) { decWrap.classList.add('hidden'); return; }
      const flagNames = (flagInp?.value || '').split(',').map(s => s.trim()).filter(Boolean);

      // 1) JSON? (.ovlicense)
      if (raw.startsWith('{')) {
        try {
          const j = JSON.parse(raw);
          if (j.token && j.payload) {
            const r = OVHash.structDecode(j.token, null, flagNames);
            if (r) {
              showDecodeResult(true, 'ovlicense', j.payload, 'File verified · ' + r.checksum);
            } else {
              showDecodeResult(false, '', null, 'File token failed integrity check');
            }
            return;
          }
        } catch (e) { /* fall through */ }
        showDecodeResult(false, '', null, 'Invalid JSON');
        return;
      }

      // 2) v2 token (ov2s$…)
      if (raw.startsWith('ov2s$')) {
        const r = OVHash.structDecode(raw, null, flagNames);
        if (r) {
          const fieldCount = Object.keys(r.payload).filter(k => !k.startsWith('_')).length;
          showDecodeResult(true, 'v2', r.payload, 'v2 token valid · ' + r.checksum + ' · ' + fieldCount + ' fields');
        } else {
          showDecodeResult(false, '', null, 'v2 token invalid, tampered, or wrong salt');
        }
        return;
      }

      // 3) v1 token (v1$…)
      if (raw.startsWith('v1$')) {
        const parts = raw.split('$');
        const salt = parts.length === 4 ? parts[1] : null;
        const out = OVHash.decode(raw, salt);
        if (out === null) {
          showDecodeResult(false, '', null, 'v1 token invalid, tampered, or wrong salt');
        } else {
          showDecodeResult(true, 'v1', out, 'v1 token valid · ' + parts[2]);
        }
        return;
      }

      showDecodeResult(false, '', null, 'Unrecognized token format (must start with v1$ or ov2s$)');
    }

    encBtn?.addEventListener('click', runEncode);
    decBtn?.addEventListener('click', runDecode);
    encIn?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); runEncode(); } });
    decIn?.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); runDecode(); } });

    encCopy?.addEventListener('click', async () => {
      if (!encOut.value) return;
      try { await navigator.clipboard.writeText(encOut.value); toast('success', 'Copied', 'Token copied.'); }
      catch (_) { toast('warn', 'Copy failed'); }
    });

    swapBtn?.addEventListener('click', () => {
      const src = structOut.value || encOut.value;
      if (!src) return;
      decIn.value = src;
      runDecode();
      decIn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    sampleBtn?.addEventListener('click', () => {
      encIn.value = 'Hello, Offline Validator! 👋  你好  🔐';
      encSalt.value = '';
      runEncode();
    });

    fileIn?.addEventListener('change', async () => {
      const f = fileIn.files?.[0];
      if (!f) return;
      const text = await f.text();
      decIn.value = text;
      runDecode();
      toast('info', 'File loaded', f.name);
    });
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  window.OVApp = { router, toast };
})();
