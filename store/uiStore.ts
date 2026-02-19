import { create } from 'zustand';
import { appStorage } from '../services/storage';

interface UIState {
  // Kid/Caregiver mode
  isKidMode: boolean;
  isCaregiverModeUnlocked: boolean;
  
  // Actions
  setKidMode: (enabled: boolean) => void;
  unlockCaregiverMode: () => void;
  lockCaregiverMode: () => void;
  toggleMode: () => void;
  
  // Initialize from storage
  initialize: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isKidMode: true,
  isCaregiverModeUnlocked: false,

  setKidMode: (enabled: boolean) => {
    set({ isKidMode: enabled });
    appStorage.setKidMode(enabled);
  },

  unlockCaregiverMode: () => {
    set({ isCaregiverModeUnlocked: true });
    appStorage.setCaregiverModeUnlocked(true);
  },

  lockCaregiverMode: () => {
    set({ isCaregiverModeUnlocked: false });
    appStorage.setCaregiverModeUnlocked(false);
  },

  toggleMode: () => {
    const { isKidMode } = get();
    get().setKidMode(!isKidMode);
  },

  initialize: () => {
    const isKidMode = appStorage.isKidMode();
    const isUnlocked = appStorage.isCaregiverModeUnlocked();
    set({ isKidMode, isCaregiverModeUnlocked: isUnlocked });
  },
}));
