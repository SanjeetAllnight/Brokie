# Architecture

Brokie follows a strict unidirectional, local-first architecture built for performance and offline reliability.

## Core Layers

1. **Repositories (`src/repositories/`)**
   - The only layer that talks to Firebase.
   - Contains pure functions to read/write Firestore.
   - Sets up `onSnapshot` listeners to stream data changes.

2. **State Store (`src/store/`)**
   - Zustand stores (`useWalletStore`, `useTransactionStore`, etc.).
   - Contains the single source of truth for the UI.
   - Contains synchronous action dispatchers.
   - **No Firebase imports exist here.**

3. **Firebase Sync (`src/hooks/useFirebaseSync.ts`)**
   - The bridge between Repositories and Stores.
   - Mounted exactly once via `SyncProvider.tsx`.
   - Hydrates Zustand from Firestore snapshots.
   - Patches Zustand actions (Write-Through) to mirror local state changes to Firestore.

4. **Statistics Engine (`src/statistics/statisticsService.ts`)**
   - Pure functions that ingest raw transaction arrays and output structured data.
   - `useStatistics.ts` wraps these in `useMemo` to prevent expensive recalculations.

5. **UI Components (`src/pages/`, `src/components/`)**
   - Purely presentational.
   - They consume data via `useStore()` hooks and dispatch actions via `useStore().action()`.
   - **No business logic lives in the UI.**

## Offline Strategy
- Firestore SDK is configured with `persistentLocalCache`.
- Workbox precaches all JS/CSS/HTML assets and Google Fonts.
- The app operates completely normally offline. Writes are queued in IndexedDB by Firestore and silently synced when the connection is restored.
