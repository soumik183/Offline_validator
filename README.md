# 🔐 Offline Validator — Developer & AI Integration Guide

> A **professional-grade, privacy-first** form & data validation platform that runs 100% in your browser. Zero servers, zero tracking, zero build steps. Ships with an 18-validator suite, a v1 string hash codec, a **v2 structured-payload codec** (`ov2s$…`) with file I/O, **light/dark theming**, **scroll-reveal animations**, and **local history** persisted to encrypted `localStorage`.

This document is the **definitive developer guide**. It is written for humans *and* AI agents that need to integrate, extend, or self-host the project.

---

## 📑 Table of Contents

1. [Quick start](#1-quick-start)
2. [Project layout](#2-project-layout)
3. [Architecture overview](#3-architecture-overview)
4. [The validation system](#4-the-validation-system)
5. [The hash system (v1 + v2)](#5-the-hash-system-v1--v2)
6. [The 18+ utility CSS classes](#6-the-18-utility-css-classes)
7. [The page system (`OVPages`)](#7-the-page-system-ovpages)
8. [The router & app shell (`OVApp`)](#8-the-router--app-shell-ovapp)
9. [Theming (dark / light)](#9-theming-dark--light)
10. [Persistence — `OVStore`](#10-persistence--ovstore)
11. [Step-by-step: how a request flows](#11-step-by-step-how-a-request-flows)
12. [Integration recipes](#12-integration-recipes)
13. [Keyboard shortcuts](#13-keyboard-shortcuts)
14. [Browser support](#14-browser-support)
15. [Testing](#15-testing)
16. [Performance budget](#16-performance-budget)
17. [Extending the design system](#17-extending-the-design-system)
18. [GitHub Pages deployment](#18-github-pages-deployment)
19. [FAQ](#19-faq)
20. [License](#20-license)

---

## 1. Quick start

```bash
# 1. Clone or copy the folder
cd offlinevalidetor

# 2. Serve it (any static server works)
python3 -m http.server 8000

# 3. Open
open http://localhost:8000       # macOS
xdg-open http://localhost:8000   # Linux
# Or just double-click index.html
```

There is **no build step, no `npm install`, no bundler**. The entire app is six plain `.html`/`.js`/`.css` files.

---

## 2. Project layout

```
offlinevalidetor/
├── index.html            # Shell + nav + footer
├── css/
│   └── style.css        # Design system v2 (823 lines, no preprocessor)
├── js/
│   ├── hash.js          # v1 + v2 codec, schema, license-file builder
│   ├── storage.js       # Encrypted localStorage wrapper (`OVStore`)
│   ├── validators.js    # 18 pure validators
│   ├── pages.js         # Page templates (`OVPages`)
│   ├── app.js           # Router, wiring, theme, toast, reveal
│   ├── bulk.js          # (optional) bulk-validate page
│   └── fileio.js        # (optional) file-decode page
├── tests/
│   └── ovfileio_test.js # Reference test harness
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Pages auto-deploy
└── README.md
```

The `tests/` directory contains a Node-friendly reference test for the file I/O module. The other `.js` files are browser-first but each IIFE pattern is designed to be polyfill-friendly for Node (see integration recipes below).


---

## 3. Architecture overview

```
┌──────────────────────────────────────────────────────────────┐
│                       index.html                              │
│   <nav>  <main#app>  <footer>  <div#toast-container>          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│   js/app.js  ─  Navigo router + GSAP animations + theme       │
│   • init()                                                       │
│   • setupRouter()  →  on('/path', render(OVPages.X(), path))  │
│   • setupThemeToggle() / setupOnlineStatus() / setupToast()    │
│   • setupReveal()  ─  IntersectionObserver fade-ins           │
│   • wireValidator(slug)  / wireDashboard() / wireHistory()    │
│   • wireHashPlayground()  ← v1 + v2 + file upload             │
└──────────────────────────────────────────────────────────────┘
            │                                │
            ▼                                ▼
┌────────────────────────┐    ┌──────────────────────────────────┐
│  js/pages.js            │    │  js/validators.js                │
│  OVPages = {            │    │  OVValidators = {                │
│    landing,             │    │    email, phone, url, password,  │
│    dashboard,           │    │    username, ipv4, ipv6, date,   │
│    validatorDetail,     │    │    color, hex, creditCard,       │
│    history,             │    │    json, base64, uuid, hash,     │
│    hashPlayground,      │    │    slug, semver, number,         │
│    about, notFound      │    │    _internal: { range, regex }   │
│  }                      │    │  }                                │
└────────────────────────┘    └──────────────────────────────────┘
            │                                │
            ▼                                ▼
┌────────────────────────────────────────────────────────────────┐
│                js/hash.js  ──  OVHash = {                        │
│                  encode/decode/verify/digest     (v1 string)    │
│                  structEncode/structDecode       (v2 object)     │
│                  structEncodeDeterministic                       │
│                  makeLicenseFile                                 │
│                  payloadTemplate  / SCHEMA                        │
│                }                                                  │
└────────────────────────────────────────────────────────────────┘
            │
            ▼
   ┌────────────────────────┐
   │  js/storage.js         │   Encrypted key/value store
   │  OVStore = {            │   backed by localStorage.
   │    get, set,            │   Keys prefixed with `ov-` and
   │    remove, has, clear   │   values obfuscated with a hash.
   │  }                      │
   └────────────────────────┘
```

The four globals every page or test relies on:

| Global          | Source          | What it does                                            |
|-----------------|-----------------|---------------------------------------------------------|
| `OVHash`        | `hash.js`       | v1 + v2 codec, schema, license builder                 |
| `OVValidators`  | `validators.js` | 18 validators with `{ name, fn, placeholder, help, icon, sensitive? }` |
| `OVStore`       | `storage.js`    | `localStorage` wrapper, key prefix `ov-`               |
| `OVPages`       | `pages.js`      | Template functions returning HTML strings              |
| `OVApp`         | `app.js`        | `router` and `toast` helpers                            |

