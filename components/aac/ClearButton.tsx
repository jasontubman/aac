import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useAACStore } from '../../store/aacStore';

interface ClearButtonProps {
  onPress?: () => void;
}

export const ClearButton = memo<ClearButtonProps>(({ onPress }) => {
  const { clearSentence, sentence } = useAACStore();

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    clearSentence();
  };

  if (sentence.length === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel="Clear sentence"
      accessibilityRole="button"
    >
      <Text style={styles.text}>Clear</Text>
    </TouchableOpacity>
  );
});

ClearButton.displayName = 'ClearButton';

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...typography.button.medium,
    color: colors.text.light,
  },
});
