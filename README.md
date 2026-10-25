# Daylane Planner

A minimalist pastel planner with a daily timeline and weekly calendar. Built for desktop, iPhone and iPad.

## Use
Open https://awesomesibyll-glitch.github.io/daylane-planner/ and tap an empty time slot or **Add task**. Tasks work locally without an account. Add the site to your Home Screen from Safari to use it like an app.

## Private sync
Tap **Подключить синхронизацию** inside the planner. Create a fine-grained GitHub access token scoped only to the private `daylane-data` repository with **Contents: Read and write**. Enter it on each of your own devices. A token stays on your device (if you enable Remember) and is sent only to api.github.com. It is never included in backups or committed files. Plan data lives in the private repository. You can revoke the token in GitHub settings at any time.

Changes are queued offline and sync when a connection returns. Separate events merge; the last accepted save wins when the same event is edited on two devices. Keep periodic JSON backups using the built-in Export button. This application has no analytics, advertisements, or third-party scripts.

## Develop
No dependencies or build service are required. The deployed static application is in `docs/`. The editable sources are in `client/`; run `node scripts/prepare-pages.cjs` to refresh `docs/` and `node scripts/test-github.mjs` for sync tests.

GitHub Pages source: main branch, /docs folder. Public application code contains no personal plans or access tokens.
