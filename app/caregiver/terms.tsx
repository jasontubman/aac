import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function TermsScreen() {
  const handleOpenPrivacy = () => {
    // Navigate to privacy policy
    // In production, this could open a web URL or navigate to privacy screen
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>
      
      <View style={styles.section}>
        <Text style={styles.heading}>Acceptance of Terms</Text>
        <Text style={styles.text}>
          By using Simple AAC, you agree to these Terms of Service. If you do not agree, please do not use the app.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Description of Service</Text>
        <Text style={styles.text}>
          Simple AAC is an offline-first communication support application designed to help children communicate. The app provides text-to-speech functionality, communication boards, and related features.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Subscription Terms</Text>
        <Text style={styles.text}>
          • Subscriptions are billed monthly ($4.99) or annually ($34.99)
        </Text>
        <Text style={styles.text}>
          • 14-day free trial included with new subscriptions
        </Text>
        <Text style={styles.text}>
          • Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period
        </Text>
        <Text style={styles.text}>
          • Payment will be charged to your Apple ID or Google Play account at confirmation of purchase
        </Text>
        <Text style={styles.text}>
          • Your subscription will renew automatically unless auto-renew is turned off at least 24 hours before the end of the current period
        </Text>
        <Text style={styles.text}>
          • You can manage and cancel subscriptions in your device settings
        </Text>
        <Text style={styles.text}>
          • No refunds for unused portions of subscription periods
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>User Responsibilities</Text>
        <Text style={styles.text}>
          • You are responsible for maintaining the security of your device
        </Text>
        <Text style={styles.text}>
          • You are responsible for backing up your data
        </Text>
        <Text style={styles.text}>
          • The app is intended for communication support only, not medical diagnosis or treatment
        </Text>
      </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Limitation of Liability</Text>
        <Text style={styles.text}>
          Simple AAC is provided "as is" without warranties of any kind. We are not responsible for any communication outcomes or decisions made based on app usage. This app is a communication support tool and should not replace professional medical or therapeutic advice.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Privacy</Text>
        <Text style={styles.text}>
          Your use of Simple AAC is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Age Restrictions</Text>
        <Text style={styles.text}>
          This app is designed for children but requires adult supervision for setup and subscription management. Users under 13 should have parental consent and supervision.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Changes to Terms</Text>
        <Text style={styles.text}>
          We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Contact</Text>
        <Text style={styles.text}>
          For questions about these terms, please contact us through the app store listing.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last updated: {new Date().toLocaleDateString()}
        </Text>
        <Text style={styles.footerText}>
          Version 1.0.0
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
    marginBottom: spacing.xs,
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
    marginBottom: spacing.xs,
  },
});
