import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useSpeech } from '../../hooks/useSpeech';

interface SpeakButtonProps {
  emotionLabel: string;
  needText: string;
  onComplete: () => void;
  onBack: () => void;
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({
  emotionLabel,
  needText,
  onComplete,
  onBack,
}) => {
  const { speak } = useSpeech();
  const fullText = `I feel ${emotionLabel.toLowerCase()}. ${needText}`;

  const handleSpeak = async () => {
    await speak(fullText);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText} numberOfLines={1} ellipsizeMode="tail">← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.previewLabel}>This will say:</Text>
        <Text style={styles.previewText}>{fullText}</Text>
        
        <TouchableOpacity style={styles.speakButton} onPress={handleSpeak}>
          <Text style={styles.speakButtonText}>Speak</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    padding: spacing.md,
  },
  backButton: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    alignSelf: 'flex-start',
    maxWidth: 120,
  },
  backButtonText: {
    ...typography.button.medium,
    color: colors.primary[600],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewLabel: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  previewText: {
    ...typography.heading.h1,
    textAlign: 'center',
    color: colors.text.primary,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  speakButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.round,
    minWidth: 200,
    alignItems: 'center',
  },
  speakButtonText: {
    ...typography.button.large,
    color: colors.text.light,
    fontSize: 24,
  },
});
