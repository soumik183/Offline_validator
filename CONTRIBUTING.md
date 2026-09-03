# 🤝 Contributing to Offline Multi-Type Codec Suite

Thanks for your interest! This project is designed for developers who value privacy, zero-telemetry offline tools, and minimalist design.

---

## 📜 Ground Rules

1. **Keep it Zero-Build:** No bundlers, no transpilers, and no `node_modules` required at runtime. The entire application runs natively in the browser via standard ES6+ scripts.
2. **Pure Black & White Theme:** The interface adheres strictly to a high-contrast monochrome design system (`#000000` dark surfaces, `#ffffff` accents, and `#ffffff` light surfaces). Do not introduce colored buttons or gradients.
3. **Responsive by Default:** Every new control or layout must adapt gracefully across screens from 320px mobile viewports to large 4K displays.
4. **Pass Automated Tests:** Always run `node tests/ovfileio_test.js` before submitting a PR.

---

## 🛠️ How to Add a New Field Type

To introduce a new selectable field type:

1. Open `js/app.js`.
2. Add a new definition under `TYPE_DEFS`:
   ```javascript
   mytype: {
     name: 'My New Type',
     placeholder: 'e.g. sample value…',
     details: 'Brief description of the type format.',
     example: 'sample_value_123',
     multiline: false,
     generator: makeMyTypeSample, // optional generator function
     genLabel: '⚡ Generate',       // button label
   }
   ```
3. Open `js/pages.js` and add the option to the `#sel-add-type` dropdown:
   ```html
   <option value="mytype">My New Type</option>
   ```
4. Test the field addition, generation, in-place type switching, encoding, and decoding.

---

## 📅 Adding New Date / Time Formats

To add a new date or time representation format:

1. Add the format key and implementation in `formatDateByType(d, fmt)` in `js/app.js`.
2. Add the corresponding option to `<select class="field-date-format">`.
3. Update `getDateDetailsString(fmt)` and `getDateExampleString(fmt)`.

---

## 🧪 Running Tests

Ensure all cryptographic tests and round-trip assertions pass:

```bash
node tests/ovfileio_test.js
```

---

## 🐛 Reporting Bugs

Open an issue on GitHub with:
- Browser and Operating System version.
- Exact steps to reproduce.
- Expected behavior vs. actual behavior.
- Token string (if codec/verification issue).

---

## 📄 License

By contributing to this repository, you agree that your contributions are licensed under the **MIT License**.
