/**
 * RevenueCat Paywall Integration
 * 
 * Provides functions to present RevenueCat's built-in paywall UI
 * Documentation: https://www.revenuecat.com/docs/tools/paywalls
 */

import PurchasesUI from 'react-native-purchases-ui';
import Purchases, { PurchasesOffering } from 'react-native-purchases';
import { Platform, Alert } from 'react-native';

/**
 * Present the RevenueCat Paywall
 * @param offering - The offering to display (optional, uses current offering if not provided)
 * @returns Promise that resolves when paywall is dismissed
 */
export async function presentPaywall(offering?: PurchasesOffering | null): Promise<void> {
  try {
    // Get current offering if not provided
    let currentOffering: PurchasesOffering | null = offering || null;
    if (!currentOffering) {
      const offerings = await Purchases.getOfferings();
      currentOffering = offerings.current;
    }

    if (!currentOffering) {
      throw new Error('No offering available to display');
    }

    // Present the paywall
    await PurchasesUI.presentPaywall({ offering: currentOffering });
  } catch (error: any) {
    console.error('Error presenting paywall:', error);
    
    // Handle user cancellation gracefully
    if (error.code === 'USER_CANCELLED' || error.message?.includes('cancelled')) {
      // User cancelled - this is fine, don't show error
      return;
    }
    
    // Show error for other cases
    Alert.alert(
      'Unable to Load Subscription Options',
      'Please check your internet connection and try again.',
      [{ text: 'OK' }]
    );
    throw error;
  }
}

/**
 * Check if paywall can be presented
 */
export async function canPresentPaywall(): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current !== null;
  } catch (error) {
    console.error('Error checking paywall availability:', error);
    return false;
  }
}
