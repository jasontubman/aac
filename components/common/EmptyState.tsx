import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  icon = '📭',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...typography.body.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 300,
  },
  actionButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  actionButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
});
