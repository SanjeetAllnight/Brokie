# Brokie

Brokie is a App designed to gamify personal finance. It turns budgeting into a survival game, roasting you for bad decisions and rewarding you for resisting temptations.

## Features

- **Wallet Engine:** Tracks your current stash and alerts you when you hit the "Danger Zone".
- **Regret Meter:** Every expense is rated as "Worth It" or "Instant Regret".
- **Resisted Temptations:** Earn XP and optionally auto-contribute to Savings Goals when you resist buying something.
- **Monthly Wrap:** A dynamically generated, personalized story of your financial month, complete with a Financial Personality algorithm (e.g., Coffee Goblin, Weekend Spender).
- **Settings:** Customize your currency, theme, and Roast Intensity (Gentle, Sarcastic, Unhinged).
- **PWA & Offline:** Fully installable on iOS and Android. Works completely offline with aggressive caching and background sync via Firestore.
- **Push Notifications:** Daily reality checks customized to your Roast Intensity.

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **State Management:** Zustand (Local-first, reactive)
- **Styling:** Tailwind CSS (Strictly token-based using `index.css`)
- **Database:** Firebase Firestore (with persistent offline caching)
- **Auth:** Firebase Anonymous Authentication
- **Cloud Functions:** Node.js (Scheduled daily push notifications)
- **Service Workers:** Workbox (via `vite-plugin-pwa`) + Custom FCM Service Worker

## Quick Start

1. Clone the repository.
2. Ensure you have Node.js installed.
3. Set up your `.env` file (see `ENVIRONMENT.md`).
4. Run `npm install` in both `/frontend` and `/functions`.
5. Run `npm run dev` in `/frontend`.
