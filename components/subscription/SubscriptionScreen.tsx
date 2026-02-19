import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import {
  getOfferings,
  restorePurchases,
  initializeRevenueCat,
  getCustomerInfo,
  hasProEntitlement,
} from '../../services/subscription';
import { presentPaywall } from '../../services/revenueCatPaywall';
import { presentCustomerCenter } from '../../services/revenueCatCustomerCenter';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { appStorage } from '../../services/storage';
import { RestorePurchases } from './RestorePurchases';
import type { PurchasesOffering } from 'react-native-purchases';
import { POLICY_URLS, shouldUseInAppScreens } from '../../utils/policyUrls';

export const SubscriptionScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { setEntitlement, initialize, getCurrentStatus, entitlement } = useSubscriptionStore();
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      // Always sync with RevenueCat first
      const { syncWithRevenueCat } = await import('../../services/subscription');
      await syncWithRevenueCat();
      
      await loadOfferings();
      await initialize();
      await checkSubscriptionStatus();
      calculateTrialDaysRemaining();
    };
    init();
  }, []);

  useEffect(() => {
    // Recalculate when entitlement changes
    calculateTrialDaysRemaining();
  }, [entitlement]);

  const calculateTrialDaysRemaining = () => {
    const status = getCurrentStatus();
    if (status === 'trial_active' && entitlement?.trialStartedAt) {
      const now = Date.now();
      const trialEndsAt = entitlement.trialStartedAt + (14 * 24 * 60 * 60 * 1000); // 14 days
      const daysRemaining = Math.ceil((trialEndsAt - now) / (24 * 60 * 60 * 1000));
      setTrialDaysRemaining(Math.max(0, daysRemaining));
    } else {
      setTrialDaysRemaining(null);
    }
  };

  const loadOfferings = async () => {
    try {
      setLoading(true);
      await initializeRevenueCat();
      const currentOfferings = await getOfferings();
      setOfferings(currentOfferings);
    } catch (error) {
      console.error('Error loading offerings:', error);
      Alert.alert('Error', 'Unable to load subscription options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const hasPro = await hasProEntitlement();
      if (hasPro) {
        // User already has subscription, show success message or redirect
        Alert.alert('Already Subscribed', 'You already have Easy AAC Pro!');
      }
    } catch (error) {
      // Silent fail - subscription check is optional
      console.log('Subscription check:', error);
    }
  };


  const handlePresentPaywall = async () => {
    try {
      setPurchasing(true);
      await presentPaywall(offerings || undefined);
      
      // Always refresh from RevenueCat after paywall dismissal
      const customerInfo = await getCustomerInfo();
      const { updateEntitlementCache } = await import('../../services/subscription');
      await updateEntitlementCache(customerInfo);
      
      // Refresh subscription store
      await initialize();
      
      // Check if user purchased or started trial
      const status = getCurrentStatus();
      if (status === 'trial_active' || status === 'active_subscribed') {
        // Mark onboarding as complete if coming from onboarding flow
        const onboardingCompleted = await appStorage.isOnboardingCompleted();
        if (!onboardingCompleted) {
          await appStorage.setOnboardingCompleted(true);
          router.replace('/(tabs)');
        } else {
          Alert.alert('Success', 'Thank you for subscribing to Easy AAC Pro!');
        }
      }
    } catch (error: any) {
      if (error.message && !error.message.includes('cancelled') && !error.message.includes('USER_CANCELLED')) {
        Alert.alert('Error', 'Unable to load subscription options.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handlePresentCustomerCenter = async () => {
    try {
      await presentCustomerCenter();
      // Refresh customer info after customer center dismissal
      await initialize();
    } catch (error: any) {
      if (error.message && !error.message.includes('cancelled')) {
        Alert.alert('Error', 'Unable to load customer center.');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const subscriptionStatus = getCurrentStatus();
  const isOnTrial = subscriptionStatus === 'trial_active';
  const isActive = subscriptionStatus === 'active_subscribed';
  const isExpired = subscriptionStatus === 'expired_limited_mode';
  const isGracePeriod = subscriptionStatus === 'grace_period';

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
    >
      <Text style={styles.title}>Easy AAC Pro</Text>
      
      {/* Trial Status Banner */}
      {isOnTrial && trialDaysRemaining !== null && (
        <View style={styles.trialBanner}>
          <Text style={styles.trialBannerTitle}>Free Trial Active</Text>
          <Text style={styles.trialBannerDays}>
            {trialDaysRemaining === 0 
              ? 'Trial ends today' 
              : trialDaysRemaining === 1
              ? '1 day remaining'
              : `${trialDaysRemaining} days remaining`}
          </Text>
          <Text style={styles.trialBannerSubtext}>
            Upgrade now to keep all features after your trial ends
          </Text>
        </View>
      )}

      {/* Active Subscription Banner */}
      {isActive && entitlement?.expiresAt && (
        <View style={styles.activeBanner}>
          <Text style={styles.activeBannerTitle}>✓ Subscription Active</Text>
          <Text style={styles.activeBannerText}>
            Renews on {new Date(entitlement.expiresAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* Grace Period Banner */}
      {isGracePeriod && (
        <View style={styles.graceBanner}>
          <Text style={styles.graceBannerTitle}>Grace Period</Text>
          <Text style={styles.graceBannerText}>
            Your subscription expired. Renew now to continue full access.
          </Text>
        </View>
      )}

      {/* Expired Banner */}
      {isExpired && (
        <View style={styles.expiredBanner}>
          <Text style={styles.expiredBannerTitle}>Subscription Expired</Text>
          <Text style={styles.expiredBannerText}>
            You're using limited mode. Subscribe to restore full access.
          </Text>
        </View>
      )}

      <Text style={styles.description}>
        {isOnTrial 
          ? 'Upgrade now to keep all features after your trial ends. No interruption to your current access.'
          : isActive
          ? 'You have full access to all AAC features including routines, custom boards, photo personalization, and more.'
          : 'Get full access to all AAC features including routines, custom boards, photo personalization, and more.'}
      </Text>

      {/* Subscription Action Button */}
      {isOnTrial ? (
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handlePresentPaywall}
          disabled={purchasing || !offerings}
        >
          <Text style={styles.upgradeButtonText}>
            {purchasing ? 'Loading...' : 'Upgrade Now'}
          </Text>
        </TouchableOpacity>
      ) : !isActive ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePresentPaywall}
          disabled={purchasing || !offerings}
        >
          <Text style={styles.primaryButtonText}>
            {purchasing ? 'Loading...' : 'Subscribe Now'}
          </Text>
        </TouchableOpacity>
      ) : null}


      {/* Customer Center Button */}
      {(isActive || isGracePeriod) && (
        <TouchableOpacity
          style={styles.customerCenterButton}
          onPress={handlePresentCustomerCenter}
        >
          <Text style={styles.customerCenterButtonText}>Manage Subscription</Text>
        </TouchableOpacity>
      )}

      <RestorePurchases />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
        </Text>
        <Text style={styles.footerText}>
          Manage your subscription in your device settings.
        </Text>
        <View style={styles.links}>
          <TouchableOpacity
            onPress={async () => {
              if (shouldUseInAppScreens() || !POLICY_URLS.privacy) {
                router.push('/caregiver/privacy');
              } else {
                const canOpen = await Linking.canOpenURL(POLICY_URLS.privacy);
                if (canOpen) {
                  await Linking.openURL(POLICY_URLS.privacy);
                }
              }
            }}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.linkSeparator}> • </Text>
          <TouchableOpacity
            onPress={async () => {
              if (shouldUseInAppScreens() || !POLICY_URLS.terms) {
                router.push('/caregiver/terms');
              } else {
                const canOpen = await Linking.canOpenURL(POLICY_URLS.terms);
                if (canOpen) {
                  await Linking.openURL(POLICY_URLS.terms);
                }
              }
            }}
          >
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  content: {
    padding: spacing.xl,
  },
  title: {
    ...typography.heading.h1,
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  description: {
    ...typography.body.medium,
    marginBottom: spacing.xl,
    color: colors.text.secondary,
  },
  footer: {
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  linkText: {
    ...typography.body.small,
    color: colors.primary[600],
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginHorizontal: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.button.large,
    color: colors.text.light,
  },
  customerCenterButton: {
    backgroundColor: colors.neutral[100],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  customerCenterButtonText: {
    ...typography.button.medium,
    color: colors.primary[600],
  },
  trialBanner: {
    backgroundColor: colors.primary[50],
    borderWidth: 2,
    borderColor: colors.primary[300],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  trialBannerTitle: {
    ...typography.heading.h3,
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  trialBannerDays: {
    ...typography.display.small,
    color: colors.primary[600],
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  trialBannerSubtext: {
    ...typography.body.small,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  activeBanner: {
    backgroundColor: '#d1fae5', // colors.success with opacity
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  activeBannerTitle: {
    ...typography.heading.h3,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  activeBannerText: {
    ...typography.body.medium,
    color: colors.text.secondary,
  },
  graceBanner: {
    backgroundColor: '#fef3c7', // colors.warning with opacity
    borderWidth: 2,
    borderColor: colors.warning,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  graceBannerTitle: {
    ...typography.heading.h3,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  graceBannerText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  expiredBanner: {
    backgroundColor: '#fee2e2', // colors.error with opacity
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  expiredBannerTitle: {
    ...typography.heading.h3,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  expiredBannerText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: colors.primary[500],
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeButtonText: {
    ...typography.button.large,
    color: colors.text.light,
    fontWeight: 'bold',
  },
});
