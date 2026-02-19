import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BoardEditor } from '../../components/caregiver/BoardEditor';
import { useProfileStore } from '../../store/profileStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { getBoardsByProfile, deleteBoard, getBoard, getButtonsByBoard, createBoard, createButton } from '../../database/queries';
import { colors, spacing, typography } from '../../theme';
import { generateId } from '../../utils/id';
import type { Board } from '../../database/types';
import { usageAnalytics } from '../../services/usageAnalytics';
import { useToast } from '../../hooks/useToast';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';

export default function BoardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ boardId?: string }>();
  const { activeProfile } = useProfileStore();
  const { isFeatureAvailable } = useSubscriptionStore();
  const [boards, setBoards] = useState<Board[]>([]);
  const [editingBoardId, setEditingBoardId] = useState<string | undefined>(
    params.boardId
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const { success, error: showError, ToastContainer } = useToast();

  const loadBoards = async () => {
    if (!activeProfile) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const profileBoards = await getBoardsByProfile(activeProfile.id);
      setBoards(profileBoards);
    } catch (error) {
      console.error('Error loading boards:', error);
      showError('Failed to load boards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!activeProfile) {
      Alert.alert('No Profile', 'Please select a profile first.');
      return;
    }

    // Check subscription
    if (!isFeatureAvailable('custom_boards')) {
      Alert.alert(
        'Subscription Required',
        'Creating custom boards requires an active subscription. Please subscribe to continue.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Subscribe', 
            onPress: () => router.push('/caregiver/subscription')
          }
        ]
      );
      return;
    }

    setIsCreating(true);
    try {
      const newBoardId = generateId();
      const boardName = 'New Board';
      await createBoard(
        newBoardId,
        activeProfile.id,
        boardName,
        false,
        4,
        4
      );
      await usageAnalytics.logBoardCreate(newBoardId, boardName);
      setEditingBoardId(newBoardId);
      await loadBoards();
      success('Board created successfully!');
    } catch (error) {
      console.error('Error creating board:', error);
      showError('Failed to create board. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = (boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;
    setBoardToDelete(board);
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;
    
    try {
      await deleteBoard(boardToDelete.id);
      await usageAnalytics.logBoardDelete(boardToDelete.id, boardToDelete.name);
      await loadBoards();
      success('Board deleted successfully');
    } catch (error) {
      console.error('Error deleting board:', error);
      showError('Failed to delete board. Please try again.');
    } finally {
      setDeleteConfirmVisible(false);
      setBoardToDelete(null);
    }
  };

  const handleDuplicateBoard = async (boardId: string) => {
    if (!activeProfile) {
      Alert.alert('No Profile', 'Please select a profile first.');
      return;
    }

    // Check subscription
    if (!isFeatureAvailable('custom_boards')) {
      Alert.alert(
        'Subscription Required',
        'Duplicating boards requires an active subscription.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Subscribe', 
            onPress: () => router.push('/caregiver/subscription')
          }
        ]
      );
      return;
    }

    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    try {
      // Create new board with same settings
      const newBoardId = generateId();
      const newBoardName = `${board.name} (Copy)`;
      
      await createBoard(
        newBoardId,
        activeProfile.id,
        newBoardName,
        false, // Never duplicate core boards
        board.grid_cols,
        board.grid_rows
      );

      // Copy all buttons
      const buttons = await getButtonsByBoard(boardId);
      for (const button of buttons) {
        const newButtonId = generateId();
        // Calculate new position (same relative position)
        await createButton(
          newButtonId,
          newBoardId,
          button.label,
          button.speech_text,
          button.image_path,
          button.position,
          button.symbol_path,
          button.color
        );
      }

      await usageAnalytics.logBoardCreate(newBoardId, newBoardName);
      await loadBoards();
      success('Board duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating board:', error);
      showError('Failed to duplicate board. Please try again.');
    }
  };

  useEffect(() => {
    loadBoards();
  }, [activeProfile]);

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

  if (isLoading && boards.length === 0) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading boards..." fullScreen />
        <ToastContainer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ToastContainer />
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.createButton, (!isFeatureAvailable('custom_boards') || isCreating) && styles.createButtonDisabled]}
          onPress={handleCreateBoard}
          disabled={isCreating || !isFeatureAvailable('custom_boards')}
          accessibilityLabel="Create new board"
          accessibilityHint="Creates a new communication board"
          accessibilityRole="button"
        >
          <Text style={styles.createButtonText}>
            {isCreating ? 'Creating...' : '+ Create Board'}
          </Text>
        </TouchableOpacity>
        {!isFeatureAvailable('custom_boards') && (
          <Text style={styles.subscriptionNote}>
            Subscription required to create custom boards
          </Text>
        )}
      </View>

      <FlatList
        data={boards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.boardItemContainer}>
            <TouchableOpacity
              style={styles.boardItem}
              onPress={() => setEditingBoardId(item.id)}
              accessibilityLabel={`Edit board: ${item.name}`}
              accessibilityHint={`Opens editor for ${item.name} board`}
              accessibilityRole="button"
            >
              <View style={styles.boardItemContent}>
                <Text style={styles.boardName}>{item.name}</Text>
                <Text style={styles.boardInfo}>
                  {item.grid_cols}x{item.grid_rows} grid
                  {item.is_core ? ' • Core Board' : ''}
                </Text>
              </View>
            </TouchableOpacity>
            {!item.is_core && (
              <View style={styles.boardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDuplicateBoard(item.id)}
                  accessibilityLabel={`Duplicate board: ${item.name}`}
                  accessibilityHint="Creates a copy of this board"
                  accessibilityRole="button"
                >
                  <Text style={styles.actionButtonText}>Duplicate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteBoard(item.id)}
                  accessibilityLabel={`Delete board: ${item.name}`}
                  accessibilityHint="Deletes this board permanently"
                  accessibilityRole="button"
                >
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.md }]}
        ListEmptyComponent={
          <EmptyState
            title="No boards yet"
            message="Create your first board to get started"
            actionLabel="Create Board"
            onAction={handleCreateBoard}
            icon="📋"
          />
        }
      />

      <ConfirmationDialog
        visible={deleteConfirmVisible}
        title="Delete Board"
        message={`Are you sure you want to delete "${boardToDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteBoard}
        onCancel={() => {
          setDeleteConfirmVisible(false);
          setBoardToDelete(null);
        }}
        destructive={true}
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
  createButtonDisabled: {
    backgroundColor: colors.neutral[300],
    opacity: 0.6,
  },
  createButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  subscriptionNote: {
    ...typography.body.small,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  list: {
    padding: spacing.md,
  },
  boardItemContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  boardItem: {
    padding: spacing.md,
  },
  boardItemContent: {
    flex: 1,
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
  boardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  actionButton: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.neutral[200],
  },
  actionButtonText: {
    ...typography.button.small,
    color: colors.primary[600],
  },
  deleteButton: {
    borderRightWidth: 0,
  },
  deleteButtonText: {
    color: colors.error,
  },
});
