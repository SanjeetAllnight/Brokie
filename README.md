# Brokie — Wallet Survival

Brokie is a mobile-first, offline-capable personal finance app that turns budgeting into a survival game. It roasts you for bad spending decisions and rewards you for resisting temptations.

Available as a **Progressive Web App (PWA)** and a **native Android app** via Capacitor.

---

## Features

- **Wallet Engine** — Tracks your current stash and alerts you when you hit the Danger Zone.
- **Expense Logging** — Log transactions with categories, notes, and a Worth It / Instant Regret rating.
- **Resisted Temptations** — Earn XP and auto-contribute to Savings Goals when you resist buying something.
- **Savings Goals** — Multi-goal tracking with progress bars and auto-contributions.
- **Monthly Wrap** — A personalized story of your financial month with a Financial Personality algorithm (e.g. Coffee Goblin, Weekend Spender).
- **Progression System** — XP, streaks, daily quests, and achievements.
- **Roast Engine** — Customizable roast intensity (Gentle, Sarcastic, Unhinged).
- **Stats Dashboard** — Spending breakdowns, category charts, and weekly/monthly trends.
- **Settings** — Currency, theme (Light/Dark/System), Danger Zone threshold, and monthly budget.
- **PWA & Offline** — Fully installable. Works completely offline with Workbox caching and Firestore background sync.
- **Push Notifications** — Daily reality checks tuned to your Roast Intensity.
- **Native Android App** — Wrapped with Capacitor. Installable as a standalone Android app.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| State | Zustand (local-first, unidirectional) |
| Styling | Tailwind CSS (token-based via `index.css`) |
| Database | Firebase Firestore (offline persistence) |
| Auth | Firebase Anonymous Authentication |
| Push | Firebase Cloud Messaging (FCM) |
| Service Worker | Workbox via `vite-plugin-pwa` + custom FCM SW |
| Android | Capacitor 8 (WebView wrapper) |

---

## Project Structure

```
Brokie/
├── frontend/          # Vite/React PWA + Capacitor Android project
│   ├── src/           # Application source code
│   ├── public/        # Static assets, icons, service worker
│   ├── android/       # Capacitor-generated Android (Gradle) project
│   └── dist/          # Vite build output (synced into Android)
├── firestore.rules    # Firestore security rules
├── ANDROID.md         # Android build, signing & Play Store guide
├── ARCHITECTURE.md    # Codebase architecture reference
├── ENVIRONMENT.md     # Environment variable setup guide
├── DEPLOYMENT.md      # Firebase Hosting deployment checklist
└── CHANGELOG.md       # Version history
```

---

## Quick Start (Web)

```bash
# 1. Clone the repo
git clone <repo-url> && cd Brokie/frontend

# 2. Install dependencies
npm install

# 3. Set up Firebase environment
cp .env.example .env
# Fill in your Firebase credentials (see ENVIRONMENT.md)

# 4. Run dev server
npm run dev
```

Open `http://localhost:5173` — the app will guide you through Firebase setup if credentials are missing.

---

## Android APK

A debug APK is pre-built at:

```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

### Build from source

> **Requires JDK 21** (not 22, 23, 24, 25, or 26 — see [ANDROID.md](ANDROID.md) for why).
> JDK 21 is already downloaded to `~/.local/jdk/jdk-21.0.5+11/` on this machine.

```bash
cd frontend

# Build web assets and sync to Android
npm run build
npx cap sync android

# Build the debug APK
export ANDROID_HOME="$HOME/Android/Sdk"
export JAVA_HOME="$HOME/.local/jdk/jdk-21.0.5+11"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
cd android && ./gradlew assembleDebug
```

**Install on a connected device:**
```bash
$ANDROID_HOME/platform-tools/adb install android/app/build/outputs/apk/debug/app-debug.apk
```

See [ANDROID.md](ANDROID.md) for the full release build, keystore signing, and Play Store deployment checklist.

---

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Anonymous Authentication**.
3. Enable **Firestore Database**.
4. Copy your config into `frontend/.env` (see [ENVIRONMENT.md](ENVIRONMENT.md)).
5. Deploy Firestore security rules: copy the contents of `firestore.rules` into the Firebase Console → Firestore → Rules.

For Android push notifications, also download `google-services.json` from Firebase and place it at `frontend/android/app/google-services.json`.

---

## Documentation

| File | Purpose |
|---|---|
| [ANDROID.md](ANDROID.md) | Android build, signing & Play Store guide |
| [ENVIRONMENT.md](ENVIRONMENT.md) | Environment variable reference |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Codebase architecture & data flow |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Firebase Hosting deployment checklist |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
