import { create } from 'zustand';

export interface AuthState {
  uid: string | null;
  isAuthLoading: boolean;
  authError: string | null;

  // Actions — set only by useFirebaseSync
  setUid: (uid: string) => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  uid: null,
  isAuthLoading: true,  // True on startup; resolved after onAuthStateChanged fires
  authError: null,

  setUid: (uid) => set({ uid, isAuthLoading: false, authError: null }),
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),
  setAuthError: (error) => set({ authError: error, isAuthLoading: false }),
}));
