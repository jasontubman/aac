import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { appStorage } from '../../services/storage';
import { createProfile, getProfile } from '../../database/queries';
import { initDatabase } from '../../database/init';
import { generateId } from '../../utils/id';
import { initializeCoreBoard } from '../../utils/coreBoard';
import { useProfileStore } from '../../store/profileStore';
import { presentPaywall } from '../../services/revenueCatPaywall';
import { initializeRevenueCat, getOfferings, startTrial } from '../../services/subscription';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import type { PurchasesPackage } from 'react-native-purchases';

type OnboardingStep = 'welcome' | 'profile' | 'subscription' | 'complete';

export const OnboardingFlow: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [profileName, setProfileName] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isLoadingPaywall, setIsLoadingPaywall] = useState(false);
  const [hasStartedTrial, setHasStartedTrial] = useState(false);
  const { setActiveProfile, loadProfiles } = useProfileStore();
  const { initialize: initSubscription, getCurrentStatus } = useSubscriptionStore();

  useEffect(() => {
    // Initialize RevenueCat and subscription store
    const init = async () => {
      try {
        await initializeRevenueCat();
        await initSubscription();
      } catch (error) {
        console.error('Error initializing subscription:', error);
      }
    };
    init();
  }, []);

  const handleCreateProfile = async () => {
    if (!profileName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for the profile.');
      return;
    }

    setIsCreatingProfile(true);
    try {
      await initDatabase();
      const profileId = generateId();
      await createProfile(profileId, profileName.trim());
      
      // Create core board for the profile
      await initializeCoreBoard(profileId);
      
      // Set as active profile
      const profile = await getProfile(profileId);
      if (profile) {
        await setActiveProfile(profile);
        await loadProfiles();
      }
      
      // Move to subscription step
      setStep('subscription');
    } catch (error) {
      console.error('Error creating profile:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setIsLoadingPaywall(true);
      
      // Initialize RevenueCat first
      await initializeRevenueCat();
      
      // Start the trial (validates with RevenueCat)
      await startTrial();
      
      // Refresh subscription store to get latest status
      await initSubscription();
      const status = getCurrentStatus();
      
      // Verify trial was started successfully
      if (status === 'trial_active' || status === 'active_subscribed') {
        setHasStartedTrial(true);
        
        // Mark onboarding as complete and navigate
        await appStorage.setOnboardingCompleted(true);
        router.replace('/(tabs)');
      } else {
        // Trial didn't start - show error
        Alert.alert(
          'Unable to Start Trial',
          'Please check your internet connection and try again. You can also view subscription plans to get started.',
          [
            { text: 'Try Again', onPress: handleStartTrial },
            { text: 'View Plans', onPress: handleShowPaywall },
          ]
        );
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      Alert.alert(
        'Error Starting Trial',
        'We couldn\'t start your trial. Please try viewing subscription plans instead.',
        [
          { text: 'OK' },
          { text: 'View Plans', onPress: handleShowPaywall },
        ]
      );
    } finally {
      setIsLoadingPaywall(false);
    }
  };

  const handleShowPaywall = async () => {
    try {
      setIsLoadingPaywall(true);
      
      // Ensure RevenueCat is initialized
      await initializeRevenueCat();
      
      // Present RevenueCat paywall
      await presentPaywall();
      
      // Refresh subscription status after paywall is dismissed
      await initSubscription();
      
      // Validate with RevenueCat to get latest entitlements
      const { getCustomerInfo, updateEntitlementCache } = await import('../../services/subscription');
      try {
        const customerInfo = await getCustomerInfo();
        await updateEntitlementCache(customerInfo);
      } catch (error) {
        console.log('Could not validate with RevenueCat (offline mode):', error);
      }
      
      // Check subscription status
      await initSubscription();
      const status = getCurrentStatus();
      
      if (status === 'trial_active' || status === 'active_subscribed' || status === 'grace_period') {
        // User started trial or purchased - complete onboarding
        await appStorage.setOnboardingCompleted(true);
        router.replace('/(tabs)');
      }
      // If user cancelled or no subscription, they stay on this screen
    } catch (error: any) {
      // User cancellation is handled gracefully by presentPaywall
      if (error.message && !error.message.includes('cancelled') && !error.message.includes('USER_CANCELLED')) {
        console.error('Error showing paywall:', error);
        Alert.alert(
          'Error',
          'Unable to load subscription options. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoadingPaywall(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    // This should only be called after trial/purchase is confirmed
    // Mark onboarding as complete
    await appStorage.setOnboardingCompleted(true);
    // Navigate to main app
    router.replace('/(tabs)');
  };

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl }
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to Easy AAC</Text>
            <Text style={styles.subtitle}>
              An offline-first communication app designed for kids
            </Text>
            <Text style={styles.description}>
              Get started with a 14-day free trial. No credit card required.
            </Text>
            
            <View style={styles.features}>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>📱</Text>
                <Text style={styles.featureText}>Simple, kid-friendly interface</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🔒</Text>
                <Text style={styles.featureText}>Kid mode prevents accidental changes</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>📚</Text>
                <Text style={styles.featureText}>Core vocabulary included</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>💬</Text>
                <Text style={styles.featureText}>Tap to speak functionality</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setStep('profile')}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Profile Creation Screen
  if (step === 'profile') {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl }
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Create a Profile</Text>
            <Text style={styles.subtitle}>
              Set up a profile for the person who will use this app
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={profileName}
                onChangeText={setProfileName}
                placeholder="Enter name"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateProfile}
              />
            </View>

            {isCreatingProfile ? (
              <ActivityIndicator size="large" color={colors.primary[500]} />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleCreateProfile}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Subscription Screen - REQUIRED before accessing app
  if (step === 'subscription') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl }
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Unlock Easy AAC Pro</Text>
            <Text style={styles.subtitle}>
              Start your 14-day free trial or subscribe now to access all features
            </Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required to continue</Text>
            </View>
            
            <View style={styles.features}>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✨</Text>
                <Text style={styles.featureText}>Custom boards and routines</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>📸</Text>
                <Text style={styles.featureText}>Add photos and symbols</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>👥</Text>
                <Text style={styles.featureText}>Multiple profiles</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🎯</Text>
                <Text style={styles.featureText}>Emotion flow feature</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🔒</Text>
                <Text style={styles.featureText}>Kid-safe caregiver mode</Text>
              </View>
            </View>

            {isLoadingPaywall ? (
              <ActivityIndicator size="large" color={colors.primary[500]} />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleShowPaywall}
                >
                  <Text style={styles.primaryButtonText}>View Subscription Plans</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleStartTrial}
                >
                  <Text style={styles.secondaryButtonText}>Start Free Trial</Text>
                </TouchableOpacity>
                
                <Text style={styles.trialNote}>
                  Start your 14-day free trial to explore all features. No credit card required.
                </Text>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    ...typography.heading.h1,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body.small,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  requiredBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xxl,
  },
  requiredText: {
    ...typography.body.small,
    color: colors.primary[700],
    fontWeight: '600',
  },
  features: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  featureText: {
    ...typography.body.medium,
    color: colors.text.primary,
    flex: 1,
  },
  inputContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.label.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    ...typography.body.medium,
    color: colors.text.primary,
    backgroundColor: colors.background.light,
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    ...typography.button.large,
    color: colors.text.light,
  },
  secondaryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.button.medium,
    color: colors.primary[500],
  },
  trialNote: {
    ...typography.body.small,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  subscriptionHeader: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  subscriptionFooter: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
