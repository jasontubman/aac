import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface EmotionSuggestionProps {
  suggestedEmotion: 'frustrated' | 'angry' | 'overwhelmed';
  onSelect: () => void;
  onDismiss: () => void;
}

export const EmotionSuggestion: React.FC<EmotionSuggestionProps> = ({
  suggestedEmotion,
  onSelect,
  onDismiss,
}) => {
  const emotionLabels: Record<string, string> = {
    frustrated: 'Frustrated',
    angry: 'Angry',
    overwhelmed: 'Overwhelmed',
  };

  const emotionEmojis: Record<string, string> = {
    frustrated: '😤',
    angry: '😠',
    overwhelmed: '😰',
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{emotionEmojis[suggestedEmotion]}</Text>
        <Text style={styles.text}>
          It looks like you might be feeling{' '}
          <Text style={styles.emotionText}>
            {emotionLabels[suggestedEmotion].toLowerCase()}
          </Text>
          . Would you like to use the emotion flow?
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.yesButton} onPress={onSelect}>
            <Text style={styles.yesButtonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.noButton} onPress={onDismiss}>
            <Text style={styles.noButtonText}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  content: {
    backgroundColor: colors.secondary[50],
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.secondary[300],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  text: {
    ...typography.body.medium,
    textAlign: 'center',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  emotionText: {
    fontWeight: '700',
    color: colors.secondary[700],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  yesButton: {
    flex: 1,
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  yesButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  noButton: {
    flex: 1,
    backgroundColor: colors.neutral[200],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  noButtonText: {
    ...typography.button.medium,
    color: colors.text.primary,
  },
});
