import Purchases, { 
  CustomerInfo, 
  PurchasesOffering, 
  PurchasesPackage,
  PurchasesError,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { appStorage } from './storage';
import { entitlementCache } from './entitlementCache';
import {
  SUBSCRIPTION_PRODUCTS,
  ENTITLEMENT_IDENTIFIER,
  TRIAL_DAYS,
  GRACE_PERIOD_DAYS,
  SubscriptionStatus,
} from '../utils/constants';
import type { SubscriptionEntitlement } from '../store/subscriptionStore';

// RevenueCat API Key (test key for development)
// In production, use environment variables
const REVENUECAT_API_KEY = 'test_sceaVJYxWTNqFLWkHQAZFXsYUnN';

// Get RevenueCat API keys from Expo config (set via environment variables) or use test key
const getRevenueCatApiKey = (): string => {
  // First try to get from environment variables
  const config = Constants.expoConfig?.extra?.revenueCatApiKey;
  
  if (config) {
    const platformKey = Platform.OS === 'ios' ? config.ios : config.android;
    
    if (platformKey && platformKey !== 'your_ios_api_key_here' && platformKey !== 'your_android_api_key_here') {
      return platformKey;
    }
  }

  // Fallback to test key if environment variables not set
  // In production, you should always use environment variables
  if (__DEV__) {
    console.warn('Using test RevenueCat API key. Set REVENUECAT_API_KEY_IOS and REVENUECAT_API_KEY_ANDROID for production.');
    return REVENUECAT_API_KEY;
  }

  throw new Error(`RevenueCat API key not configured for ${Platform.OS}. Please set environment variables.`);
};

let isInitialized = false;

// Initialize RevenueCat
export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    const apiKey = getRevenueCatApiKey();
    
    if (!apiKey) {
      throw new Error(`RevenueCat API key not configured for ${Platform.OS}. Please set environment variables.`);
    }
    
    await Purchases.configure({ apiKey });
    
    if (userId) {
      await Purchases.logIn(userId);
    }

    isInitialized = true;
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
    throw error;
  }
}

// Get available offerings
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Error getting offerings:', error);
    return null;
  }
}

// Purchase subscription with comprehensive error handling
export async function purchaseSubscription(
  packageToPurchase: PurchasesPackage
): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    await updateEntitlementCache(customerInfo);
    return customerInfo;
  } catch (error: any) {
    const purchasesError = error as PurchasesError;
    
    // Handle specific error cases
    if (purchasesError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      throw new Error('Purchase cancelled');
    }
    
    if (purchasesError.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
      throw new Error('Payment is pending. Please complete the payment.');
    }
    
    if (purchasesError.code === PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR) {
      throw new Error('Purchase is invalid. Please try again.');
    }
    
    if (purchasesError.code === PURCHASES_ERROR_CODE.NETWORK_ERROR) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    console.error('Error purchasing subscription:', purchasesError);
    throw new Error(purchasesError.message || 'An error occurred during purchase');
  }
}

// Restore purchases
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    await updateEntitlementCache(customerInfo);
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
}

// Get customer info
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Error getting customer info:', error);
    throw error;
  }
}

// Update entitlement cache from RevenueCat customer info
async function updateEntitlementCache(customerInfo: CustomerInfo): Promise<void> {
  const entitlement = customerInfo.entitlements.active[ENTITLEMENT_IDENTIFIER];
  const now = Date.now();

  let status: SubscriptionStatus = 'uninitialized';
  let expiresAt: number | null = null;
  let productId: string | null = null;

  if (entitlement) {
    // Active subscription or lifetime purchase
    if (entitlement.willRenew === false) {
      // Lifetime purchase - never expires
      status = 'active_subscribed';
      expiresAt = null; // Lifetime never expires
    } else {
      // Subscription with renewal
      status = 'active_subscribed';
      expiresAt = entitlement.expirationDate ? new Date(entitlement.expirationDate).getTime() : null;
    }
    productId = entitlement.productIdentifier || null;
  } else {
    // Check if we have a cached entitlement
    const cached = await appStorage.getSubscriptionEntitlement();
    if (cached) {
      status = cached.status;
      expiresAt = cached.expiresAt;
      productId = cached.productId;
    }
  }

  const entitlementData: SubscriptionEntitlement = {
    status,
    expiresAt,
    productId,
    lastValidatedAt: now,
    trialStartedAt: null, // Will be set on first launch
    gracePeriodEndsAt: null,
  };

  // Update cache
  await appStorage.setSubscriptionEntitlement(entitlementData);
  await entitlementCache.setEntitlement(entitlementData);
}

// Start trial (on first launch)
export async function startTrial(): Promise<SubscriptionEntitlement> {
  const now = Date.now();
  const trialEndsAt = now + TRIAL_DAYS * 24 * 60 * 60 * 1000;

  const entitlement: SubscriptionEntitlement = {
    status: 'trial_active',
    expiresAt: trialEndsAt,
    productId: null,
    lastValidatedAt: now,
    trialStartedAt: now,
    gracePeriodEndsAt: null,
  };

  await appStorage.setSubscriptionEntitlement(entitlement);
  await entitlementCache.setEntitlement(entitlement);

  return entitlement;
}

// Check if user has Easy AAC Pro entitlement
export async function hasProEntitlement(): Promise<boolean> {
  try {
    const customerInfo = await getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_IDENTIFIER] !== undefined;
  } catch (error) {
    console.error('Error checking entitlement:', error);
    // Fallback to cached entitlement
    const cached = await appStorage.getSubscriptionEntitlement();
    return cached?.status === 'active_subscribed' || cached?.status === 'trial_active';
  }
}

// Check if feature is available
export function isFeatureAvailable(
  feature: string,
  status: SubscriptionStatus
): boolean {
  // Always available features
  const alwaysAvailable = [
    'core_board',
    'speak',
    'basic_tts',
    'high_contrast_theme',
    'reduced_motion',
  ];

  if (alwaysAvailable.includes(feature)) {
    return true;
  }

  // Full access during trial, active subscription, or grace period
  if (
    status === 'trial_active' ||
    status === 'active_subscribed' ||
    status === 'grace_period'
  ) {
    return true;
  }

  // Limited mode - subscription required features disabled
  return false;
}
