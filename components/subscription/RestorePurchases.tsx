import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { restorePurchases } from '../../services/subscription';
import { presentCustomerCenter } from '../../services/revenueCatCustomerCenter';
import { useSubscriptionStore } from '../../store/subscriptionStore';

export const RestorePurchases: React.FC = () => {
  const [restoring, setRestoring] = useState(false);
  const { initialize } = useSubscriptionStore();

  const handleRestore = async () => {
    try {
      setRestoring(true);
      await restorePurchases();
      initialize();
      Alert.alert('Success', 'Purchases restored successfully.');
    } catch (error: any) {
      Alert.alert('Error', 'Could not restore purchases. ' + error.message);
    } finally {
      setRestoring(false);
    }
  };

  const handleCustomerCenter = async () => {
    try {
      await presentCustomerCenter();
      // Refresh after customer center is dismissed
      initialize();
    } catch (error: any) {
      // User cancellation is fine, don't show error
      if (error.message && !error.message.includes('cancelled')) {
        Alert.alert('Error', 'Unable to open customer center.');
      }
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleRestore}
        disabled={restoring}
      >
        <Text style={styles.buttonText}>
          {restoring ? 'Restoring...' : 'Restore Purchases'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.customerCenterButton]}
        onPress={handleCustomerCenter}
      >
        <Text style={styles.customerCenterButtonText}>
          Manage Subscription (Customer Center)
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.neutral[200],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonText: {
    ...typography.button.medium,
    color: colors.text.primary,
  },
  customerCenterButton: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  customerCenterButtonText: {
    ...typography.button.medium,
    color: colors.primary[600],
  },
});
