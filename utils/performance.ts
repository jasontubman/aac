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
 * Lazy load images with placeholder
 */
export function getImageSource(uri: string | null | undefined): { uri: string } | number {
  if (!uri) {
    // Return placeholder image
    return require('../assets/icon.png');
  }
  return { uri };
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
