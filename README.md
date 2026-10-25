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

## Install as an app
Use **Установить приложение** in the header. In Chrome/Edge, confirm installation; in iPhone/iPad Safari, choose Share → Add to Home Screen. Daylane opens in its own window. The app shell and schedule work offline after the first successful visit; cross-device sync requires a connection and the one-time GitHub setup above.

## Recurring plans and journal
Tasks can repeat daily, on selected weekdays, or monthly, with an optional end date. Edit or skip a single occurrence or change the whole series. Completion belongs to one occurrence.

The separate Journal tab supports private thoughts, a five-level mood check-in, photos and files (up to 10 per entry, 5 MB each). Photos are resized without modifying originals. Drafts and attachments stay in IndexedDB. Connected GitHub sync uploads attachments to the private daylane-data repository before the journal record. Backups include repeat rules, journal records and attachments.

## Reminders
Choose an alert time in each task (at the start, 5/10/15/30 minutes, 1/2 hours or 1 day before). The Reminders panel enables device notifications and offers a test. No browser permission is requested automatically. Repeating tasks and single-instance exceptions are supported; completed/cancelled instances do not alert.

Local reminders require Daylane to remain open and can be delayed by browser/OS background throttling. This static GitHub Pages app does not send push when closed. For that use case, export/import the generated iCalendar file with VALARM alerts into your system calendar. Calendar exports are independent copies, not a live subscription. On iPhone, an .ics attachment can be imported through Apple Mail.
