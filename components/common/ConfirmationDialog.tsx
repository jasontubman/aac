import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal={true}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog} accessibilityRole="alert">
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              accessibilityLabel={cancelLabel}
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                destructive ? styles.destructiveButton : styles.confirmButton,
              ]}
              onPress={onConfirm}
              accessibilityLabel={confirmLabel}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  destructive && styles.destructiveButtonText,
                ]}
              >
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialog: {
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    ...typography.heading.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.neutral[200],
  },
  confirmButton: {
    backgroundColor: colors.primary[500],
  },
  destructiveButton: {
    backgroundColor: colors.error,
  },
  cancelButtonText: {
    ...typography.button.medium,
    color: colors.text.primary,
  },
  confirmButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  destructiveButtonText: {
    color: colors.text.light,
  },
});
