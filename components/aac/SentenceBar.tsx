import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useAACStore } from '../../store/aacStore';
import { useSpeech } from '../../hooks/useSpeech';
import { usageAnalytics } from '../../services/usageAnalytics';

export const SentenceBar = memo(() => {
  const { sentence, sentenceText } = useAACStore();
  const { clearSentence } = useAACStore();
  const { speak } = useSpeech();
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (sentence.length === 0) {
    return null;
  }

  const handleSpeak = async () => {
    if (!sentenceText || isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      await usageAnalytics.logSpeak(sentenceText);
      await speak(sentenceText);
      // Clear sentence after speaking
      setTimeout(() => {
        clearSentence();
      }, 500);
    } catch (error) {
      console.error('Error speaking sentence:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel={`Current sentence: ${sentenceText}`}
      >
        <Text style={styles.text}>{sentenceText}</Text>
      </ScrollView>
      <TouchableOpacity
        style={[styles.speakButton, isSpeaking && styles.speakButtonDisabled]}
        onPress={handleSpeak}
        disabled={isSpeaking}
        accessibilityLabel="Speak sentence"
        accessibilityHint={`Speaks: ${sentenceText}`}
        accessibilityRole="button"
      >
        <Text style={styles.speakButtonText}>
          {isSpeaking ? 'Speaking...' : 'Speak'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

SentenceBar.displayName = 'SentenceBar';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.light,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scrollContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.body.large,
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  speakButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakButtonDisabled: {
    backgroundColor: colors.neutral[300],
    opacity: 0.6,
  },
  speakButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
    fontWeight: '600',
  },
});
