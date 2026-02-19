// Generate unique IDs (simple implementation)
export function generateId(): string {
  // Generate a UUID-like string
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Generate short ID (for display)
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}
