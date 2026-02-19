import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface Need {
  id: string;
  text: string;
}

// Contextual needs based on emotion
const NEEDS_BY_EMOTION: Record<string, Need[]> = {
  happy: [
    { id: 'play', text: 'I want to play' },
    { id: 'share', text: 'I want to share this' },
    { id: 'more', text: 'I want more' },
  ],
  sad: [
    { id: 'help', text: 'I need help' },
    { id: 'hug', text: 'I need a hug' },
    { id: 'break', text: 'I need a break' },
  ],
  frustrated: [
    { id: 'help', text: 'I need help' },
    { id: 'break', text: 'I need a break' },
    { id: 'different', text: 'I want something different' },
  ],
  excited: [
    { id: 'share', text: 'I want to share this' },
    { id: 'more', text: 'I want more' },
    { id: 'play', text: 'I want to play' },
  ],
  tired: [
    { id: 'rest', text: 'I need to rest' },
    { id: 'break', text: 'I need a break' },
    { id: 'quiet', text: 'I need quiet' },
  ],
  scared: [
    { id: 'help', text: 'I need help' },
    { id: 'comfort', text: 'I need comfort' },
    { id: 'safe', text: 'I need to feel safe' },
  ],
  angry: [
    { id: 'space', text: 'I need space' },
    { id: 'break', text: 'I need a break' },
    { id: 'help', text: 'I need help' },
  ],
  calm: [
    { id: 'continue', text: 'I want to continue' },
    { id: 'okay', text: 'I am okay' },
    { id: 'good', text: 'I feel good' },
  ],
};

interface NeedSelectorProps {
  emotionId: string;
  onSelect: (need: Need) => void;
  onBack: () => void;
}

export const NeedSelector: React.FC<NeedSelectorProps> = ({
  emotionId,
  onSelect,
  onBack,
}) => {
  const needs = NEEDS_BY_EMOTION[emotionId] || NEEDS_BY_EMOTION.happy;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText} numberOfLines={1} ellipsizeMode="tail">← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>What do you need?</Text>
      <FlatList
        data={needs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.needButton}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.needText}>{item.text}</Text>
          </TouchableOpacity>
        )}
      />
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
  title: {
    ...typography.heading.h1,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text.primary,
  },
  list: {
    gap: spacing.md,
  },
  needButton: {
    backgroundColor: colors.secondary[50],
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.secondary[200],
    alignItems: 'center',
  },
  needText: {
    ...typography.heading.h2,
    color: colors.text.primary,
  },
});
