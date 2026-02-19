// Simple encryption utilities for sensitive data
// Note: For production, consider using a more robust encryption library

import { encryptionKeyStore } from '../services/secureStore';

// Simple XOR encryption (for basic obfuscation)
// In production, use proper encryption like AES-256
export async function encryptData(data: string): Promise<string> {
  const key = await encryptionKeyStore.getOrCreateKey();
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    const keyChar = key.charCodeAt(i % key.length);
    const dataChar = data.charCodeAt(i);
    encrypted += String.fromCharCode(dataChar ^ keyChar);
  }
  return Buffer.from(encrypted).toString('base64');
}

export async function decryptData(encryptedData: string): Promise<string> {
  const key = await encryptionKeyStore.getKey();
  if (!key) {
    throw new Error('Encryption key not found');
  }
  const data = Buffer.from(encryptedData, 'base64').toString('binary');
  let decrypted = '';
  for (let i = 0; i < data.length; i++) {
    const keyChar = key.charCodeAt(i % key.length);
    const dataChar = data.charCodeAt(i);
    decrypted += String.fromCharCode(dataChar ^ keyChar);
  }
  return decrypted;
}

// Encrypt object (convert to JSON first)
export async function encryptObject<T>(obj: T): Promise<string> {
  const json = JSON.stringify(obj);
  return encryptData(json);
}

// Decrypt object (parse JSON after decryption)
export async function decryptObject<T>(encrypted: string): Promise<T> {
  const json = await decryptData(encrypted);
  return JSON.parse(json) as T;
}
