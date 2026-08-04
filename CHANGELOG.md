# Changelog

## [1.0.0] - Production Ready Release
### Added
- **Savings Goals**: Multi-goal tracking with progress bars.
- **Auto-Contributions**: Instantly deposit the value of resisted temptations into savings.
- **Monthly Wrap**: Dynamically generated financial story analyzing the month's spending and identifying user personality.
- **PWA Capabilities**: Full offline-support via Workbox, installable on iOS and Android.
- **Push Notifications**: Daily reality check push notifications triggered via Cloud Functions.
- **Code Splitting**: Lazy loading of routes (`React.lazy`) to dramatically reduce initial bundle size and improve Time to Interactive.
- **Documentation**: Comprehensive `README.md`, `ARCHITECTURE.md`, `ENVIRONMENT.md`, and `DEPLOYMENT.md`.

### Changed
- Removed all developer debugging utilities (`DevTools`, `seedTransactions`) from the production build.
- Fixed exhaustive-deps linting warnings in `useStatistics.ts` and `MonthlyWrap.tsx`.
- Refactored `useTransactionStore` to initialize with an empty array instead of dummy seed data.

### Security
- Locked down Firestore via Anonymous Auth. All writes are sandboxed to `users/{uid}`.
