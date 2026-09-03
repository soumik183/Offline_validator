# 🔐 Offline Multi-Type Encoder & Decoder Suite

> **A 100% client-side, privacy-first multi-type encoder and decoder with a minimalist Black & White theme.**  
> Zero server roundtrips, zero telemetry, zero build steps.  
> Runs locally in your browser and deploys out-of-the-box to **GitHub Pages**.

---

## 🎯 Clean 2-Card Architecture

### 1. 🔒 Card 1: Dynamic Multi-Type Encoder
- **Type Selector**: Select any type (`Text / Message`, `UUID`, `User ID`, `Date & Time`, `Number`, `Secret Key / Salt`, `JSON Data`).
- **`+ Add Type` Button**: Add 1, 2, 3, or more fields dynamically into a single bundle.
- **Type Generators**:
  - `⚡ Generate UUID`: Cryptographically secure RFC 4122 v4 UUID.
  - `⚡ Generate User ID`: Random `usr_` entity identifier.
  - `⚡ Set Current Time`: Instant ISO 8601 current timestamp.
  - `⚡ Random Number`: 6-digit random number.
  - `⚡ Sample Data`: Quick realistic test data.
- **Optional Secret Key / Salt**: Protect or password-lock the generated token.
- **`Encode Token`**: Compiles all selected types and values into a single reversible, tamper-evident stream token with embedded FNV-1a checksum.
- **1-Click Copy**: Animated copy button with instant feedback.

### 2. 🔓 Card 2: Type-Aware Decoder
- **Token Input**: Paste any encoded token from Card 1.
- **Optional Secret Key / Salt**: Provide the secret password or salt if one was used.
- **`Decode Token`**: Reverses the token and validates the embedded 32-bit FNV-1a checksum.
- **Detailed Type & Value Breakdown**:
  - Displays exactly how many types were originally selected (e.g. `✓ DECODED SUCCESSFULLY · 3 TYPES DETECTED`).
  - Renders each field with its **original Type Badge** (e.g. `[UUID]`, `[DATE & TIME]`, `[TEXT]`, `[USER ID]`).
  - Displays the exact value for each type with an individual **Copy Value** button.

---

## 🎨 Theme: Minimalist Black & White

- **Monochrome High-Contrast:** Built for developers and distraction-free workflows.
- **Dark Mode (Default):** Solid pure black (`#000000`), dark surfaces (`#0a0a0a`), subtle gray borders (`#222222`), and crisp white typography (`#ffffff`).
- **Light Mode:** Crisp pure white (`#ffffff`), soft gray cards (`#f9f9fa`), and solid black typography (`#000000`).
- **Monospace Font:** Powered by `JetBrains Mono`.

---

## 🚀 Quick Start

```bash
# Clone or open directory
cd offlinevalidetor

# Serve locally
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

## 📄 License

MIT License. Designed with precision for offline-first developers.
