import { create } from 'zustand';
import type { FirestoreSettingsFields } from '../repositories/settingsRepository';

interface SettingsState extends FirestoreSettingsFields {
  // Actions
  setRoastIntensity: (intensity: FirestoreSettingsFields['roastIntensity']) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationTime: (time: string) => void;
  setTheme: (theme: FirestoreSettingsFields['theme']) => void;
  
  // Hydration from Firestore
  hydrateSettings: (fields: Partial<FirestoreSettingsFields>) => void;
}

const initialState: FirestoreSettingsFields = {
  roastIntensity: 'sarcastic',
  notificationsEnabled: false,
  notificationTime: '09:00',
  theme: 'system',
};

export const useSettingsStore = create<SettingsState>((set) => ({
  ...initialState,

  setRoastIntensity: (intensity) => set({ roastIntensity: intensity }),
  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
  setNotificationTime: (time) => set({ notificationTime: time }),
  setTheme: (theme) => set({ theme }),

  hydrateSettings: (fields) => set((state) => ({ ...state, ...fields })),
}));
