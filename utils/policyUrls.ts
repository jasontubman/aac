/**
 * Policy Document URLs
 * 
 * Update these URLs to point to your hosted policy documents.
 * You can host these on:
 * - GitHub Pages
 * - Your own website
 * - A static hosting service (Netlify, Vercel, etc.)
 * 
 * For development, you can use localhost or keep the in-app screens.
 */

// Set to true to use in-app screens, false to use hosted URLs
const USE_IN_APP_SCREENS = true; // Default to in-app screens until URLs are configured

// Base URL where your policies are hosted
// Example: 'https://yourdomain.com/policies' or 'https://username.github.io/aac-policies'
const POLICY_BASE_URL = 'https://yourdomain.com/policies';

// Policy URLs
export const POLICY_URLS: {
  privacy: string | null;
  terms: string | null;
} = {
  privacy: USE_IN_APP_SCREENS || !POLICY_BASE_URL || POLICY_BASE_URL.includes('yourdomain.com')
    ? null // Will use in-app screen
    : `${POLICY_BASE_URL}/privacy-policy.html`,
  
  terms: USE_IN_APP_SCREENS || !POLICY_BASE_URL || POLICY_BASE_URL.includes('yourdomain.com')
    ? null // Will use in-app screen
    : `${POLICY_BASE_URL}/terms-of-service.html`,
};

/**
 * Check if we should use in-app screens or hosted URLs
 */
export function shouldUseInAppScreens(): boolean {
  return USE_IN_APP_SCREENS || !POLICY_BASE_URL || POLICY_BASE_URL.includes('yourdomain.com');
}
