# Idea Vault Site

A static website that decrypts the Idea Vault archive locally in the browser after a passphrase is entered.

## Intended website URL

https://krishnaagarwal2206.github.io/idea-vault-site/

This URL works only after GitHub Pages deployment succeeds.

## Files

- `index.html` — passphrase gate and dashboard layout
- `styles.css` — responsive website design
- `app.js` — local decrypt/render logic
- `vault-data.js` — encrypted archive data (not plaintext idea records)
- `.github/workflows/pages.yml` — static GitHub Pages workflow

## Publish with GitHub Pages

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open the **Actions** tab and verify that **Deploy Idea Vault to GitHub Pages** completes successfully.
4. Visit the URL above once GitHub reports a successful deployment.

The GitHub integration connected to the assistant can commit repository files but cannot enable the Pages setting through this integration. That single setting must be switched in the GitHub UI.

## Privacy and security notes

- The idea payload is AES-GCM encrypted. The passphrase is not embedded in the website source code, saved, sent to a server, or placed in the URL.
- Decryption occurs on the visitor's browser after the passphrase is entered.
- This is client-side encryption, not server-side authentication. Anyone can download the encrypted payload and attempt offline guesses. Use a strong, unique passphrase and do not use this design for highly sensitive secrets.
- Do not copy the old private repository's Git history into this public repository. The old history included plaintext idea records; only the current protected website files have been copied here.
- This public repository contains only the encrypted archive and the site code, but metadata such as page styling and source code will be public.

## Maintaining the ideas

When adding or editing ideas, update the canonical private archive first, then regenerate the encrypted `vault-data.js` payload. Do not commit plaintext idea records to this public repository.
