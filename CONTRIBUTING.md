# 🤝 Contributing to Offline Validator

Thanks for your interest! This is a small, single-author-style project, so contributions are welcome but lightweight on process.

## Ground rules

1. **Keep it zero-build.** No bundlers, no transpilers, no `node_modules` at runtime. The site must still run by double-clicking `index.html`.
2. **One PR per concern.** Don't mix a new validator with a refactor.
3. **Match the existing style.** Indentation, naming, and the design-system classes in `css/style.css`.
4. **Test the hash codec** with `node .github/workflows/test.yml` (or the inline script in the README §15) before submitting changes to `js/hash.js`.

## Adding a new validator

1. Open `js/validators.js`.
2. Add a pure function with the contract `{ valid, reason?, meta? }` (see README §4.1).
3. Register it in the `VALIDATORS` object.
4. (Optional) Add a sample/example in `examplesFor(slug)` in `js/pages.js`.
5. Update the table in `README.md` §4.2.

The dashboard will auto-pick up the new card and the URL `/validator/<slug>` will be routable. No other changes needed.

## Adding a new hash field

Don't. The 8-field schema is part of the wire format. Adding a 9th field breaks compatibility with every existing token. If you absolutely must, follow this migration plan:

1. Bump `V2` prefix in `js/hash.js` (e.g. `'ov3s'`).
2. Widen the bitmask to 16-bit little-endian in both `packPayload` and `unpackPayload`.
3. Keep all existing field semantics identical.
4. Add a new entry at the **end** of `SCHEMA` (so existing 8-bit bitmasks still work for the first 8 fields).

## Reporting bugs

Open a GitHub issue with:

- Browser + version
- Steps to reproduce
- Expected vs actual
- Screenshot (if UI)

## License

By contributing, you agree your contributions are MIT-licensed.
