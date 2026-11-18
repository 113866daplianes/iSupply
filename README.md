# DES iSupply PWA

A separately hosted, installable PWA shell for the existing DES iSupply Apps Script application.

## Architecture

- GitHub Pages hosts the installable shell, manifest, service worker, and official iSupply icons.
- The existing spreadsheet-bound Google Apps Script continues to host the current iSupply UI and backend functions.
- The shell loads that deployed Apps Script web app in an iframe. This intentionally preserves the existing `google.script.run` calls and stock/ledger logic instead of rewriting the full application into a second API architecture.
- Inventory transactions remain online-only. The service worker caches only the static PWA shell; it never caches Apps Script pages or transaction responses.

## Setup

1. In the existing Apps Script project, replace only `doGet()` with the version in `apps-script-notes/doGet-PWA-patch.txt`.
2. Save and deploy a new version of the Apps Script web app. The deployment must allow the intended kiosk users to open it. Keep admin actions protected by server-side PIN/session checks.
3. Copy the deployed web app URL ending in `/exec`.
4. Edit `app-config.js` and set `appsScriptUrl` to that URL.
5. Commit and push the repository contents to the `main` branch.
6. In GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
7. The included workflow deploys the repository to GitHub Pages. The expected URL is `https://113866daplianes.github.io/iSupply/` (GitHub Pages paths are case-sensitive; repository name here is `iSupply`).
8. Open the Pages URL over HTTPS. Install from the browser's install icon/menu in Edge or Chrome. On iOS, use Safari → Share → Add to Home Screen.

## Offline behavior

The PWA shell, styles, manifest, and icons are cached. The Apps Script application itself still needs an internet connection. Supply requests, approvals, restocking, inventory refreshes, and history reads require internet access. There is no offline transaction queue, to avoid conflicting stock updates or duplicate submissions.

## Important deployment note

The Apps Script `doGet()` patch uses `XFrameOptionsMode.ALLOWALL` to permit the deployed app to run inside the GitHub Pages shell. This broadens who can frame the Apps Script UI. Keep all write operations protected by server-side authorization and never put PINs or hashes in this public repository.
