import { create } from 'zustand';
import { appStorage } from '../services/storage';
import { GRACE_PERIOD_DAYS, TRIAL_DAYS, SubscriptionStatus } from '../utils/constants';

export interface SubscriptionEntitlement {
  status: SubscriptionStatus;
  expiresAt: number | null;
  productId: string | null;
  lastValidatedAt: number;
  trialStartedAt: number | null;
  gracePeriodEndsAt: number | null;
}

interface SubscriptionState {
  entitlement: SubscriptionEntitlement | null;
  isLoading: boolean;
  
  // Actions
  setEntitlement: (entitlement: SubscriptionEntitlement) => void;
  getCurrentStatus: () => SubscriptionStatus;
  isFeatureAvailable: (feature: string) => boolean;
  initialize: () => void;
  validateStatus: () => SubscriptionStatus;
}

// Features that require subscription
const SUBSCRIPTION_REQUIRED_FEATURES = [
  'routines',
  'custom_boards',
  'photo_additions',
  'multi_profile',
  'emotion_flow',
  'board_editing',
  'switch_scanning',
  'dwell_selection',
  'grid_size_adjustment',
];

// Features always available
const ALWAYS_AVAILABLE_FEATURES = [
  'core_board',
  'speak',
  'basic_tts',
  'high_contrast_theme',
  'reduced_motion',
];

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  entitlement: null,
  isLoading: false,

  setEntitlement: (entitlement: SubscriptionEntitlement) => {
    set({ entitlement });
    appStorage.setSubscriptionEntitlement(entitlement);
  },

  getCurrentStatus: (): SubscriptionStatus => {
    const { entitlement } = get();
    if (!entitlement) {
      return 'uninitialized';
    }
    return get().validateStatus();
  },

  validateStatus: (): SubscriptionStatus => {
    const { entitlement } = get();
    if (!entitlement) {
      return 'uninitialized';
    }

    const now = Date.now();

    // Check if trial is active
    if (entitlement.trialStartedAt) {
      const trialEndsAt = entitlement.trialStartedAt + TRIAL_DAYS * 24 * 60 * 60 * 1000;
      if (now < trialEndsAt) {
        return 'trial_active';
      }
    }

    // Check if subscription is active
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
  },

  isFeatureAvailable: (feature: string): boolean => {
    // Always available features
    if (ALWAYS_AVAILABLE_FEATURES.includes(feature)) {
      return true;
    }

    // Check subscription status
    const status = get().getCurrentStatus();
    
    // Full access during trial or active subscription
    if (status === 'trial_active' || status === 'active_subscribed' || status === 'grace_period') {
      return true;
    }

    // Limited mode - only core features
    if (status === 'expired_limited_mode') {
      return false; // Subscription required features are disabled
    }

    // Uninitialized - allow all (will start trial)
    return true;
  },

  initialize: () => {
    const cached = appStorage.getSubscriptionEntitlement();
    if (cached) {
      set({ entitlement: cached });
      // Validate and update status
      const currentStatus = get().validateStatus();
      if (currentStatus !== cached.status) {
        const updated = { ...cached, status: currentStatus };
        get().setEntitlement(updated);
      }
    } else {
      // First launch - initialize as uninitialized
      const initial: SubscriptionEntitlement = {
        status: 'uninitialized',
        expiresAt: null,
        productId: null,
        lastValidatedAt: Date.now(),
        trialStartedAt: null,
        gracePeriodEndsAt: null,
      };
      set({ entitlement: initial });
      appStorage.setSubscriptionEntitlement(initial);
    }
  },
}));
