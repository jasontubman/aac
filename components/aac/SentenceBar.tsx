import React, { memo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useAACStore } from '../../store/aacStore';

export const SentenceBar = memo(() => {
  const { sentence, sentenceText } = useAACStore();

  if (sentence.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.text}>{sentenceText}</Text>
      </ScrollView>
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
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.body.large,
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
});
