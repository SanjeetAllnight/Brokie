// Notification message templates keyed by roast intensity.
// Used by both the React app and the Cloud Function.

import type { FirestoreSettingsFields } from '../repositories/settingsRepository';

export type RoastIntensity = FirestoreSettingsFields['roastIntensity'];

export interface NotificationTemplate {
  title: string;
  body: string;
}

// ─── Daily reminder templates ──────────────────────────────────────────────────

export const REMINDER_TEMPLATES: Record<RoastIntensity, NotificationTemplate> = {
  gentle: {
    title: 'Brokie Daily Check-in',
    body:  "Don't forget to log today's expenses. Future-you will be grateful.",
  },
  sarcastic: {
    title: 'Brokie Says Hi 👀',
    body:  "Your wallet remembers. Do you? Log your expenses.",
  },
  unhinged: {
    title: '🚨 FINANCIAL EMERGENCY 🚨',
    body:  "Your streak is hanging by a thread. Log something or forever hold your peace.",
  },
};

// ─── Danger zone templates ────────────────────────────────────────────────────

export const DANGER_ZONE_TEMPLATES: Record<RoastIntensity, NotificationTemplate> = {
  gentle: {
    title: 'Danger Zone Alert',
    body:  "Your balance is getting low. Time to ease off the spending.",
  },
  sarcastic: {
    title: 'Brokie Warning ⚠️',
    body:  "Danger Zone reached. Maybe skip the next coffee run?",
  },
  unhinged: {
    title: '💀 BROKE ALERT 💀',
    body:  "WEE WOO WEE WOO. You're officially destitute. Step away from the checkout.",
  },
};
