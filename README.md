# 🔐 Offline Validator — Developer & Integration Guide

> **Professional-grade, privacy-first client validation platform & cryptographic token codec.**  
> 100% in-browser runtime. Zero cloud roundtrips, zero telemetry, zero build steps.  
> Ships with 18+ production validators, custom v1/v2 reversible hash codecs, encrypted local audit storage, and a single-page architecture built for GitHub Pages.

---

## 📑 Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Encoder & Decoder Specification](#2-encoder--decoder-specification)
   - [Why Client-Side Codecs?](#why-client-side-codecs)
   - [Pipeline v1: Plain Text Codec](#pipeline-v1-plain-text-codec)
   - [Pipeline v2: Structured 8-Field License Codec](#pipeline-v2-structured-8-field-license-codec)
   - [Checksum & Integrity (FNV-1a)](#checksum--integrity-fnv-1a)
   - [Universal Decoder Matrix](#universal-decoder-matrix)
3. [File Formats & Specifications](#3-file-formats--specifications)
   - [`.ovlicense` (JSON License)](#ovlicense-json-license)
   - [`.ovstruct` (Structured Plaintext)](#ovstruct-structured-plaintext)
   - [`.ovhash` (v1 Token Plaintext)](#ovhash-v1-token-plaintext)
4. [API Reference](#4-api-reference)
   - [`OVHash` (Codec & Schema Engine)](#ovhash-codec--schema-engine)
   - [`OVFileIO` (File Parser & Downloader)](#ovfileio-file-parser--downloader)
   - [`OVValidators` (18 Validation Routines)](#ovvalidators-18-validation-routines)
   - [`OVStore` (Encrypted Storage)](#ovstore-encrypted-storage)
   - [`OVApp` (Application Controller)](#ovapp-application-controller)
5. [Single-Page Website & GitHub Pages](#5-single-page-website--github-pages)
6. [Design System & Theming](#6-design-system--theming)
7. [Code Recipes & Integration Examples](#7-code-recipes--integration-examples)
   - [Browser Vanilla JS](#browser-vanilla-js)
   - [Node.js Backend / CLI](#nodejs-backend--cli)
   - [Generating an Offline License](#generating-an-offline-license)
   - [Validating an Offline License](#validating-an-offline-license)
8. [Testing & Verification](#8-testing--verification)
9. [Deployment](#9-deployment)

---

## 1. Architecture Overview

Offline Validator is built as an uncompiled, dependency-free static web application. It runs natively in any modern browser and deploys out-of-the-box to **GitHub Pages**, Cloudflare Pages, Netlify, or self-hosted static file servers.

```
offlinevalidetor/
├── index.html            # Single-page shell, navigation, modals, toasts
├── 404.html              # Smart redirector for GitHub Pages subpaths
├── css/
│   └── style.css         # Modern 2026 design system (obsidian dark / crisp light)
├── js/
│   ├── hash.js           # v1 + v2 reversible cipher, FNV-1a checksum, license builder
│   ├── fileio.js         # Parsers, decoders, and file downloaders (.ovlicense, .ovstruct)
│   ├── validators.js     # 18 pure validation routines (RFC 5322, Luhn, E.164, etc.)
│   ├── storage.js        # Encrypted client-side storage wrapper (`OVStore`)
│   ├── pages.js          # Single-page template generator (`OVPages.singlePage`)
│   └── app.js            # Controller: workbench, directory, hash playground, history
└── tests/
    └── ovfileio_test.js  # Node.js automated test suite
```

### Dependency Flow

```
┌──────────────────────────────────────────────────────────────┐
│                       index.html                              │
│   Nav Glass Bar  ─  Single Page Container (#app)  ─  Toasts  │
└──────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  js/app.js  ─  Single Page Controller                       │
│  • DOMContentLoaded -> renders OVPages.singlePage()           │
│  • wireWorkbench()       -> interactive live validation      │
│  • wireValidatorGrid()   -> search (⌘K) & category filters   │
│  • wireHashPlayground()  -> v1/v2 encoder + universal decoder │
│  • wireHistory()         -> audit trail + re-test dispatcher │
│  • setupScrollSpy()      -> in-page anchor tracking          │
└──────────────────────────────────────────────────────────────┘
            │                  │                  │
            ▼                  ▼                  ▼
   ┌─────────────────┐┌─────────────────┐┌─────────────────┐
   │  js/pages.js    ││ js/validators.js││   js/hash.js    │
   │  OVPages        ││ OVValidators    ││  OVHash         │
   │  (Single-Page   ││ (18 pure rule   ││  (v1/v2 ciphers,│
   │   Compositor)   ││  algorithms)    ││   checksums)    │
   └─────────────────┘└─────────────────┘└─────────────────┘
                               │                  │
                               ▼                  ▼
                      ┌─────────────────┐┌─────────────────┐
                      │  js/storage.js  ││  js/fileio.js   │
                      │  OVStore        ││  OVFileIO       │
                      │  (Obfuscated    ││  (File parsers  │
                      │   localStorage) ││   & drop zone)  │
                      └─────────────────┘└─────────────────┘
```

---

## 2. Encoder & Decoder Specification

### Why Client-Side Codecs?

Standard cryptographic hashes (SHA-256, MD5) are **one-way functions**: once hashed, the original data cannot be retrieved. In offline license issuance, client-side session tokens, and local configuration files, systems often need **tamper-evident, reversible tokens** that verify integrity without storing secrets on a central server.

Offline Validator implements two reversible cryptographic pipelines:
1. **Pipeline v1:** Reversible string stream cipher for arbitrary plaintext and passwords.
2. **Pipeline v2:** Compact, bitmask-packed structured payload codec designed for license keys and entitlement tokens.

---

### Pipeline v1: Plain Text Codec

#### Token Wire Format

```
v1$<salt>$<checksum>$<base64_payload>
```

| Segment | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `prefix` | Literal | Constant version tag | `v1` |
| `salt` | Alphanumeric | Variable-length salt (auto-generated or custom) | `salt-XYZ` |
| `checksum` | 8-char Hex | 32-bit FNV-1a checksum of the encrypted bytes | `1b912b39` |
| `payload` | Base64 | Stream-cipher encrypted payload bytes | `djEuAIJvJ...` |

#### Encoding Steps (`OVHash.encode(text, salt)`)

1. **UTF-8 Encoding:** Plaintext string is converted to raw bytes via `TextEncoder`.
2. **Key Derivation:** A pseudo-random keystream is derived by expanding `MASTER_SECRET` (`OV_SECRET_2024`) combined with `salt`.
3. **XOR Stream Transformation:**
   $$\text{byte}'[i] = \text{byte}[i] \oplus \text{keystream}[i \bmod \text{length}]$$
4. **Positional Byte Shift:**
   $$\text{shifted}[i] = (\text{byte}'[i] + \text{saltCode} + i) \bmod 256$$
5. **Integrity Checksum:** Compute 32-bit FNV-1a checksum on `shifted` bytes.
6. **Base64 Packaging:** Convert `shifted` to Base64 and output `v1$<salt>$<hex_checksum>$<base64>`.

#### Decoding Steps (`OVHash.decode(token, expectedSalt)`)

1. Verify token begins with `v1$`. Split on `$` into `[prefix, salt, checksum, base64]`.
2. If `expectedSalt` is provided, assert `salt === expectedSalt`.
3. Decode Base64 into encrypted byte array.
4. Compute FNV-1a checksum of the decoded bytes. If `checksum != actualChecksum`, **abort immediately (tampered token)**.
5. Reverse Positional Byte Shift:
   $$\text{byte}'[i] = (\text{shifted}[i] - \text{saltCode} - i + 256 \times 10) \bmod 256$$
6. Reverse XOR Stream Transformation using same salt and secret.
7. Decode bytes to string via `TextDecoder('utf-8')`.

---

### Pipeline v2: Structured 8-Field License Codec

The v2 pipeline is optimized for offline software licensing, portable feature flags, and tamper-evident entitlements.

#### Token Wire Format

```
ov2s$<salt>$<checksum>$<base64url_packed_bytes>
```

#### The 8-Field Schema

| Bit | Field | Kind | Required | Description | Example |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `0x01` | `entity` | String | Yes | Licensee ID or machine fingerprint | `usr_enterprise_9821` |
| `0x02` | `product` | String | Yes | Software product slug | `offline-validator-suite` |
| `0x04` | `version` | UInt16 | Yes | Integer product schema version | `2` |
| `0x08` | `issued` | UInt32 | Yes | Unix epoch timestamp (seconds) | `1717353600` |
| `0x10` | `expires` | UInt32 | No | Expiry unix epoch (0 = perpetual) | `1750000000` |
| `0x20` | `plan` | String | No | Entitlement tier (`starter`, `pro`, `enterprise`) | `enterprise` |
| `0x40` | `flags` | Array | No | Feature flags (bitfield or comma list) | `["api", "export"]` |
| `0x80` | `serial` | String | Yes | Unique license serial key | `LIC-9821-XK4Q` |

#### Binary Byte Packing

Rather than serializing verbose JSON, v2 packs data using a **1-byte Bitmask Header** followed by raw typed fields:

```
┌─────────┬──────────────┬──────────────┬─────────────┬─────────────┬─────────────┐
│ Bitmask │ Field 0      │ Field 1      │ Field 2     │ ...         │ Field 7     │
│ (1 byte)│ (length+str) │ (length+str) │ (2-byte uint│ (4-byte ts) │ (flags list)│
└─────────┴──────────────┴──────────────┴─────────────┴─────────────┴─────────────┘
```

- String fields are packed as `[1-byte byteLength, ...utf8Bytes]`.
- Unsigned integers are packed in Big-Endian format (`UInt16` = 2 bytes, `UInt32` = 4 bytes).
- Flags are encoded as a compact 16-bit integer bitfield for known flags, with fallback to an encoded string list.

---

### Checksum & Integrity (FNV-1a)

Both v1 and v2 pipelines use the **32-bit Fowler–Noll–Vo (FNV-1a)** non-cryptographic hash for microsecond integrity verification:

$$\text{hash} = \text{OFFSET\_BASIS} \quad (2166136261)$$
$$\text{For each byte } b: \quad \text{hash} = (\text{hash} \oplus b) \times \text{PRIME} \pmod{2^{32}}$$
$$\text{PRIME} = 16777619$$

If a single bit in the token payload or salt is modified, the FNV-1a checksum recalculation fails and the decoder rejects the token with `null`.

---

### Universal Decoder Matrix

The Universal Decoder in the Hash Playground accepts any of the following 5 input formats and automatically routes them to the correct parser:

```
                        ┌───────────────────────────────┐
                        │ Input String / Dropped File   │
                        └──────────────┬────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
   Starts with "{"           Starts with "ov2s$"            Starts with "v1$"
         │                             │                             │
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│ JSON Parser     │           │ v2 Structured   │           │ v1 String       │
│ • Check .token  │           │   Codec         │           │   Codec         │
│ • Check .payload│           │ • Verify FNV-1a │           │ • Verify FNV-1a │
│ • StructDecode  │           │ • Unpack fields │           │ • Reverse XOR   │
└─────────────────┘           └─────────────────┘           └─────────────────┘
         │                             │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
               Starts with "OV-STRUCT"       Starts with "OV-HASH"
                        │                             │
               ┌─────────────────┐           ┌─────────────────┐
               │ OVFileIO Parser │           │ OVFileIO Parser │
               │ • Read headers  │           │ • Read headers  │
               │ • Decode token  │           │ • Decode token  │
               └─────────────────┘           └─────────────────┘
```

---

## 3. File Formats & Specifications

### `.ovlicense` (JSON License)
Generated by `OVHash.makeLicenseFile(payload)`. Standard JSON format used for software licensing.

```json
{
  "fileType": "ovlicense",
  "version": 2,
  "schema": "ovstruct-v1",
  "token": "ov2s$x9f2$9a1b2c3d$ABC...",
  "checksum": "9a1b2c3d",
  "created": "2026-03-09T12:00:00.000Z",
  "payload": {
    "entity": "usr_enterprise_9821",
    "product": "offline-validator-suite",
    "version": 2,
    "issued": 1717353600,
    "expires": 1750000000,
    "plan": "enterprise",
    "flags": ["api", "export", "audit_trail"],
    "serial": "LIC-9821-XK4Q"
  }
}
```

### `.ovstruct` (Structured Plaintext)
Generated by `OVFileIO.downloadStructured(payload, token)`. Human-readable metadata header followed by a separator and the cryptographic token.

```
OV-STRUCT-V2
schema: ovstruct-v1
algorithm: feistel-v1
entity: usr_8f3a2b
product: app_offline_validator
version: 2.1.0
issued: 1719926400000
expires: 1819946697949
plan: pro
flags: has_email,has_json
serial: lic-abc123
created: 2026-03-09T12:00:00Z
fields: 3
---
v1$salt-XYZ$1b912b39$djEuAIJvJ3SkDIBVuF++usn1LkrZGvIZEXOaCuo5lg/m1xQhnQxMIyAuMeFs7DO/LQJqJq6M
```

### `.ovhash` (v1 Token Plaintext)
Generated by `OVFileIO.downloadHash(token, salt)`. Minimal token archive.

```
OV-HASH-FILE-V1
algorithm: xor-shift-v1
salt: salt-XYZ
created: 2026-03-09T12:00:00Z
---
v1$salt-XYZ$1b912b39$djEuAIJvJ3SkDIBVuF++usn1LkrZGvIZEXOaCuo5lg/m1xQhnQxMIyAuMeFs7DO/LQJqJq6M
```

---

## 4. API Reference

### `OVHash` (Codec & Schema Engine)

Exposed on `window.OVHash` (browser) or `module.exports` (Node.js).

#### `OVHash.encode(text: string, salt?: string): string`
Encodes plaintext into a v1 token. If `salt` is omitted, generates a 6-character random alphanumeric salt.

#### `OVHash.decode(token: string, expectedSalt?: string): string | null`
Decodes a v1 token. Returns the original string on success, or `null` if the token is invalid or tampered.

#### `OVHash.verify(token: string, text: string, salt?: string): boolean`
Returns `true` if `token` successfully decodes to `text`.

#### `OVHash.structEncode(payload: object, opts?: object): { token: string, checksum: string, bits: number }`
Encodes an object containing the schema fields into a compact v2 `ov2s$` token.

#### `OVHash.structDecode(token: string, expectedSalt?: string, knownFlags?: string[]): { payload: object, checksum: string, valid: boolean } | null`
Decodes an `ov2s$` token and returns the parsed payload. Returns `null` on checksum failure.

#### `OVHash.structVerify(token: string): boolean`
Fast integrity check of a v2 token without full object allocation.

#### `OVHash.makeLicenseFile(payload: object, opts?: object): object`
Generates a complete `.ovlicense` JSON structure containing the token, payload, checksum, and ISO timestamp.

---

### `OVFileIO` (File Parser & Downloader)

Exposed on `window.OVFileIO`.

#### `OVFileIO.parseHashFile(fileContent: string): object | null`
Parses raw plaintext of a `.ovhash` or `.ovstruct` file and extracts header fields and token body.

#### `OVFileIO.parseAndDecode(fileContent: string, salt?: string): { valid: boolean, header: object, decoded: any, errors: string[] }`
Parses and immediately decodes the token body within the file.

#### `OVFileIO.validatePayloadFile(content: string | object): { valid: boolean, missingFields: string[], errors: string[] }`
Validates whether a parsed file contains all mandatory structured schema fields.

#### `OVFileIO.downloadLicense(licenseObj, filename?: string): void`
Prompts the browser to download a `.ovlicense` file.

#### `OVFileIO.enableDropZone(dropZoneEl, onFileRead: (content, filename) => void): () => void`
Attaches dragover, dragleave, and drop event listeners with `.drag-over` CSS feedback. Returns a cleanup function.

---

### `OVValidators` (18 Validation Routines)

Exposed on `window.OVValidators`. Every validator is a pure dictionary entry:

```typescript
interface Validator {
  name: string;
  category: 'security' | 'network' | 'formats' | 'text';
  placeholder: string;
  help: string;
  icon: string;
  sensitive?: boolean;
  hasStrength?: boolean;
  fn: (val: string) => {
    valid: boolean;
    reason?: string;
    meta?: Record<string, any>;
  };
}
```

| Slug | Name | Category | Algorithm / Specification |
| :--- | :--- | :--- | :--- |
| `email` | Email | `network` | RFC 5322 syntax + consecutive dot rejection |
| `phone` | Phone Number | `network` | International E.164 (+1–15 digits) & Indian 10-digit |
| `url` | Web URL | `network` | Protocol validation (`http`, `https`, `ftp`) + RFC 3986 |
| `ipv4` | IPv4 Address | `network` | 4-octet `0..255` range checking |
| `ipv6` | IPv6 Address | `network` | 8-group 16-bit hex with `::` compression support |
| `password` | Password Strength | `security` | Length + character entropy score + breach heuristics |
| `creditCard` | Credit Card | `security` | Luhn Mod-10 checksum + Brand detection (Visa, MC, Amex, Discover) |
| `uuid` | UUID | `formats` | RFC 4122 v1–v5 format validation |
| `json` | JSON Syntax | `formats` | Strict structural syntax parser with depth analysis |
| `base64` | Base64 | `formats` | Canonical Base64 padding & charset check |
| `semver` | Semantic Version | `formats` | Semver 2.0.0 (`MAJOR.MINOR.PATCH-PRERELEASE+BUILD`) |
| `date` | Date / Time | `formats` | ISO 8601 & RFC 2822 parsing |
| `hex` | Hexadecimal | `formats` | Even-length hexadecimal byte check |
| `color` | CSS Color | `formats` | Hex (`#rgb`, `#rrggbb`), `rgb()`, `hsl()`, and named colors |
| `username` | Username | `text` | Alphanumeric with underscores and hyphens (3–20 chars) |
| `slug` | URL Slug | `text` | Kebab-case URL-safe string check |
| `number` | Numeric Value | `text` | IEEE 754 float/integer parser |
| `hash` | Hash Digest | `security` | Length & hex check for MD5 (32), SHA-1 (40), SHA-256 (64) |

---

### `OVStore` (Encrypted Storage)

Wrapper around browser `localStorage` using XOR key obfuscation. Prevents plaintext credential leakage in browser inspection tools.

- `OVStore.set(key: string, value: any): boolean`
- `OVStore.get(key: string, fallback?: any): any`
- `OVStore.remove(key: string): void`
- `OVStore.clear(): void`

---

### `OVApp` (Application Controller)

Exposed on `window.OVApp`:
- `OVApp.toast(type: 'success'|'error'|'warn'|'info', title: string, message?: string)`: Spawns an animated toast.
- `OVApp.selectValidator(slug: string, initialValue?: string)`: Selects a validator in the workbench, updates controls, and populates the input.
- `OVApp.refreshHistory()`: Re-renders the audit history table.

---

## 5. Single-Page Website & GitHub Pages

To eliminate 404 errors on GitHub Pages, the site operates as a continuous single page:

1. **In-Page Anchor Navigation:** Navigation links point to `#overview`, `#workbench`, `#validators`, `#hash`, `#history`, `#about`.
2. **Scroll Spy:** An `IntersectionObserver` listens to section visibility and updates `.active` classes on navigation links dynamically.
3. **GitHub Pages 404 Fallback:** If a user navigates directly to a legacy subpath (e.g. `/Offline_validator/hash`), `404.html` reads `window.location.pathname`, extracts the repository root, and redirects to `./#hash` without reloading the page.
4. **Zero PushState Dependencies:** The application requires no URL rewrites, `.htaccess`, or server redirects.

---

## 6. Design System & Theming

### Color Tokens

```css
:root {
  --bg-0: #030712;         /* Deep Obsidian Background */
  --bg-glass: rgba(15, 23, 42, 0.75); /* Glassmorphism 2.0 */
  --brand-500: #6366f1;    /* Electric Indigo */
  --accent-violet: #8b5cf6;/* Cyber Violet */
  --accent-cyan: #06b6d4;  /* Neon Cyan */
  --success: #10b981;      /* Emerald Pass */
  --danger: #f43f5e;       /* Crimson Fail */
}
```

### Visual Field States

Inputs automatically receive `.field-valid` or `.field-invalid` based on validation results:
- **`.field-valid`:** Glowing emerald border + soft green background tint.
- **`.field-invalid`:** Crimson border + subtle CSS shake animation (`@keyframes shake`).

### Light Mode Support

Toggled via the navigation moon/sun icon and persisted in `localStorage('ov-theme')`. Applies `:root[data-theme="light"]` with high-contrast text (`#0f172a` primary, `#334155` body) inspired by Linear and Vercel.

---

## 7. Code Recipes & Integration Examples

### Browser Vanilla JS

```html
<script src="js/hash.js"></script>
<script src="js/validators.js"></script>
<script>
  // 1. Run Email validation
  const result = OVValidators.email.fn('engineer@offlinevalidator.io');
  console.log(result.valid); // true
  console.log(result.meta.domain); // offlinevalidator.io

  // 2. Encode sensitive input
  const token = OVHash.encode('SuperSecretPassword123!', 'session-salt');
  console.log(token); // v1$session-salt$3a8b...

  // 3. Decode token
  const original = OVHash.decode(token);
  console.log(original); // SuperSecretPassword123!
</script>
```

---

### Node.js Backend / CLI

Both `hash.js` and `fileio.js` support CommonJS/Node environments:

```javascript
const crypto = require('crypto');
global.window = {
  crypto: crypto.webcrypto,
  TextEncoder: require('util').TextEncoder,
  TextDecoder: require('util').TextDecoder,
  btoa: s => Buffer.from(s, 'binary').toString('base64'),
  atob: s => Buffer.from(s, 'base64').toString('binary')
};

require('./js/hash.js');
const { OVHash } = global.window;

// Generate token in Node.js
const token = OVHash.encode('DatabaseConnectionString', 'prod-salt');
console.log('Encoded:', token);

// Verify in Node.js
const valid = OVHash.verify(token, 'DatabaseConnectionString');
console.log('Valid:', valid); // true
```

---

### Generating an Offline License

```javascript
const licensePayload = {
  entity: 'acme-corp-prod-01',
  product: 'enterprise-suite',
  version: 2,
  issued: Math.floor(Date.now() / 1000),
  expires: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year
  plan: 'enterprise',
  flags: ['api', 'export', 'sso', 'unlimited_nodes'],
  serial: 'LIC-2026-ACME-8842',
};

// Generates license file structure
const license = OVHash.makeLicenseFile(licensePayload);
console.log('License Token:', license.token);
console.log('License JSON:', JSON.stringify(license, null, 2));
```

---

### Validating an Offline License

```javascript
function verifyClientLicense(licenseToken) {
  // 1. Fast checksum check
  if (!OVHash.structVerify(licenseToken)) {
    return { valid: false, error: 'License checksum tampered' };
  }

  // 2. Decode payload
  const result = OVHash.structDecode(licenseToken);
  if (!result || !result.payload) {
    return { valid: false, error: 'Corrupt payload' };
  }

  const { payload } = result;

  // 3. Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.expires && payload.expires < now) {
    return { valid: false, error: 'License expired', payload };
  }

  return { valid: true, payload };
}
```

---

## 8. Testing & Verification

### Running Automated File I/O Tests

```bash
node tests/ovfileio_test.js
```
Expected output:
```
*** ALL TESTS PASSED ***
```

### Running Codec Smoke Tests

```bash
node -e "
  const crypto = require('crypto');
  global.window = {
    crypto: crypto.webcrypto,
    TextEncoder: require('util').TextEncoder,
    TextDecoder: require('util').TextDecoder,
    btoa: s => Buffer.from(s, 'binary').toString('base64'),
    atob: s => Buffer.from(s, 'base64').toString('binary')
  };
  require('./js/hash.js');
  const H = global.window.OVHash;
  const t = H.encode('Hello World', 'salt');
  console.log('v1 Roundtrip:', H.decode(t) === 'Hello World' ? 'PASS' : 'FAIL');
"
```

---

## 9. Deployment

The project is configured for continuous deployment to **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`).

### Deploying Changes

```bash
# Push to main to trigger GitHub Actions deployment
git push origin main
```

Once pushed, GitHub Actions automatically verifies the test suite and deploys the static files to `https://<username>.github.io/<repository>/`.

---

## 10. License

MIT License. Designed with precision for privacy-focused developers and distributed systems engineers.
