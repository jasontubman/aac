import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../theme';
import {
  getOfferings,
  purchaseSubscription,
  restorePurchases,
  initializeRevenueCat,
} from '../../services/subscription';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { RestorePurchases } from './RestorePurchases';
import type { PurchasesPackage } from 'react-native-purchases';
import { SUBSCRIPTION_PRICES } from '../../utils/constants';

export const SubscriptionScreen: React.FC = () => {
  const router = useRouter();
  const [offerings, setOfferings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { setEntitlement, initialize } = useSubscriptionStore();

  useEffect(() => {
    loadOfferings();
    initialize();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      await initializeRevenueCat();
      const currentOfferings = await getOfferings();
      setOfferings(currentOfferings);
    } catch (error) {
      console.error('Error loading offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchasing(true);
      await purchaseSubscription(packageToPurchase);
      // Entitlement will be updated automatically
      initialize();
    } catch (error: any) {
      if (error.message !== 'Purchase cancelled') {
        alert('Error purchasing subscription: ' + error.message);
      }
    } finally {
      setPurchasing(false);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Subscription</Text>
      <Text style={styles.description}>
        Get full access to all AAC features including routines, custom boards, photo personalization, and more.
      </Text>

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
      </View>

      <Text style={styles.trialText}>14-day free trial included</Text>

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
            onPress={() => router.push('/caregiver/privacy')}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.linkSeparator}> • </Text>
          <TouchableOpacity
            onPress={() => router.push('/caregiver/terms')}
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
});
