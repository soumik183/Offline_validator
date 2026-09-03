# 🛠️ Offline Developer Suite — Multi-Format Encoder, Decoder & Utilities

> **A 100% client-side, privacy-first developer utility suite with a minimalist Black & White theme.**  
> Zero server roundtrips, zero telemetry, zero build steps.  
> Runs locally in your browser and deploys out-of-the-box to **GitHub Pages**.

---

## 📑 Complete Tool Catalog

### 🧬 IDENTIFIERS
- **UUID Generator**: Generate RFC 4122 v4 (random), v1 (timestamp), or Nil UUIDs. Options for uppercase/lowercase, hyphens/no-hyphens, and batch generation (1 to 25).
- **User ID Generator**: Generate custom-prefixed entity IDs (e.g. `usr_8f3a2b1c`, `cust_...`, `org_...`) with selectable charsets (Alphanumeric Base62, Hexadecimal, Digits, Base32).
- **Random ID**: Fast cryptographically secure random tokens with custom lengths and charsets.
- **Nano ID**: Compact, URL-friendly collision-resistant IDs with custom alphabet and size configuration.
- **Custom ID**: Pattern/template-based generator (e.g. `PROD-####-????-@@@@` where `#` = digit, `?` = letter, `@` = alphanumeric).

### 🔐 OUR CUSTOM CODEC (OUR OWN MADE ENCODER & DECODER SYSTEM)
- **Token Encoder (v1)**: Encode 1 or 2 values (`Value 1: Data`, `Value 2: Salt / Secret Key`) into our tamper-evident, reversible `v1$<salt>$<checksum>$<payload>` stream cipher token.
- **Token Decoder (v1)**: Decode `v1$` tokens back to original payload data and salt, validating integrity against its 32-bit FNV-1a checksum.
- **Structured License (v2)**: Generate compact `ov2s$` 8-field bitmask license tokens and export `.ovlicense` JSON packages.
- **License Decoder (v2)**: Decode and inspect claims from `ov2s$` tokens or drag-and-dropped `.ovlicense`, `.ovstruct`, and `.ovhash` files.
- **Token Verifier**: Fast 1-click token tamper and integrity verification checking embedded FNV-1a checksums.

### 🔄 ENCODING & DECODING
- **Base64**: UTF-8 safe two-way encoder and decoder with instant swap.
- **URL**: Full URI and URI Component encoder & decoder.
- **Hex**: Text to Hexadecimal byte string (`48 65 6c 6c 6f`) and Hex to Text.
- **Binary**: Text to 8-bit Binary representation (`01001000 01100101...`) and Binary to Text.
- **HTML Entities**: Character escaping and unescaping (`<>&"'` ↔ `&lt;&gt;&amp;&quot;&#39;`).

### 📅 DATE & TIME
- **Date Converter**: Convert between ISO 8601, UTC String, Local String, Unix Seconds, and Unix Milliseconds with "Set Now" shortcut.
- **Timestamp Converter**: Convert Unix timestamps (auto-detects 10-digit seconds vs 13-digit milliseconds) into human-readable date and time.
- **Timezone Converter**: Live global timezone comparison across UTC, New York (EDT/EST), Los Angeles (PDT/PST), London (BST/GMT), Berlin (CEST/CET), India (IST), Tokyo (JST), and Sydney (AEST).
- **Date Formatter**: Format dates with custom patterns (`YYYY-MM-DD HH:mm:ss`, `DD/MM/YYYY`, `MM/DD/YYYY`, etc.).

### 🎲 RANDOM
- **Number**: Cryptographically secure random number generator with Min, Max, Count, Float/Integer toggle, and Unique number enforcement.
- **String**: Random strings with customizable length and charset toggles (Uppercase, Lowercase, Numbers, Symbols).
- **UUID**: One-click v4 UUID generator.
- **Color**: Random color generator producing HEX, RGB, and HSL values with an interactive visual preview swatch.
- **Custom ID**: Random template-driven ID generator.

### 🔤 TEXT
- **Case Converter**: Convert text to `camelCase`, `snake_case`, `kebab-case`, `UPPERCASE`, `lowercase`, `Title Case`, `PascalCase`, and `CONSTANT_CASE`.
- **Slug Generator**: Convert any string into an SEO-friendly URL slug with customizable delimiters (`-` or `_`).
- **Text Counter**: Detailed live text analysis: Characters (with & without spaces), Words, Sentences, Paragraphs, Lines, Bytes, Estimated Reading Time, and Speaking Time.
- **Reverse Text**: Reverse text by characters, by words, or by lines.
- **Remove Duplicate Lines**: Deduplicate multiline lists with Case-sensitive toggle, Whitespace trimming, and Sorting (A→Z, Z→A).

### 🔢 CONVERTERS
- **Number Base**: Live 4-way reactive converter between Decimal (Base 10), Binary (Base 2), Hexadecimal (Base 16), and Octal (Base 8).
- **JSON Formatter**: Beautify JSON (2 spaces, 4 spaces, Tab), Minify / Compact, and validate syntax with exact error diagnostics.
- **JSON ↔ YAML**: Bidirectional converter between JSON and YAML.
- **CSV ↔ JSON**: Bidirectional table converter between CSV and JSON with customizable delimiters (Comma, Semicolon, Tab).

---

## 🎨 Theme: Minimalist Black & White

- **Monochrome High-Contrast:** Designed for developers, terminal enthusiasts, and distraction-free workflows.
- **Dark Mode (Default):** Solid pure black (`#000000`), dark surfaces (`#0a0a0a`), subtle gray borders (`#222222`), and crisp white typography (`#ffffff`).
- **Light Mode:** Crisp pure white (`#ffffff`), soft gray cards (`#fafafa`), and solid black typography (`#000000`).
- **Monospace Font:** Powered by `JetBrains Mono`.

---

## 🚀 Quick Start

```bash
# Clone or open directory
cd offlinevalidetor

# Serve locally (zero build steps, no npm install required)
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

---

## 🧪 Testing

Run the automated test suite with Node.js:

```bash
node tests/ovfileio_test.js
# *** ALL TESTS PASSED ***
```

---

## 🚢 GitHub Pages Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml` and `static.yml`) that automatically tests and deploys changes to GitHub Pages on every push to `main`:

```bash
git push origin main
```

---

## 📄 License

MIT License. Designed with precision for offline-first developers.
