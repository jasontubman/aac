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
  purchaseSubscription,
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
import type { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';
import { SUBSCRIPTION_PRICES } from '../../utils/constants';
import { POLICY_URLS, shouldUseInAppScreens } from '../../utils/policyUrls';

export const SubscriptionScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [usePaywall, setUsePaywall] = useState(false);
  const { setEntitlement, initialize } = useSubscriptionStore();

  useEffect(() => {
    const init = async () => {
      await loadOfferings();
      await initialize();
      await checkSubscriptionStatus();
    };
    init();
  }, []);

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

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchasing(true);
      await purchaseSubscription(packageToPurchase);
      // Entitlement will be updated automatically
      await initialize();
      // Mark onboarding as complete if coming from onboarding flow
      const onboardingCompleted = await appStorage.isOnboardingCompleted();
      if (!onboardingCompleted) {
        await appStorage.setOnboardingCompleted(true);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Success', 'Thank you for subscribing to Easy AAC Pro!');
      }
    } catch (error: any) {
      if (error.message !== 'Purchase cancelled') {
        Alert.alert('Purchase Error', error.message || 'An error occurred during purchase.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handlePresentPaywall = async () => {
    try {
      setPurchasing(true);
      await presentPaywall(offerings || undefined);
      // Refresh customer info after paywall dismissal
      await initialize();
      const customerInfo = await getCustomerInfo();
      if (customerInfo.entitlements.active['easy_aac_pro']) {
        Alert.alert('Success', 'Thank you for subscribing to Easy AAC Pro!');
      }
    } catch (error: any) {
      if (error.message && !error.message.includes('cancelled')) {
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

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
    >
      <Text style={styles.title}>Easy AAC Pro</Text>
      <Text style={styles.description}>
        Get full access to all AAC features including routines, custom boards, photo personalization, and more.
      </Text>

      {/* Option to use RevenueCat Paywall */}
      <TouchableOpacity
        style={[styles.paywallButton, usePaywall && styles.paywallButtonActive]}
        onPress={() => setUsePaywall(!usePaywall)}
      >
        <Text style={styles.paywallButtonText}>
          {usePaywall ? '✓ Using RevenueCat Paywall' : 'Use RevenueCat Paywall'}
        </Text>
      </TouchableOpacity>

      {usePaywall ? (
        // RevenueCat Paywall Option
        <View style={styles.paywallContainer}>
          <Text style={styles.paywallDescription}>
            Use RevenueCat's built-in paywall for the best subscription experience.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handlePresentPaywall}
            disabled={purchasing || !offerings}
          >
            <Text style={styles.primaryButtonText}>
              {purchasing ? 'Loading...' : 'View Subscription Options'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Custom Pricing Cards
        <View style={styles.pricingContainer}>
        {/* Monthly */}
        <TouchableOpacity
          style={styles.pricingCard}
          onPress={() => {
            // Handle monthly purchase
            if (offerings?.availablePackages) {
              const monthlyPackage = offerings.availablePackages.find(
                (pkg: PurchasesPackage) => pkg.identifier === 'monthly'
              );
              if (monthlyPackage) {
                handlePurchase(monthlyPackage);
              }
            }
          }}
          disabled={purchasing}
        >
          <Text style={styles.pricingTitle}>Monthly</Text>
          <Text style={styles.pricingPrice}>${SUBSCRIPTION_PRICES.MONTHLY}/month</Text>
          <Text style={styles.pricingDescription}>Billed monthly</Text>
        </TouchableOpacity>

        {/* Annual */}
        <TouchableOpacity
          style={[styles.pricingCard, styles.pricingCardFeatured]}
          onPress={() => {
            // Handle annual purchase
            if (offerings?.availablePackages) {
              const annualPackage = offerings.availablePackages.find(
                (pkg: PurchasesPackage) => pkg.identifier === 'annual'
              );
              if (annualPackage) {
                handlePurchase(annualPackage);
              }
            }
          }}
          disabled={purchasing}
        >
          <Text style={styles.pricingTitle}>Annual</Text>
          <Text style={styles.pricingPrice}>${SUBSCRIPTION_PRICES.ANNUAL}/year</Text>
          <Text style={styles.pricingDescription}>Save 42%</Text>
        </TouchableOpacity>

        {/* Lifetime */}
        <TouchableOpacity
          style={styles.pricingCard}
          onPress={() => {
            // Handle lifetime purchase
            if (offerings?.availablePackages) {
              const lifetimePackage = offerings.availablePackages.find(
                (pkg: PurchasesPackage) => pkg.identifier === 'lifetime'
              );
              if (lifetimePackage) {
                handlePurchase(lifetimePackage);
              }
            }
          }}
          disabled={purchasing}
        >
          <Text style={styles.pricingTitle}>Lifetime</Text>
          <Text style={styles.pricingPrice}>${SUBSCRIPTION_PRICES.LIFETIME}</Text>
          <Text style={styles.pricingDescription}>One-time payment</Text>
        </TouchableOpacity>
      </View>
      )}

      <Text style={styles.trialText}>14-day free trial included</Text>

      {/* Customer Center Button */}
      <TouchableOpacity
        style={styles.customerCenterButton}
        onPress={handlePresentCustomerCenter}
      >
        <Text style={styles.customerCenterButtonText}>Manage Subscription</Text>
      </TouchableOpacity>

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
  pricingContainer: {
    marginBottom: spacing.lg,
  },
  pricingCard: {
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  pricingCardFeatured: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  pricingTitle: {
    ...typography.heading.h2,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  pricingPrice: {
    ...typography.display.medium,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  pricingDescription: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  trialText: {
    ...typography.body.medium,
    textAlign: 'center',
    color: colors.success,
    marginBottom: spacing.lg,
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
  paywallButton: {
    backgroundColor: colors.neutral[100],
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  paywallButtonActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  paywallButtonText: {
    ...typography.body.medium,
    color: colors.text.primary,
  },
  paywallContainer: {
    marginBottom: spacing.lg,
  },
  paywallDescription: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
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
});
