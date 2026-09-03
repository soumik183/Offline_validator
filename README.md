# 🔐 Offline Multi-Type Codec Suite — Developer & Integration Guide

> **A 100% client-side, zero-telemetry, privacy-first multi-type encoder and decoder with a minimalist Black & White theme.**  
> Runs entirely in the browser using Web Standards (no bundlers, no build step, no external backend).  
> Deploys out-of-the-box to **GitHub Pages**.

---

## 📑 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Token Wire Format Specification](#-token-wire-format-specification)
3. [Multi-Type Serialization Schema](#-multi-type-serialization-schema)
4. [Supported Types & Interactive Controls](#-supported-types--interactive-controls)
5. [Developer JavaScript / Node.js API](#-developer-javascript--nodejs-api)
6. [Python Integration Example](#-python-integration-example)
7. [Date, Time & Range Formats](#-date-time--range-formats)
8. [Security & Integrity Model](#-security--integrity-model)
9. [Automated Testing](#-automated-testing)
10. [Local Development & Deployment](#-local-development--deployment)

---

## 🏛️ Architecture Overview

The system is designed with a focused **2-Card architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          OFFLINE CODEC SUITE                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ 🔒 CARD 1: DYNAMIC MULTI-TYPE ENCODER                          │   │
│   │ - Add 1, 2, 3+ fields of any supported type                    │   │
│   │ - Switch field types in-place via dropdown                     │   │
│   │ - Interactive Calendar, Clock pickers, and Type Generators     │   │
│   │ - Optional custom salt / password encryption key               │   │
│   │ - Output: Reversible, tamper-evident token with FNV-1a checksum│   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                         [ Encoded Token ]                              │
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ 🔓 CARD 2: TYPE-AWARE DECODER                                  │   │
│   │ - Paste encoded token and optional secret key                  │   │
│   │ - Reverses cipher and verifies embedded FNV-1a checksum        │   │
│   │ - Detects original count of types selected                     │   │
│   │ - Renders each field with its original Type Badge & Value      │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📜 Token Wire Format Specification

Tokens follow our custom deterministic, reversible wire format:

$$\text{Token} = \texttt{v1\$} + \text{Salt} + \texttt{\$} + \text{Checksum}_{\text{hex}} + \texttt{\$} + \text{Payload}_{\text{base64}}$$

### Breakdown of Wire Token Segments:

| Segment | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| **`Version`** | String | Protocol version identifier (`v1`) | `v1` |
| **`Salt`** | String | Dynamic per-token salt or user-specified key | `k8f2a1b9` |
| **`Checksum`** | 8-char Hex | 32-bit FNV-1a checksum computed over binary packet | `7ef17590` |
| **`Payload`** | Base64 | Stream-cipher encrypted byte stream | `djEXAdd/MVfrd...` |

### Internal Binary Layout:

```
+---------------+---------------+---------------+--------------------+
| Version (2B)  | Length (2B)   | SaltHash (4B) | CipherBytes (N B)  |
| ['v', '1']    | uint16 (LE)   | int32 (LE)    | Rotating XOR bytes |
+---------------+---------------+---------------+--------------------+
 0               2               4               8                  8+N
```

1. **Rotating XOR Stream Cipher**:
   $$\text{keystreamByte}(i) = ((A \times 31) \oplus (B \times 17) \oplus (i \times 53)) \pmod{256}$$
   Where $A$ is derived from `APP_SECRET` and $B$ is derived from `Salt`.
2. **Positional Bit Shift**:
   $$\text{shift} = (7 + (i \pmod 5)) \pmod 8$$
   Each byte undergoes circular left shift before Base64 serialization.
3. **FNV-1a 32-bit Checksum**:
   Offset basis `0x811c9dc5`, FNV prime `0x01000193`. Ensures byte-level integrity against tampering.

---

## 📦 Multi-Type Serialization Schema

When multiple fields are encoded, they are serialized as an internal JSON packet:

```json
{
  "v": 1,
  "ts": 1788414136000,
  "count": 3,
  "fields": [
    {
      "id": 1,
      "type": "uuid",
      "name": "UUID (v4)",
      "val": "c3905e0e-9bd8-49fb-898e-49b493777555"
    },
    {
      "id": 2,
      "type": "date",
      "name": "Date & Time (Single)",
      "dateFormat": "iso",
      "val": "2026-09-03T12:00:00.000Z"
    },
    {
      "id": 3,
      "type": "text",
      "name": "Text / Message",
      "val": "Confidential payload 2026"
    }
  ]
}
```

When decoded, the decoder unpacks the schema, verifies integrity, and presents the exact type and value for each field.

---

## 🗂️ Supported Types & Interactive Controls

| Type Key | Display Name | Interactive Control | Details & Example |
| :--- | :--- | :--- | :--- |
| `text` | **Text / Message** | Textarea (resize-y) | Plain text string or notes.<br>`ex: "Confidential payload 2026"` |
| `uuid` | **UUID (v4)** | `⚡ Generate UUID` button | 128-bit RFC 4122 v4 cryptographically secure ID.<br>`ex: "c3905e0e-9bd8-49fb-898e-49b493777555"` |
| `userid` | **User ID** | `⚡ Generate User ID` button | Prefixed entity ID (`usr_...`).<br>`ex: "usr_8f3a2b1c9e"` |
| `date` | **Date & Time (Single)** | Interactive Calendar & Clock + Format selector | Calendar date & time picker.<br>`ex: "2026-09-03T12:00:00Z"` |
| `daterange` | **Date to Date (Range)** | 2 Calendar pickers (`From` → `To`) + Day diff | Calendar date interval with auto-calculated duration.<br>`ex: "2026-09-01 to 2026-09-10 (9 days)"` |
| `timerange` | **Time to Time (Range)** | 2 Time clock pickers (`Start` → `End`) | Clock time interval with duration calculation.<br>`ex: "09:00 to 17:00 (8 hours)"` |
| `number` | **Number** | `⚡ Random Number` button | Numeric integer, float, or balance.<br>`ex: "984520"` |
| `salt` | **Secret Key / Salt** | `⚡ Generate Key` button | Pepper or custom encryption key.<br>`ex: "key_9941aB#xYz"` |
| `json` | **JSON Data** | Textarea + `⚡ Sample JSON` | Structured key-value object.<br>`ex: {"status": "active"}` |
| `custom` | **Custom Type** | Text input to name custom type | User-defined custom field name.<br>`ex: "LicenseKey" -> "ABCD-1234"` |

---

## 💻 Developer JavaScript / Node.js API

Developers can encode and decode tokens programmatically in Node.js or in browser scripts:

### Programmatic Encoding & Decoding:

```javascript
// Works in Node.js (v18+) or Browser
const crypto = require('crypto'); // (in Node.js)
const { OVHash } = require('./js/hash.js');

// 1. Define fields to bundle
const fields = [
  { id: 1, type: 'uuid', name: 'UUID (v4)', val: '550e8400-e29b-41d4-a716-446655440000' },
  { id: 2, type: 'date', name: 'Date & Time', val: '2026-09-03T12:00:00Z' },
  { id: 3, type: 'text', name: 'Text', val: 'Hello from Node.js Backend' }
];

// 2. Encode to secure token
const payload = {
  v: 1,
  ts: Date.now(),
  count: fields.length,
  fields: fields
};

const secretSalt = 'my-custom-secret'; // optional
const token = OVHash.encode(JSON.stringify(payload), secretSalt);
console.log('Encoded Token:', token);
// Output: v1$my-custom-secret$7ef17590$djEXAdd/MVfrd...

// 3. Decode & verify token
const decodedRaw = OVHash.decode(token, secretSalt);
if (!decodedRaw) {
  throw new Error('Integrity verification failed or incorrect secret key!');
}

const result = JSON.parse(decodedRaw);
console.log(`Successfully decoded ${result.count} fields:`);
result.fields.forEach(f => {
  console.log(`- [${f.name}]: ${f.val}`);
});
```

---

## 🐍 Python Integration Example

A Python backend (FastAPI, Django, Flask) can decode and verify tokens created by the frontend:

```python
import base64
import json

APP_SECRET = "OV-SECURE-2026-!@#$%^&*()_+OFFLINE-VALIDATOR"
SHIFT_BASE = 7

def fnv1a_32(data: bytes) -> str:
    h = 0x811c9dc5
    for b in data:
        h = ((h ^ b) * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"

def keystream_byte(secret: str, salt: str, i: int) -> int:
    a = ord(secret[i % len(secret)]) if secret else 0
    b = ord(salt[i % len(salt)]) if salt else 0
    return ((a * 31) ^ (b * 17) ^ (i * 53)) & 0xFF

def decode_token(token: str, expected_salt: str = None) -> str:
    parts = token.split('$')
    if len(parts) != 4 or parts[0] != 'v1':
        raise ValueError("Invalid token format")
    
    ver, salt, checksum, payload_b64 = parts
    if expected_salt and salt != expected_salt:
        raise ValueError("Salt / Secret key mismatch")
    
    raw = base64.b64decode(payload_b64)
    if len(raw) < 8 or raw[0:2] != b'v1':
        raise ValueError("Invalid header bytes")
    
    # Verify FNV-1a checksum
    if fnv1a_32(raw) != checksum:
        raise ValueError("Checksum verification failed! Token has been tampered with.")
    
    length = raw[2] | (raw[3] << 8)
    secret = f"{APP_SECRET}:{salt}"
    
    out = bytearray(length)
    for i in range(length):
        b = raw[8 + i]
        shift = (SHIFT_BASE + (i % 5)) & 7
        # Rotate right
        b = ((b >> shift) | (b << (8 - shift))) & 0xFF
        b ^= keystream_byte(secret, salt, i)
        out[i] = b
        
    return out.decode('utf-8')

# Example usage:
# token = "v1$my-salt$..."
# payload_json = decode_token(token, "my-salt")
# data = json.loads(payload_json)
# print("Decoded fields:", data["fields"])
```

---

## 📅 Date, Time & Range Formats

The suite provides standard date formatting utilities:

### 1. Single Date/Time Formats:
- **`iso`**: `YYYY-MM-DDTHH:mm:ss.sssZ` (e.g. `2026-09-03T12:00:00Z`)
- **`dateonly`**: `YYYY-MM-DD` (e.g. `2026-09-03`)
- **`human`**: `DD/MM/YYYY HH:mm:ss` (e.g. `03/09/2026 12:00:00`)
- **`unix`**: 10-digit Unix timestamp in seconds (e.g. `1788414136`)
- **`unix_ms`**: 13-digit Unix timestamp in milliseconds (e.g. `1788414136000`)

### 2. Date to Date (Range):
Calculates elapsed calendar days automatically:
```
[ From: 2026-09-01 ]  →  [ To: 2026-09-10 ]
Result: "2026-09-01 to 2026-09-10 (9 days)"
```

### 3. Time to Time (Range):
Calculates elapsed hours and minutes, accounting for overnight spans:
```
[ Start: 09:00 ]  →  [ End: 17:30 ]
Result: "09:00 to 17:30 (8h 30m)"
```

---

## 🛡️ Security & Integrity Model

- **Tamper Detection:** Every token embeds an FNV-1a 32-bit checksum computed before transmission. Any modification of a single character invalidates decoding.
- **Key-Stretching & Salt:** The secret salt makes rainbow table attacks and precomputed dictionary lookups infeasible.
- **Client-Side Privacy:** 100% of encoding, decoding, and parsing occurs inside the browser's JavaScript execution thread. No data is sent over the network.
- **No Third-Party Trackers:** Zero analytics, zero cookies, zero external telemetry.

---

## 🧪 Automated Testing

The repository contains an automated test suite verifying round-trip encoding, decoding, checksum validation, and file parsers.

Run tests using Node.js:

```bash
node tests/ovfileio_test.js
```

Expected output:
```
*** ALL TESTS PASSED ***
```

---

## 🚀 Local Development & Deployment

### Local Setup:

```bash
# Clone the repository
git clone https://github.com/soumik183/Offline_validator.git
cd Offline_validator

# Start any local static HTTP server
python3 -m http.server 8000
# or: npx serve .

# Open in your browser
http://localhost:8000
```

### GitHub Pages Deployment:

The project requires no build step. Pushing to the `main` branch automatically triggers GitHub Pages:

```bash
git add -A
git commit -m "feat: improve developer documentation"
git push origin main
```

---

## 📄 License

MIT License. Designed with precision for offline-first developers.
