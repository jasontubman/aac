// Performance optimization utilities

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Validate URI and return image source
 * Returns null if URI is invalid, empty, or not suitable for Image component
 */
export function isValidImageUri(uri: string | null | undefined): boolean {
  if (!uri || typeof uri !== 'string' || uri.trim().length === 0) {
    return false;
  }
  // Check if it's a valid URI format (http://, https://, file://, or data:)
  const uriPattern = /^(https?:\/\/|file:\/\/|data:)/i;
  return uriPattern.test(uri.trim());
}

/**
 * Get image source with validation
 * Returns null if URI is invalid, which can be used to conditionally render Image
 */
export function getImageSource(uri: string | null | undefined): { uri: string } | number | null {
  if (!isValidImageUri(uri)) {
    return null;
  }
  return { uri: uri!.trim() };
}

/**
 * Preload images for better performance
 */
export async function preloadImages(uris: string[]): Promise<void> {
  // Image preloading would be implemented here
  // Using expo-image or react-native-fast-image
  return Promise.resolve();
}

/**
 * Optimize image size for display
 */
export function getOptimizedImageSize(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 400,
  maxHeight: number = 400
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}
