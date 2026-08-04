# Brokie Android App

Brokie is also available as a native Android application built with Capacitor. The Android app is a native shell that wraps the existing Vite/React PWA — no code duplication, no rewrite.

---

## Architecture

```
Capacitor Shell (Native Android)
  └── WebView
        └── Vite/React PWA (same codebase as web)
              └── Firebase SDK (works identically)
              └── Zustand + Repositories
              └── Service Worker (offline support)
```

---

## Prerequisites

| Tool | Min Version | Notes |
|------|-------------|-------|
| Node.js | 18+ | Any LTS |
| Java | **21 (required)** | JDK 26 is NOT compatible with AGP 8.x |
| Android SDK | API 24+ | Install via Android Studio |
| `ANDROID_HOME` | — | Set to `~/Android/Sdk` |

> [!CAUTION]
> **Java 21 is strictly required.** Android Gradle Plugin 8.x uses a `jlink --disable-plugin system-modules` flag that was removed in Java 23+. Using Java 26 will fail. A prebuilt JDK 21 (Eclipse Temurin) has already been downloaded to `~/.local/jdk/jdk-21.0.5+11/` on this machine.

**Set environment variables permanently** (add to `~/.bashrc` or `~/.zshrc`):

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export JAVA_HOME="$HOME/.local/jdk/jdk-21.0.5+11"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/37.0.0:$PATH"
```

---

## Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (already done)
npm install

# 3. Build the web app
npm run build

# 4. Sync to Android (copies dist/ into the Android project)
npx cap sync android
```

---

## Build Debug APK

```bash
cd frontend
npm run android:debug
```

Or step by step:

```bash
cd frontend
npm run build
npx cap sync android
cd frontend/android
export ANDROID_HOME="$HOME/Android/Sdk"
export JAVA_HOME="$HOME/.local/jdk/jdk-21.0.5+11"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/37.0.0:$PATH"
./gradlew assembleDebug
```

**Output APK location:**
```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

**Install on a connected device/emulator:**
```bash
adb install frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Build Release APK

### 1. Generate a signing keystore (one-time)

```bash
keytool -genkey -v \
  -keystore brokie-release.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias brokie
```

Save the keystore file securely. **Never commit it to git.**

### 2. Create signing config

Create `frontend/android/keystore.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=brokie
storeFile=../../../brokie-release.jks
```

### 3. Update `android/app/build.gradle` to use the signing config

Add inside the `android { }` block:

```groovy
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 4. Build

```bash
cd frontend/android
./gradlew assembleRelease
```

**Output:**
```
frontend/android/app/build/outputs/apk/release/app-release.apk
```

---

## Firebase Setup for Android

> [!IMPORTANT]
> Without `google-services.json`, push notifications will NOT work on Android. The app will still function (Firebase Web SDK runs in the WebView), but native FCM won't be connected.

### Steps

1. Go to [Firebase Console](https://console.firebase.google.com) → Your Brokie project
2. Click the ⚙️ gear → **Project Settings**
3. Scroll to **"Your apps"** section → Click **"Add app"** → Select **Android** (🤖)
4. Enter:
   - **Android package name:** `com.brokie.app`
   - **App nickname:** Brokie Android
   - **Debug signing cert SHA-1:** Run this to get it:
     ```bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
     ```
5. Download `google-services.json`
6. Place it at: `frontend/android/app/google-services.json`
7. Re-run `npx cap sync android` and rebuild

---

## App Configuration

| Setting | Value |
|---------|-------|
| Package ID | `com.brokie.app` |
| App Name | `Brokie` |
| Min SDK | API 24 (Android 7.0+) |
| Target SDK | API 36 |
| Version | 1.0 (code: 1) |

---

## Play Store Deployment Checklist

### Pre-submission
- [ ] `google-services.json` is in place and Firebase Android app is registered
- [ ] Release APK is built and signed with a production keystore
- [ ] Test on a physical device (not just emulator)
- [ ] Enable **Anonymous Auth** in Firebase Console if not already done
- [ ] Firestore Security Rules are deployed (`firebase deploy --only firestore:rules`)
- [ ] App opens correctly, home screen loads without errors
- [ ] Transactions can be logged and persist after app restart
- [ ] Offline mode works (airplane mode test)
- [ ] Push notifications work (toggle in Settings)

### Play Console Setup
- [ ] Create a [Google Play Console](https://play.google.com/console) account ($25 one-time fee)
- [ ] Create a new app: "Brokie — Wallet Survival"
- [ ] Upload the signed release APK/AAB
- [ ] Fill in store listing:
  - Short description (80 chars): "Your brutally honest wallet survival companion."
  - Full description
  - Screenshots (at least 2 phone screenshots)
  - Feature graphic (1024×500 PNG)
  - App icon (512×512 PNG) — use `public/icons/icon-512.png`
- [ ] Set content rating (Finance apps are typically "Everyone")
- [ ] Set up pricing (Free)
- [ ] Submit for review (~3-7 days for first app)

### Building AAB for Play Store (recommended over APK)

```bash
cd frontend/android
./gradlew bundleRelease
```

Output: `app/build/outputs/bundle/release/app-release.aab`

> [!TIP]
> Google Play strongly prefers AAB format over APK for new submissions as it enables smaller app downloads via Play Asset Delivery.

---

## Development Workflow

After making changes to the web app:

```bash
cd frontend
npm run build        # Build updated web app
npx cap sync android # Copy to Android project
```

Then rebuild the APK or use Android Studio's "Run" button.

### Live Reload (Development Only)

For faster iteration during development, you can use Capacitor's live reload:

```bash
npx cap run android --livereload --external
```

This serves the app from the Vite dev server instead of the bundled files.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ANDROID_HOME not set` | Export `ANDROID_HOME=$HOME/Android/Sdk` in your shell |
| `SDK location not found` | Create `frontend/android/local.properties` with `sdk.dir=/home/YOUR_USER/Android/Sdk` |
| Firebase auth fails | Ensure Anonymous Auth is enabled in Firebase Console |
| App shows blank screen | Check that `npm run build` succeeded and `npx cap sync` ran after |
| Push notifications not working | Add `google-services.json` to `android/app/` |
| Build fails on Java version | Ensure `JAVA_HOME` points to JDK 17+ |
