import AsyncStorage from '@react-native-async-storage/async-storage';

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

// AsyncStorage wrapper (compatible with Expo Go)
export const mmkvStorage = {
  // String operations
  setString: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },

  getString: async (key: string): Promise<string | undefined> => {
    const value = await AsyncStorage.getItem(key);
    return value ?? undefined;
  },

  // Number operations
  setNumber: async (key: string, value: number): Promise<void> => {
    await AsyncStorage.setItem(key, value.toString());
  },

  getNumber: async (key: string): Promise<number | undefined> => {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  },

  // Boolean operations
  setBoolean: async (key: string, value: boolean): Promise<void> => {
    await AsyncStorage.setItem(key, value ? 'true' : 'false');
  },

  getBoolean: async (key: string): Promise<boolean | undefined> => {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return undefined;
    return value === 'true';
  },

  // Object/JSON operations
  setObject: async <T>(key: string, value: T): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  getObject: async <T>(key: string): Promise<T | undefined> => {
    const value = await AsyncStorage.getItem(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  },

  // Delete
  delete: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  // Check if key exists
  contains: async (key: string): Promise<boolean> => {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  },

  // Get all keys
  getAllKeys: async (): Promise<string[]> => {
    const keys = await AsyncStorage.getAllKeys();
    return [...keys]; // Convert readonly array to mutable array
  },

  // Clear all (use with caution)
  clearAll: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};

// Type-safe storage helpers
export const appStorage = {
  // Subscription entitlement
  setSubscriptionEntitlement: async (entitlement: any): Promise<void> => {
    await mmkvStorage.setObject(StorageKeys.SUBSCRIPTION_ENTITLEMENT, entitlement);
  },

  getSubscriptionEntitlement: async (): Promise<any | undefined> => {
    return await mmkvStorage.getObject(StorageKeys.SUBSCRIPTION_ENTITLEMENT);
  },

  // Active profile
  setActiveProfileId: async (profileId: string | null): Promise<void> => {
    if (profileId) {
      await mmkvStorage.setString(StorageKeys.ACTIVE_PROFILE_ID, profileId);
    } else {
      await mmkvStorage.delete(StorageKeys.ACTIVE_PROFILE_ID);
    }
  },

  getActiveProfileId: async (): Promise<string | undefined> => {
    return await mmkvStorage.getString(StorageKeys.ACTIVE_PROFILE_ID);
  },

  // Kid/Caregiver mode
  setKidMode: async (enabled: boolean): Promise<void> => {
    await mmkvStorage.setBoolean(StorageKeys.KID_MODE, enabled);
  },

  isKidMode: async (): Promise<boolean> => {
    return (await mmkvStorage.getBoolean(StorageKeys.KID_MODE)) ?? true; // Default to kid mode
  },

  setCaregiverModeUnlocked: async (unlocked: boolean): Promise<void> => {
    await mmkvStorage.setBoolean(StorageKeys.CAREGIVER_MODE_UNLOCKED, unlocked);
  },

  isCaregiverModeUnlocked: async (): Promise<boolean> => {
    return (await mmkvStorage.getBoolean(StorageKeys.CAREGIVER_MODE_UNLOCKED)) ?? false;
  },

  // Onboarding
  setOnboardingCompleted: async (completed: boolean): Promise<void> => {
    await mmkvStorage.setBoolean(StorageKeys.ONBOARDING_COMPLETED, completed);
  },

  isOnboardingCompleted: async (): Promise<boolean> => {
    return (await mmkvStorage.getBoolean(StorageKeys.ONBOARDING_COMPLETED)) ?? false;
  },

  // First launch
  setFirstLaunch: async (isFirst: boolean): Promise<void> => {
    await mmkvStorage.setBoolean(StorageKeys.FIRST_LAUNCH, isFirst);
  },

  isFirstLaunch: async (): Promise<boolean> => {
    return (await mmkvStorage.getBoolean(StorageKeys.FIRST_LAUNCH)) ?? true;
  },

  // Current routine
  setCurrentRoutineId: async (routineId: string | null): Promise<void> => {
    if (routineId) {
      await mmkvStorage.setString(StorageKeys.CURRENT_ROUTINE_ID, routineId);
    } else {
      await mmkvStorage.delete(StorageKeys.CURRENT_ROUTINE_ID);
    }
  },

  getCurrentRoutineId: async (): Promise<string | undefined> => {
    return await mmkvStorage.getString(StorageKeys.CURRENT_ROUTINE_ID);
  },

  // Last board
  setLastBoardId: async (boardId: string | null): Promise<void> => {
    if (boardId) {
      await mmkvStorage.setString(StorageKeys.LAST_BOARD_ID, boardId);
    } else {
      await mmkvStorage.delete(StorageKeys.LAST_BOARD_ID);
    }
  },

  getLastBoardId: async (): Promise<string | undefined> => {
    return await mmkvStorage.getString(StorageKeys.LAST_BOARD_ID);
  },

  // Accessibility settings
  setAccessibilitySettings: async (settings: any): Promise<void> => {
    await mmkvStorage.setObject(StorageKeys.ACCESSIBILITY_SETTINGS, settings);
  },

  getAccessibilitySettings: async (): Promise<any | undefined> => {
    return await mmkvStorage.getObject(StorageKeys.ACCESSIBILITY_SETTINGS);
  },
};
