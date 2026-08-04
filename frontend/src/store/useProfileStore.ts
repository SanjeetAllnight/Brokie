import { create } from 'zustand';

interface ProfileState {
  currency: string;

  // Actions
  setCurrency: (currency: string) => void;
  
  // Hydration from Firestore
  hydrateProfile: (fields: Partial<{ currency: string }>) => void;
}

const initialState = {
  currency: 'USD',
};

export const useProfileStore = create<ProfileState>((set) => ({
  ...initialState,

  setCurrency: (currency) => set({ currency }),

  hydrateProfile: (fields) => set((state) => ({ ...state, ...fields })),
}));
