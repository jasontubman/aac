import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BoardEditor } from '../../components/caregiver/BoardEditor';
import { useProfileStore } from '../../store/profileStore';
import { getBoardsByProfile } from '../../database/queries';
import { colors, spacing, typography } from '../../theme';
import { generateId } from '../../utils/id';
import { createBoard } from '../../database/queries';
import type { Board } from '../../database/types';

export default function BoardsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ boardId?: string }>();
  const { activeProfile } = useProfileStore();
  const [boards, setBoards] = useState<Board[]>([]);
  const [editingBoardId, setEditingBoardId] = useState<string | undefined>(
    params.boardId
  );

  const loadBoards = async () => {
    if (!activeProfile) return;
    try {
      const profileBoards = await getBoardsByProfile(activeProfile.id);
      setBoards(profileBoards);
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  };

  const handleCreateBoard = async () => {
    if (!activeProfile) return;
    try {
      const newBoardId = generateId();
      await createBoard(
        newBoardId,
        activeProfile.id,
        'New Board',
        false,
        4,
        4
      );
      setEditingBoardId(newBoardId);
      await loadBoards();
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  if (editingBoardId) {
    return (
      <View style={styles.container}>
        <BoardEditor
          boardId={editingBoardId}
          onSave={() => {
            setEditingBoardId(undefined);
            loadBoards();
          }}
          onCancel={() => setEditingBoardId(undefined)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateBoard}
        >
          <Text style={styles.createButtonText}>+ Create Board</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={boards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.boardItem}
            onPress={() => setEditingBoardId(item.id)}
          >
            <Text style={styles.boardName}>{item.name}</Text>
            <Text style={styles.boardInfo}>
              {item.grid_cols}x{item.grid_rows} grid
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  createButton: {
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  list: {
    padding: spacing.md,
  },
  boardItem: {
    backgroundColor: colors.neutral[50],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  boardName: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  boardInfo: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
});
