import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { restorePurchases } from '../../services/subscription';
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
});
