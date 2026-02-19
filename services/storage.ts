import { MMKV } from 'react-native-mmkv';

// MMKV storage instance
const storage = new MMKV({
  id: 'aac-storage',
  encryptionKey: 'aac-encryption-key', // In production, this should be generated securely
});

// Storage keys
export const StorageKeys = {
  // Subscription
  SUBSCRIPTION_ENTITLEMENT: 'subscription_entitlement',
  
  // App state
  ACTIVE_PROFILE_ID: 'active_profile_id',
  KID_MODE: 'kid_mode',
  CAREGIVER_MODE_UNLOCKED: 'caregiver_mode_unlocked',
  
  // Settings
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FIRST_LAUNCH: 'first_launch',
  
  // UI state
  CURRENT_ROUTINE_ID: 'current_routine_id',
  LAST_BOARD_ID: 'last_board_id',
  
  // Accessibility
  ACCESSIBILITY_SETTINGS: 'accessibility_settings',
  
  // Encryption key (reference only, actual key stored in SecureStore)
  ENCRYPTION_KEY_REF: 'encryption_key_ref',
} as const;

// MMKV Storage wrapper
export const mmkvStorage = {
  // String operations
  setString: (key: string, value: string): void => {
    storage.set(key, value);
  },

  getString: (key: string): string | undefined => {
    return storage.getString(key);
  },

  // Number operations
  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },

  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  // Boolean operations
  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key);
  },

  // Object/JSON operations
  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  getObject: <T>(key: string): T | undefined => {
    const value = storage.getString(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  },

  // Delete
  delete: (key: string): void => {
    storage.delete(key);
  },

  // Check if key exists
  contains: (key: string): boolean => {
    return storage.contains(key);
  },

  // Get all keys
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },

  // Clear all (use with caution)
  clearAll: (): void => {
    storage.clearAll();
  },
};

// Type-safe storage helpers
export const appStorage = {
  // Subscription entitlement
  setSubscriptionEntitlement: (entitlement: any): void => {
    mmkvStorage.setObject(StorageKeys.SUBSCRIPTION_ENTITLEMENT, entitlement);
  },

  getSubscriptionEntitlement: (): any | undefined => {
    return mmkvStorage.getObject(StorageKeys.SUBSCRIPTION_ENTITLEMENT);
  },

  // Active profile
  setActiveProfileId: (profileId: string | null): void => {
    if (profileId) {
      mmkvStorage.setString(StorageKeys.ACTIVE_PROFILE_ID, profileId);
    } else {
      mmkvStorage.delete(StorageKeys.ACTIVE_PROFILE_ID);
    }
  },

  getActiveProfileId: (): string | undefined => {
    return mmkvStorage.getString(StorageKeys.ACTIVE_PROFILE_ID);
  },

  // Kid/Caregiver mode
  setKidMode: (enabled: boolean): void => {
    mmkvStorage.setBoolean(StorageKeys.KID_MODE, enabled);
  },

  isKidMode: (): boolean => {
    return mmkvStorage.getBoolean(StorageKeys.KID_MODE) ?? true; // Default to kid mode
  },

  setCaregiverModeUnlocked: (unlocked: boolean): void => {
    mmkvStorage.setBoolean(StorageKeys.CAREGIVER_MODE_UNLOCKED, unlocked);
  },

  isCaregiverModeUnlocked: (): boolean => {
    return mmkvStorage.getBoolean(StorageKeys.CAREGIVER_MODE_UNLOCKED) ?? false;
  },

  // Onboarding
  setOnboardingCompleted: (completed: boolean): void => {
    mmkvStorage.setBoolean(StorageKeys.ONBOARDING_COMPLETED, completed);
  },

  isOnboardingCompleted: (): boolean => {
    return mmkvStorage.getBoolean(StorageKeys.ONBOARDING_COMPLETED) ?? false;
  },

  // First launch
  setFirstLaunch: (isFirst: boolean): void => {
    mmkvStorage.setBoolean(StorageKeys.FIRST_LAUNCH, isFirst);
  },

  isFirstLaunch: (): boolean => {
    return mmkvStorage.getBoolean(StorageKeys.FIRST_LAUNCH) ?? true;
  },

  // Current routine
  setCurrentRoutineId: (routineId: string | null): void => {
    if (routineId) {
      mmkvStorage.setString(StorageKeys.CURRENT_ROUTINE_ID, routineId);
    } else {
      mmkvStorage.delete(StorageKeys.CURRENT_ROUTINE_ID);
    }
  },

  getCurrentRoutineId: (): string | undefined => {
    return mmkvStorage.getString(StorageKeys.CURRENT_ROUTINE_ID);
  },

  // Last board
  setLastBoardId: (boardId: string | null): void => {
    if (boardId) {
      mmkvStorage.setString(StorageKeys.LAST_BOARD_ID, boardId);
    } else {
      mmkvStorage.delete(StorageKeys.LAST_BOARD_ID);
    }
  },

  getLastBoardId: (): string | undefined => {
    return mmkvStorage.getString(StorageKeys.LAST_BOARD_ID);
  },

  // Accessibility settings
  setAccessibilitySettings: (settings: any): void => {
    mmkvStorage.setObject(StorageKeys.ACCESSIBILITY_SETTINGS, settings);
  },

  getAccessibilitySettings: (): any | undefined => {
    return mmkvStorage.getObject(StorageKeys.ACCESSIBILITY_SETTINGS);
  },
};
