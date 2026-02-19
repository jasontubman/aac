/**
 * RevenueCat Customer Center Integration
 * 
 * Provides functions to present RevenueCat's Customer Center UI
 * Documentation: https://www.revenuecat.com/docs/tools/customer-center
 */

import PurchasesUI from 'react-native-purchases-ui';
import { Alert } from 'react-native';

/**
 * Present the RevenueCat Customer Center
 * Allows users to manage subscriptions, restore purchases, view purchase history, etc.
 * @returns Promise that resolves when customer center is dismissed
 */
export async function presentCustomerCenter(): Promise<void> {
  try {
    await PurchasesUI.presentCustomerCenter();
  } catch (error: any) {
    console.error('Error presenting customer center:', error);
    
    // Handle user cancellation gracefully
    if (error.code === 'USER_CANCELLED' || error.message?.includes('cancelled')) {
      // User cancelled - this is fine, don't show error
      return;
    }
    
    // Show error for other cases
    Alert.alert(
      'Unable to Load Customer Center',
      'Please check your internet connection and try again.',
      [{ text: 'OK' }]
    );
    throw error;
  }
}

/**
 * Check if customer center can be presented
 */
export async function canPresentCustomerCenter(): Promise<boolean> {
  try {
    // Customer center is always available if RevenueCat is initialized
    return true;
  } catch (error) {
    console.error('Error checking customer center availability:', error);
    return false;
  }
}
