# 🚀 Publish Offline Validator to GitHub — one-shot script

The local git repo at `/storage/emulated/0/soumik/offlinevalidetor` is already
committed and ready to push. This script does the rest: creates a GitHub repo,
sets it as the `origin` remote, pushes `main`, enables GitHub Pages, and prints
the live URL.

> **Pick ONE of the three options below based on what you have installed.**

---

## Option A — GitHub CLI (easiest, recommended)

Requires [`gh`](https://cli.github.com/) authenticated (`gh auth login`).

```bash
cd /storage/emulated/0/soumik/offlinevalidetor

# 1) Create a public repo on GitHub and push
gh repo create offline-validator \
  --public \
  --source=. \
  --remote=origin \
  --push \
  --description "🔐 Privacy-first form & data validation. 18 validators + v2 structured hash codec. 100% offline." \
  --homepage "https://YOUR-USER.github.io/offline-validator/"

# 2) Enable GitHub Pages (the workflow will then deploy on every push)
gh repo edit --enable-pages --pages-source main

# 3) Watch the first deploy
gh run watch

echo ""
echo "✅ Done! Live in ~60s at: https://YOUR-USER.github.io/offline-validator/"
```

---

## Option B — Pure git + manual repo creation

1. **Create the repo on github.com:**
   - Go to <https://github.com/new>
   - Name: `offline-validator`
   - Public, **do NOT** initialize with README/license/.gitignore
   - Click **Create repository**

2. **Then run:**

```bash
cd /storage/emulated/0/soumik/offlinevalidetor

# Replace YOUR-USER with your GitHub username
git remote add origin https://github.com/YOUR-USER/offline-validator.git
git branch -M main
git push -u origin main

echo ""
echo "✅ Pushed! Now enable Pages:"
echo "   https://github.com/YOUR-USER/offline-validator/settings/pages"
echo "   Source: 'Deploy from a branch' → main → /(root) → Save"
echo ""
echo "🌐 Live URL (in ~60s): https://YOUR-USER.github.io/offline-validator/"
```

---

## Option C — SSH (if you have a key on GitHub)

```bash
cd /storage/emulated/0/soumik/offlinevalidetor

# 1) Create repo on github.com (same as Option B step 1)

# 2) Push via SSH
git remote add origin git@github.com:YOUR-USER/offline-validator.git
git branch -M main
git push -u origin main

# 3) Enable Pages: https://github.com/YOUR-USER/offline-validator/settings/pages
```

---

## What happens after you push

The **Deploy to GitHub Pages** workflow (`.github/workflows/deploy.yml`) will
automatically:

1. Run on every push to `main`
2. Build a static artifact (the whole repo — no build step)
3. Deploy to `https://YOUR-USER.github.io/offline-validator/`
4. Take ~30-60 seconds

The **Codec smoke test** workflow (`.github/workflows/test.yml`) will run in
parallel on every push and PR, exercising the v1 + v2 hash codecs with 11
assertions. The badge will show in your README once it's running.

---

## Optional: add a beautiful README badge

Once the workflows have run once, drop this near the top of `README.md`:

```markdown
[![Deploy](https://github.com/YOUR-USER/offline-validator/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR-USER/offline-validator/actions)
[![Tests](https://github.com/YOUR-USER/offline-validator/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR-USER/offline-validator/actions)
```

---

## Custom domain (optional)

1. Add a `CNAME` file at the repo root containing your domain, e.g. `validator.example.com`.
2. Point a DNS `CNAME` to `YOUR-USER.github.io`.
3. In repo Settings → Pages → Custom domain, enter the domain and check **Enforce HTTPS**.

---

## Quick verification

After the workflow runs, visit your live URL and check:

- [ ] Landing page loads with animated gradient mesh background
- [ ] `/dashboard` shows 18 validator cards
- [ ] `/hash` opens, switch to "Structured payload (v2)", click **Sample**, click **Download .ovlicense**
- [ ] Drag the downloaded `.ovlicense` file onto the decoder — it should decode and show all 8 fields
- [ ] Theme toggle (sun/moon icon) in the navbar works
- [ ] `Cmd/Ctrl + K` focuses the dashboard search

If all 6 pass, you're live! 🎉
