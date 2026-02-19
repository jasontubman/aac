import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import type { Button } from '../../database/types';

interface BoardSearchProps {
  buttons: Button[];
  onSelectButton: (button: Button) => void;
  onClose: () => void;
}

export const BoardSearch: React.FC<BoardSearchProps> = ({
  buttons,
  onSelectButton,
  onClose,
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredButtons, setFilteredButtons] = useState<Button[]>([]);

  useEffect(() => {
    if (searchText.trim().length === 0) {
      setFilteredButtons([]);
      return;
    }

    const searchLower = searchText.toLowerCase().trim();
    const filtered = buttons.filter(
      (button) =>
        button.label.toLowerCase().includes(searchLower) ||
        button.speech_text.toLowerCase().includes(searchLower)
    );
    setFilteredButtons(filtered);
  }, [searchText, buttons]);

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <Text key={index} style={styles.highlight}>
          {part}
        </Text>
      ) : (
        part
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search buttons..."
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
          returnKeyType="search"
        />
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      {filteredButtons.length > 0 && (
        <FlatList
          data={filteredButtons}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => {
                onSelectButton(item);
                onClose();
              }}
            >
              <Text style={styles.resultLabel}>
                {highlightText(item.label, searchText)}
              </Text>
              <Text style={styles.resultSpeech}>
                {highlightText(item.speech_text, searchText)}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.resultsList}
        />
      )}

      {searchText.length > 0 && filteredButtons.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No buttons found</Text>
          <Text style={styles.emptySubtext}>
            Try a different search term
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body.medium,
    backgroundColor: colors.neutral[100],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    color: colors.text.primary,
  },
  closeButton: {
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  closeButtonText: {
    ...typography.button.medium,
    color: colors.primary[600],
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  resultLabel: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  resultSpeech: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  highlight: {
    backgroundColor: colors.primary[200],
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body.small,
    color: colors.text.tertiary,
  },
});
