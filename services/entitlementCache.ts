import { appStorage } from './storage';
import { validateSubscriptionStatus } from './subscription';
import type { SubscriptionEntitlement } from '../store/subscriptionStore';
import { SubscriptionStatus } from '../utils/constants';

// Entitlement cache service for offline-first access
class EntitlementCacheService {
  private cache: SubscriptionEntitlement | null = null;

  // Get cached entitlement
  getEntitlement(): SubscriptionEntitlement | null {
    if (this.cache) {
      return this.cache;
    }

    const cached = appStorage.getSubscriptionEntitlement();
    if (cached) {
      this.cache = cached;
      // Validate and update status
      const currentStatus = validateSubscriptionStatus(cached);
      if (currentStatus !== cached.status) {
        const updated = { ...cached, status: currentStatus };
        this.setEntitlement(updated);
      }
    }

    return this.cache;
  }

  // Set entitlement cache
  setEntitlement(entitlement: SubscriptionEntitlement): void {
    this.cache = entitlement;
    appStorage.setSubscriptionEntitlement(entitlement);
  }

  // Get current status
  getCurrentStatus(): SubscriptionStatus {
    const entitlement = this.getEntitlement();
    if (!entitlement) {
      return 'uninitialized';
    }
    return validateSubscriptionStatus(entitlement);
  }

  // Clear cache
  clear(): void {
    this.cache = null;
    appStorage.setSubscriptionEntitlement(null as any);
  }
}

export const entitlementCache = new EntitlementCacheService();
