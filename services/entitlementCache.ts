import { appStorage } from './storage';
import type { SubscriptionEntitlement } from '../store/subscriptionStore';
import { SubscriptionStatus, TRIAL_DAYS, GRACE_PERIOD_DAYS } from '../utils/constants';

// Validate subscription status (check if expired, grace period, etc.)
function validateSubscriptionStatus(
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

// Entitlement cache service for offline-first access
class EntitlementCacheService {
  private cache: SubscriptionEntitlement | null = null;

  // Get cached entitlement
  async getEntitlement(): Promise<SubscriptionEntitlement | null> {
    if (this.cache) {
      return this.cache;
    }

    const cached = await appStorage.getSubscriptionEntitlement();
    if (cached) {
      this.cache = cached;
      // Validate and update status
      const currentStatus = validateSubscriptionStatus(cached);
      if (currentStatus !== cached.status) {
        const updated = { ...cached, status: currentStatus };
        await this.setEntitlement(updated);
      }
    }

    return this.cache;
  }

  // Set entitlement cache
  async setEntitlement(entitlement: SubscriptionEntitlement): Promise<void> {
    this.cache = entitlement;
    await appStorage.setSubscriptionEntitlement(entitlement);
  }

  // Get current status
  async getCurrentStatus(): Promise<SubscriptionStatus> {
    const entitlement = await this.getEntitlement();
    if (!entitlement) {
      return 'uninitialized';
    }
    return validateSubscriptionStatus(entitlement);
  }

  // Clear cache
  async clear(): Promise<void> {
    this.cache = null;
    await appStorage.setSubscriptionEntitlement(null as any);
  }
}

export const entitlementCache = new EntitlementCacheService();
