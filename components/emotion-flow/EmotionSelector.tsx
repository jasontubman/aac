import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface Emotion {
  id: string;
  label: string;
  emoji: string;
}

const EMOTIONS: Emotion[] = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'frustrated', label: 'Frustrated', emoji: '😤' },
  { id: 'excited', label: 'Excited', emoji: '🤩' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'scared', label: 'Scared', emoji: '😨' },
  { id: 'angry', label: 'Angry', emoji: '😠' },
  { id: 'calm', label: 'Calm', emoji: '😌' },
];

interface EmotionSelectorProps {
  onSelect: (emotion: Emotion) => void;
}

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({ onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      <FlatList
        data={EMOTIONS}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.emotionButton}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.label}>{item.label}</Text>
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
  title: {
    ...typography.heading.h1,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text.primary,
  },
  grid: {
    gap: spacing.md,
  },
  emotionButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.heading.h3,
    color: colors.text.primary,
  },
});
