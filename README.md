# Twice

A quiet habit tracker built around one rule: **never miss twice**.

Log a habit, and if a day slips by, Twice offers a single rescue nudge instead of a
streak counter. Everything lives on the phone — no account, no sync, no analytics.

## What is inside

- **Today** — the habits scheduled for today, a one-tap check-in, and an optional
  "minimum version" for days when the full habit is too much.
- **Week rhythm** — weekdays are Sunday to Thursday, weekends are Friday and
  Saturday, and the calendar week in Reflect starts on Sunday.
- **Rescue** — when the last scheduled day was missed, a calm card (and one
  notification) invites a return. Nothing is ever called a failure.
- **Garden** — each habit grows a plant as its 30-day consistency score rises.
  Skipped days stay neutral and never lower the score.
- **Reflect** — a Sunday review of the week with optional reason tags.
- **Reminders** — per-habit times, with the default time as a fallback, plus a
  weekly reflection reminder. A rolling 7-day plan is rebuilt after every change,
  so nothing piles up and days you already logged stay quiet. Settings has a
  "Send a test reminder" button.
- **Android widget** — today's list on the home screen; tapping a row writes the
  check-in straight to SQLite.
- **Backup** — export the whole notebook as JSON and restore it on a new phone.

## Stack

Expo SDK 58 (managed, development build), React Native 0.88, TypeScript strict,
Expo Router, expo-sqlite + Drizzle, MMKV, Zustand, expo-notifications,
react-native-android-widget, Fraunces + DM Sans, Lucide icons.

Routes live in `src/app/`; everything else is grouped under `src/`:

```
src/
  app/            screens and navigators
  db/             schema, client, repositories
  domain/         dates, scheduling, consistency (unit tested)
  features/       check-in sheet, habit form, rescue, backup, settings tools
  notifications/  plan builder (unit tested) and scheduler
  stores/         Zustand stores (SQLite is the source of truth)
  ui/             shared primitives
  widget/         Android widget UI, headless task handler, refresh helper
```

## Run it

```bash
npm install
npx expo start --dev-client
```

The app uses native modules (SQLite, MMKV, notifications, widget), so it needs a
development build — Expo Go will not work.

### Browser preview

For a quick look at the interface and the core flows without a device:

```bash
npm run web
```

This exports the web build into `dist-web/` and serves it at
<http://localhost:8082> with the cross-origin isolation headers that
`expo-sqlite` needs for its WebAssembly database. The first visit creates the
SQLite database in the browser, so onboarding and check-ins behave like the app.

The preview is for checking layout and behaviour only. Reminders use the browser
Notification API while the tab is open (grant permission from Settings and use
"Send a test reminder"), the Android widget is omitted, and file backup/sharing
is replaced by a short explanatory note. It is not a shipping web target.

### Build a development client

Cloud build (no local Android SDK or Xcode needed):

```bash
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile development --platform ios
```

Install the resulting build on the phone, then run `npx expo start --dev-client`
and open the QR code. The dev server address must be reachable from the phone
(same Wi-Fi, or use `--tunnel`).

Local build, if you have Android Studio / Xcode installed:

```bash
npx expo run:android
npx expo run:ios
```

`ios/` and `android/` are generated on demand and are not checked in — change
native behavior in `app.config.ts`, never by editing those folders.

## Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # jest: dates, consistency, plants, notification plan
npm run doctor      # expo-doctor
```

## Data and privacy

Habits, check-ins, and reflections are stored in a local SQLite database with WAL
enabled. Preferences live in MMKV. There is no network call in the app.

Export a backup from **Settings → Backup** and keep the JSON file somewhere safe;
it is the only copy that survives a lost phone. Restoring replaces the current
notebook after an explicit confirmation.

## Widget

The Android widget is registered by the `react-native-android-widget` config
plugin. Long-press the home screen, choose widgets, and pick **Twice — Today**.
Tapping a row toggles the check-in in a headless task, so the data is saved even
if the app never opens. iOS home-screen widgets are not included.
# HabitTrackerApp
