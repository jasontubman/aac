import { Stack } from 'expo-router';

export default function CaregiverLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="gate" />
      <Stack.Screen name="profiles" />
      <Stack.Screen name="boards" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
    </Stack>
  );
}
