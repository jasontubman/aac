import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import { appStorage } from './storage';
import { entitlementCache } from './entitlementCache';
import {
  SUBSCRIPTION_PRODUCTS,
  TRIAL_DAYS,
  GRACE_PERIOD_DAYS,
  SubscriptionStatus,
} from '../utils/constants';
import type { SubscriptionEntitlement } from '../store/subscriptionStore';

// RevenueCat API key (should be set via environment variables in production)
const REVENUECAT_API_KEY = {
  ios: 'your_ios_api_key_here',
  android: 'your_android_api_key_here',
};

let isInitialized = false;

// Initialize RevenueCat
export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY.ios : REVENUECAT_API_KEY.android;
    
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

// Purchase subscription
export async function purchaseSubscription(
  packageToPurchase: PurchasesPackage
): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    await updateEntitlementCache(customerInfo);
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      throw new Error('Purchase cancelled');
    }
    console.error('Error purchasing subscription:', error);
    throw error;
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
  const entitlement = customerInfo.entitlements.active['premium_access'];
  const now = Date.now();

  let status: SubscriptionStatus = 'uninitialized';
  let expiresAt: number | null = null;
  let productId: string | null = null;

  if (entitlement) {
    // Active subscription
    status = 'active_subscribed';
    expiresAt = entitlement.expirationDate ? new Date(entitlement.expirationDate).getTime() : null;
    productId = entitlement.productIdentifier || null;
  } else {
    // Check if we have a cached entitlement
    const cached = appStorage.getSubscriptionEntitlement();
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
  appStorage.setSubscriptionEntitlement(entitlementData);
  entitlementCache.setEntitlement(entitlementData);
}

// Start trial (on first launch)
export function startTrial(): SubscriptionEntitlement {
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

  appStorage.setSubscriptionEntitlement(entitlement);
  entitlementCache.setEntitlement(entitlement);

  return entitlement;
}

// Validate subscription status (check if expired, grace period, etc.)
export function validateSubscriptionStatus(
  entitlement: SubscriptionEntitlement
): SubscriptionStatus {
  const now = Date.now();

  // Check trial
  if (entitlement.trialStartedAt) {
    const trialEndsAt = entitlement.trialStartedAt + TRIAL_DAYS * 24 * 60 * 60 * 1000;
    if (now < trialEndsAt) {
      return 'trial_active';
    }
  }

  // Check active subscription
  if (entitlement.expiresAt && now < entitlement.expiresAt) {
    return 'active_subscribed';
  }

  // Check grace period
  if (entitlement.expiresAt) {
    const gracePeriodEndsAt = entitlement.expiresAt + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
    if (now < gracePeriodEndsAt) {
      return 'grace_period';
    }
  }

  return 'expired_limited_mode';
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
