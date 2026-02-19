import { create } from 'zustand';
import { appStorage } from '../services/storage';

interface UIState {
  // Kid/Caregiver mode
  isKidMode: boolean;
  isCaregiverModeUnlocked: boolean;
  
  // Actions
  setKidMode: (enabled: boolean) => Promise<void>;
  unlockCaregiverMode: () => Promise<void>;
  lockCaregiverMode: () => Promise<void>;
  toggleMode: () => Promise<void>;
  
  // Initialize from storage
  initialize: () => Promise<void>;
}

export const useUIStore = create<UIState>((set, get) => ({
  isKidMode: true,
  isCaregiverModeUnlocked: false,

  setKidMode: async (enabled: boolean) => {
    set({ isKidMode: enabled });
    await appStorage.setKidMode(enabled);
  },

  unlockCaregiverMode: async () => {
    set({ isCaregiverModeUnlocked: true });
    await appStorage.setCaregiverModeUnlocked(true);
  },

  lockCaregiverMode: async () => {
    set({ isCaregiverModeUnlocked: false });
    await appStorage.setCaregiverModeUnlocked(false);
  },

  toggleMode: async () => {
    const { isKidMode } = get();
    await get().setKidMode(!isKidMode);
  },

  initialize: async () => {
    const isKidMode = await appStorage.isKidMode();
    const isUnlocked = await appStorage.isCaregiverModeUnlocked();
    set({ isKidMode, isCaregiverModeUnlocked: isUnlocked });
  },
}));
