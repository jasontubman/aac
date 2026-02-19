import { Stack } from 'expo-router';
import { colors, typography } from '../../theme';

export default function CaregiverLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background.light,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          ...typography.heading.h2,
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background.light,
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Caregiver Mode',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="gate" 
        options={{
          title: 'Caregiver Access',
          headerShown: false, // Gate screen uses custom layout
        }}
      />
      <Stack.Screen 
        name="profiles" 
        options={{
          title: 'Profiles',
        }}
      />
      <Stack.Screen 
        name="boards" 
        options={{
          title: 'Boards',
        }}
      />
      <Stack.Screen 
        name="subscription" 
        options={{
          title: 'Subscription',
        }}
      />
      <Stack.Screen 
        name="settings" 
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen 
        name="privacy" 
        options={{
          title: 'Privacy Policy',
        }}
      />
      <Stack.Screen 
        name="terms" 
        options={{
          title: 'Terms of Service',
        }}
      />
    </Stack>
  );
}
