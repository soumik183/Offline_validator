# 🚀 Safe push to GitHub — preserves all existing work

Your local repo already has 2 commits with the full v2 hash codec, GitHub Actions, design system, etc. Do **NOT** run the `git init` / `git add README.md` / `git commit` commands from the prompt — they would wipe the 2 existing commits and replace the README with a single `# Offline_validator` line.

**Instead, run these exact commands:**

```bash
cd /storage/emulated/0/soumik/offlinevalidetor

# 1. Just add your GitHub repo as the remote (do NOT re-init or re-commit)
git remote add origin https://github.com/soumik183/Offline_validator.git

# 2. Make sure we're on main
git branch -M main

# 3. Push the existing 2 commits (and all 20 files)
git push -u origin main
```

That's it. Your repo at `soumik183/Offline_validator` will get the full project:

```
.github/workflows/deploy.yml      ← GitHub Pages auto-deploy
.github/workflows/test.yml        ← Codec smoke tests
.nojekyll                          ← skips Jekyll
404.html                           ← graceful fallback
CONTRIBUTING.md
LICENSE                            ← MIT
PUBLISH.md                         ← helper doc
README.md                          ← full 80-line dev guide
robots.txt
sitemap.xml
index.html
css/style.css
js/{hash,storage,validators,pages,app,bulk,fileio}.js
tests/ovfileio_test.js
```

## If the GitHub repo already has commits (e.g. you ran the bad command first)

```bash
# Force-push the correct history (this is safe since you own the repo)
cd /storage/emulated/0/soumik/offlinevalidetor
git push -u origin main --force
```

## If the GitHub repo is empty (which is what you want)

```bash
cd /storage/emulated/0/soumik/offlinevalidetor
git remote add origin https://github.com/soumik183/Offline_validator.git
git push -u origin main
```

## Then enable GitHub Pages

The workflow is already in place. To activate it:

1. Go to <https://github.com/soumik183/Offline_validator/settings/pages>
2. Under **Source**, pick **GitHub Actions** (NOT "Deploy from a branch")
3. Wait ~60s. Your site will be live at:
   **`https://soumik183.github.io/Offline_validator/`**

## Want to also update README title?

If you just want the H1 to read `# Offline_validator` instead of `# 🔐 Offline Validator — Developer & AI Integration Guide`, edit the very first line of `README.md` to your taste — but don't blow away the rest of the content.

```bash
# Quick edit (optional):
cd /storage/emulated/0/soumik/offlinevalidetor
sed -i '1s/.*/# Offline_validator/' README.md
git add README.md
git commit -m "docs: simplify README title"
git push
```

