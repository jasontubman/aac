import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { POLICY_URLS, shouldUseInAppScreens } from '../../utils/policyUrls';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [useInApp, setUseInApp] = useState(true);

  useEffect(() => {
    setUseInApp(shouldUseInAppScreens());
  }, []);

  const handleOpenHostedPolicy = async () => {
    if (POLICY_URLS.privacy) {
      const canOpen = await Linking.canOpenURL(POLICY_URLS.privacy);
      if (canOpen) {
        await Linking.openURL(POLICY_URLS.privacy);
      } else {
        alert('Unable to open privacy policy. Please check your internet connection.');
      }
    }
  };

  const handleDeleteData = () => {
    // Data deletion would be implemented here
    // This would clear all local data including profiles, boards, etc.
    alert('Data deletion feature will be implemented');
  };

  // If using hosted URLs, show a link to open them
  if (!useInApp && POLICY_URLS.privacy) {
    return (
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <Text style={styles.text}>
          Our Privacy Policy is available online. Click the button below to view it in your browser.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleOpenHostedPolicy}>
          <Text style={styles.buttonText}>Open Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          You can also access it at:{'\n'}
          <Text style={styles.link}>{POLICY_URLS.privacy}</Text>
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
    >
      <Text style={styles.title}>Privacy Policy</Text>
      
      <View style={styles.section}>
        <Text style={styles.heading}>Data Collection</Text>
        <Text style={styles.text}>
          Simple AAC does not collect, store, or transmit any personal data. All data is stored locally on your device only.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>No Tracking</Text>
        <Text style={styles.text}>
          We do not use analytics, tracking, or advertising SDKs. We do not track your usage or behavior.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>No Cloud Storage</Text>
        <Text style={styles.text}>
          All data including boards, buttons, photos, and routines are stored locally on your device. We do not have access to your data.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Subscriptions</Text>
        <Text style={styles.text}>
          Subscription purchases are processed through Apple App Store or Google Play Store. We use RevenueCat to manage subscriptions, which only handles receipt validation. No personal information is required.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>COPPA Compliance</Text>
        <Text style={styles.text}>
          This app is designed for children and complies with COPPA (Children's Online Privacy Protection Act). We do not collect any information from children.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Data Deletion</Text>
        <Text style={styles.text}>
          You can delete all app data at any time. This will permanently remove all profiles, boards, photos, and routines from your device.
        </Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteData}>
          <Text style={styles.deleteButtonText}>Delete All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Contact</Text>
        <Text style={styles.text}>
          For privacy questions or concerns, please contact us through the app store listing.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last updated: {new Date().toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    padding: spacing.md,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  buttonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  link: {
    color: colors.primary[600],
    textDecorationLine: 'underline',
  },
  title: {
    ...typography.heading.h1,
    marginBottom: spacing.xl,
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  heading: {
    ...typography.heading.h2,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  text: {
    ...typography.body.medium,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  deleteButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  deleteButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  footer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  footerText: {
    ...typography.body.small,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
