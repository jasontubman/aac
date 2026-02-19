import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from '../database/init';
import { useUIStore } from '../store/uiStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useProfileStore } from '../store/profileStore';
import { startTrial } from '../services/subscription';
import { appStorage } from '../services/storage';

export default function RootLayout() {
  const { initialize: initUI } = useUIStore();
  const { initialize: initSubscription } = useSubscriptionStore();
  const { initialize: initProfile } = useProfileStore();

  useEffect(() => {
    // Initialize app (optimized for cold start)
    const initializeApp = async () => {
      try {
        // Initialize critical stores first (non-blocking)
        initUI();
        initSubscription();

        // Initialize database in parallel
        const dbInit = initDatabase();
        
        // Initialize profile (depends on DB)
        const profileInit = dbInit.then(() => initProfile());

        // Start trial on first launch (non-blocking)
        if (appStorage.isFirstLaunch()) {
          startTrial();
          appStorage.setFirstLaunch(false);
        }

        // Wait for critical initialization
        await Promise.all([dbInit, profileInit]);
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    // Don't block render - initialize in background
    initializeApp();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="caregiver" />
      </Stack>
    </>
  );
}
