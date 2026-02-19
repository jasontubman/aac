import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDatabase } from '../database/init';
import { useUIStore } from '../store/uiStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useProfileStore } from '../store/profileStore';
import { startTrial } from '../services/subscription';
import { appStorage } from '../services/storage';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { initialize: initUI } = useUIStore();
  const { initialize: initSubscription } = useSubscriptionStore();
  const { initialize: initProfile } = useProfileStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize app (optimized for cold start)
    const initializeApp = async () => {
      try {
        // Initialize critical stores first (non-blocking)
        await initUI();
        await initSubscription();

        // Initialize database in parallel
        const dbInit = initDatabase();
        
        // Initialize profile (depends on DB)
        const profileInit = dbInit.then(() => initProfile());

        // Start trial on first launch (non-blocking)
        if (await appStorage.isFirstLaunch()) {
          await startTrial();
          await appStorage.setFirstLaunch(false);
        }

        // Wait for critical initialization
        await Promise.all([dbInit, profileInit]);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsInitialized(true); // Still set to true to allow app to render
      }
    };

    // Don't block render - initialize in background
    initializeApp();
  }, []);

  // Check if onboarding should be shown and enforce subscription requirement
  useEffect(() => {
    if (!isInitialized) return;

    const checkOnboardingAndSubscription = async () => {
      const onboardingCompleted = await appStorage.isOnboardingCompleted();
      const currentRoute = segments[0];
      
      // If onboarding not completed and not already on onboarding screen, redirect
      if (!onboardingCompleted && currentRoute !== 'onboarding') {
        router.replace('/onboarding');
        return;
      }
      
      // If onboarding completed, check subscription status
      if (onboardingCompleted) {
        // Check if user has active trial or subscription
        await initSubscription();
        const { getCurrentStatus } = useSubscriptionStore.getState();
        const status = getCurrentStatus();
        
        // If no trial/subscription and not on onboarding, redirect to onboarding
        if (status === 'uninitialized' && currentRoute !== 'onboarding') {
          // Reset onboarding to force subscription flow
          await appStorage.setOnboardingCompleted(false);
          router.replace('/onboarding');
          return;
        }
        
        // If on onboarding screen but already completed, redirect to main app
        if (currentRoute === 'onboarding') {
          router.replace('/(tabs)');
        }
      }
    };

    checkOnboardingAndSubscription();
  }, [isInitialized, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#ffffff',
            },
          }}
        >
          <Stack.Screen 
            name="onboarding" 
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="caregiver" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
