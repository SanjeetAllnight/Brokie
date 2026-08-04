/**
 * Brokie Cloud Functions — index.ts
 *
 * Scheduled function: sendDailyReminder
 * Runs every hour and checks if it is time to send a daily reminder to each user
 * based on their notificationTime and timezone preferences.
 *
 * Architecture:
 * - Reads users/{uid}/settings document
 * - Checks notificationsEnabled, notificationTime
 * - Checks if the user has logged anything today (users/{uid}/transactions)
 * - Sends FCM push via users/{uid}/fcmTokens sub-collection
 * - Cleans up stale tokens on failure
 */

import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions/v2';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// ─── Types ────────────────────────────────────────────────────────────────────

type RoastIntensity = 'gentle' | 'sarcastic' | 'unhinged';

interface UserSettings {
  notificationsEnabled: boolean;
  notificationTime: string;      // "HH:MM" in 24h format
  roastIntensity: RoastIntensity;
  theme: string;
}

interface FCMTokenDoc {
  token: string;
  platform: string;
  createdAt: admin.firestore.Timestamp;
}

// ─── Notification templates ───────────────────────────────────────────────────

const REMINDER_TEMPLATES: Record<RoastIntensity, { title: string; body: string }> = {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns whether the current UTC time matches the target local time (within 30 min).
 * Uses the user's timezone if available; falls back to UTC.
 */
function isTimeToSend(notificationTime: string, timezone = 'UTC'): boolean {
  const now = new Date();
  const localTime = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  const [targetH, targetM] = notificationTime.split(':').map(Number);
  const [localH, localM]   = localTime.split(':').map(Number);

  if (isNaN(targetH) || isNaN(targetM)) return false;

  const targetMinutes = targetH * 60 + targetM;
  const localMinutes  = localH  * 60 + localM;
  const diff = Math.abs(targetMinutes - localMinutes);

  // Match within a 30-minute window
  return diff <= 30;
}

/**
 * Returns true if the user has logged at least one transaction today.
 */
async function hasLoggedTodayTransaction(uid: string): Promise<boolean> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const snap = await db
    .collection('users')
    .doc(uid)
    .collection('transactions')
    .where('timestamp', '>=', startOfDay.getTime())
    .limit(1)
    .get();

  return !snap.empty;
}

/**
 * Sends an FCM notification to all registered tokens for a user.
 * Removes stale/invalid tokens automatically.
 */
async function sendNotificationToUser(
  uid: string,
  template: { title: string; body: string }
): Promise<void> {
  const tokensSnap = await db
    .collection('users')
    .doc(uid)
    .collection('fcmTokens')
    .get();

  if (tokensSnap.empty) {
    logger.debug(`[sendDailyReminder] No FCM tokens for user ${uid}`);
    return;
  }

  const deletePromises: Promise<unknown>[] = [];

  for (const tokenDoc of tokensSnap.docs) {
    const { token } = tokenDoc.data() as FCMTokenDoc;

    try {
      await messaging.send({
        token,
        notification: {
          title: template.title,
          body:  template.body,
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#4B3B7C',
            channelId: 'brokie_reminders',
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
            },
          },
        },
        webpush: {
          notification: {
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: 'brokie-daily-reminder',
            requireInteraction: false,
          },
        },
        data: {
          tag: 'daily-reminder',
          url: '/',
        },
      });

      logger.info(`[sendDailyReminder] Sent reminder to ${uid} via token ${tokenDoc.id}`);
    } catch (err: unknown) {
      const errorCode = (err as { code?: string }).code;
      // Remove invalid/expired tokens
      if (
        errorCode === 'messaging/registration-token-not-registered' ||
        errorCode === 'messaging/invalid-registration-token'
      ) {
        logger.warn(`[sendDailyReminder] Removing stale token ${tokenDoc.id} for ${uid}`);
        deletePromises.push(tokenDoc.ref.delete());
      } else {
        logger.error(`[sendDailyReminder] Failed to send to ${uid}:`, err);
      }
    }
  }

  await Promise.all(deletePromises);
}

// ─── Scheduled Function ───────────────────────────────────────────────────────

/**
 * Runs every hour. For each user that has notifications enabled and whose
 * preferred reminder time falls within the current hour, sends a push notification
 * if they haven't logged anything today.
 */
export const sendDailyReminder = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeZone: 'UTC',
    memory: '256MiB',
  },
  async () => {
    logger.info('[sendDailyReminder] Starting daily reminder sweep');

    const usersSnap = await db.collection('users').get();

    const tasks = usersSnap.docs.map(async (userDoc) => {
      const uid = userDoc.id;

      try {
        // Load settings sub-document
        const settingsDoc = await db
          .collection('users')
          .doc(uid)
          .collection('settings')
          .doc('preferences')
          .get();

        if (!settingsDoc.exists) return;

        const settings = settingsDoc.data() as Partial<UserSettings>;

        // Bail if notifications are not enabled
        if (!settings.notificationsEnabled) return;
        if (!settings.notificationTime)     return;

        const roastIntensity: RoastIntensity = settings.roastIntensity ?? 'sarcastic';
        const timezone = userDoc.data()?.timezone ?? 'UTC';

        // Check time window
        if (!isTimeToSend(settings.notificationTime, timezone)) return;

        // Don't spam if user already logged today
        const hasLogged = await hasLoggedTodayTransaction(uid);
        if (hasLogged) {
          logger.debug(`[sendDailyReminder] User ${uid} already logged today, skipping`);
          return;
        }

        const template = REMINDER_TEMPLATES[roastIntensity];
        await sendNotificationToUser(uid, template);

      } catch (err) {
        logger.error(`[sendDailyReminder] Error processing user ${uid}:`, err);
      }
    });

    await Promise.all(tasks);
    logger.info('[sendDailyReminder] Sweep complete');
  }
);
