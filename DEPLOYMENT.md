# Deployment Checklist

Follow this checklist to prepare Brokie for a production release to Firebase Hosting.

## 1. Environment Verification
- [ ] Ensure `.env` is correctly populated with production Firebase credentials.
- [ ] Verify `VITE_FIREBASE_VAPID_KEY` is present for Push Notifications.

## 2. Firebase Rules
- [ ] Deploy Firestore Rules. Users must only be able to read/write their own document structure.
```bash
firebase deploy --only firestore:rules
```

## 3. Build & Optimization
- [ ] Run `npm run lint` and verify 0 errors/warnings.
- [ ] Run `npm run build`. Ensure chunk sizes are acceptable (Code Splitting via React.lazy is active).
- [ ] Verify `dist/manifest.webmanifest`, `dist/sw.js`, and `dist/workbox-*.js` were successfully generated.

## 4. Cloud Functions
- [ ] Ensure `firebase-admin` is initialized correctly in `/functions`.
- [ ] Deploy the daily notification cron job.
```bash
cd functions
npm install
firebase deploy --only functions
```

## 5. Hosting Deployment
- [ ] Deploy the compiled frontend bundle to Firebase Hosting.
```bash
firebase deploy --only hosting
```

## 6. Post-Deployment Verification
- [ ] Visit the live URL on Desktop and verify rendering.
- [ ] Visit the live URL on Mobile (iOS/Android).
- [ ] Verify the "Install App" (PWA) prompt appears.
- [ ] Disconnect from the internet and verify the app loads offline.
- [ ] Create a test expense offline, reconnect, and verify it syncs to Firestore.
