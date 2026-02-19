import * as SecureStore from 'expo-secure-store';

// SecureStore wrapper for sensitive data
export const secureStore = {
  // Store a value securely
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error storing secure item ${key}:`, error);
      throw error;
    }
  },

  // Get a value securely
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error retrieving secure item ${key}:`, error);
      return null;
    }
  },

  // Delete a value
  deleteItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error deleting secure item ${key}:`, error);
      throw error;
    }
  },

  // Check if a key exists
  hasItem: async (key: string): Promise<boolean> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value !== null;
    } catch {
      return false;
    }
  },
};

// Encryption key management
const ENCRYPTION_KEY_STORE_KEY = 'aac_encryption_key';

export const encryptionKeyStore = {
  // Generate and store encryption key
  generateAndStoreKey: async (): Promise<string> => {
    // Generate a random 32-byte key (base64 encoded)
    const key = generateRandomKey(32);
    await secureStore.setItem(ENCRYPTION_KEY_STORE_KEY, key);
    return key;
  },

  // Get encryption key (generate if doesn't exist)
  getOrCreateKey: async (): Promise<string> => {
    let key = await secureStore.getItem(ENCRYPTION_KEY_STORE_KEY);
    if (!key) {
      key = await encryptionKeyStore.generateAndStoreKey();
    }
    return key;
  },

  // Get encryption key (returns null if doesn't exist)
  getKey: async (): Promise<string | null> => {
    return await secureStore.getItem(ENCRYPTION_KEY_STORE_KEY);
  },

  // Delete encryption key
  deleteKey: async (): Promise<void> => {
    await secureStore.deleteItem(ENCRYPTION_KEY_STORE_KEY);
  },
};

// Generate random key (simple implementation - in production use crypto.randomBytes)
function generateRandomKey(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return Buffer.from(result).toString('base64');
}
