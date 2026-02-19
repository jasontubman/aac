import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useAACStore } from '../../store/aacStore';
import { useProfileStore } from '../../store/profileStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import {
  createBoard,
  updateBoard,
  deleteBoard,
  getBoard,
  createButton,
  updateButton,
  deleteButton,
  getButtonsByBoard,
} from '../../database/queries';
import { generateId } from '../../utils/id';
import type { Board, Button } from '../../database/types';

interface BoardEditorProps {
  boardId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export const BoardEditor: React.FC<BoardEditorProps> = ({
  boardId,
  onSave,
  onCancel,
}) => {
  const { activeProfile } = useProfileStore();
  const { isFeatureAvailable } = useSubscriptionStore();
  const [board, setBoard] = useState<Board | null>(null);
  const [buttons, setButtons] = useState<Button[]>([]);
  const [boardName, setBoardName] = useState('');
  const [gridCols, setGridCols] = useState(4);
  const [gridRows, setGridRows] = useState(4);
  const [editingButton, setEditingButton] = useState<Button | null>(null);
  const [buttonLabel, setButtonLabel] = useState('');
  const [buttonSpeechText, setButtonSpeechText] = useState('');

  useEffect(() => {
    if (boardId && activeProfile) {
      loadBoard();
    }
  }, [boardId, activeProfile]);

  const loadBoard = async () => {
    if (!boardId || !activeProfile) return;

    try {
      // Load board and buttons
      const boardData = await getBoard(boardId);
      if (boardData) {
        setBoard(boardData);
        setBoardName(boardData.name);
        setGridCols(boardData.grid_cols);
        setGridRows(boardData.grid_rows);

        const boardButtons = await getButtonsByBoard(boardId);
        setButtons(boardButtons);
      }
    } catch (error) {
      console.error('Error loading board:', error);
    }
  };

  const handleSaveBoard = async () => {
    if (!activeProfile) return;

    try {
      if (board) {
        // Update existing board
        await updateBoard(board.id, {
          name: boardName,
          grid_cols: gridCols,
          grid_rows: gridRows,
        });
      } else {
        // Create new board
        const newBoardId = generateId();
        await createBoard(
          newBoardId,
          activeProfile.id,
          boardName,
          false,
          gridCols,
          gridRows
        );
        setBoard({
          id: newBoardId,
          profile_id: activeProfile.id,
          name: boardName,
          is_core: 0,
          grid_cols: gridCols,
          grid_rows: gridRows,
          created_at: Date.now(),
          updated_at: Date.now(),
        });
      }
      onSave?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to save board');
      console.error('Error saving board:', error);
    }
  };

  const handleAddButton = () => {
    setEditingButton(null);
    setButtonLabel('');
    setButtonSpeechText('');
  };

  const handleSaveButton = async () => {
    if (!board || !activeProfile || !buttonLabel || !buttonSpeechText) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (editingButton) {
        // Update existing button
        await updateButton(editingButton.id, {
          label: buttonLabel,
          speech_text: buttonSpeechText,
        });
      } else {
        // Create new button
        const newButtonId = generateId();
        const position = buttons.length;
        await createButton(
          newButtonId,
          board.id,
          buttonLabel,
          buttonSpeechText,
          `asset://button/${newButtonId}.png`, // Placeholder
          position
        );
      }
      await loadBoard();
      setEditingButton(null);
      setButtonLabel('');
      setButtonSpeechText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save button');
      console.error('Error saving button:', error);
    }
  };

  const handleDeleteButton = async (buttonId: string) => {
    Alert.alert('Delete Button', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteButton(buttonId);
            await loadBoard();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete button');
          }
        },
      },
    ]);
  };

  const handleDeleteBoard = async () => {
    if (!board) return;

    Alert.alert('Delete Board', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBoard(board.id);
            onCancel?.();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete board');
          }
        },
      },
    ]);
  };

  if (!isFeatureAvailable('board_editing')) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Board editing requires an active subscription.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Board Settings</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Board Name</Text>
          <TextInput
            style={styles.input}
            value={boardName}
            onChangeText={setBoardName}
            placeholder="Enter board name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Grid Columns</Text>
          <View style={styles.gridControls}>
            <TouchableOpacity
              style={styles.gridButton}
              onPress={() => setGridCols(Math.max(2, gridCols - 1))}
            >
              <Text style={styles.gridButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.gridValue}>{gridCols}</Text>
            <TouchableOpacity
              style={styles.gridButton}
              onPress={() => setGridCols(Math.min(6, gridCols + 1))}
            >
              <Text style={styles.gridButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Grid Rows</Text>
          <View style={styles.gridControls}>
            <TouchableOpacity
              style={styles.gridButton}
              onPress={() => setGridRows(Math.max(2, gridRows - 1))}
            >
              <Text style={styles.gridButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.gridValue}>{gridRows}</Text>
            <TouchableOpacity
              style={styles.gridButton}
              onPress={() => setGridRows(Math.min(6, gridRows + 1))}
            >
              <Text style={styles.gridButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveBoard}>
          <Text style={styles.saveButtonText}>Save Board</Text>
        </TouchableOpacity>
      </View>

      {board && (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Buttons</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddButton}
              >
                <Text style={styles.addButtonText}>+ Add Button</Text>
              </TouchableOpacity>
            </View>

            {editingButton !== null && (
              <View style={styles.buttonEditor}>
                <Text style={styles.label}>Button Label</Text>
                <TextInput
                  style={styles.input}
                  value={buttonLabel}
                  onChangeText={setButtonLabel}
                  placeholder="e.g., 'More'"
                />

                <Text style={styles.label}>Speech Text</Text>
                <TextInput
                  style={styles.input}
                  value={buttonSpeechText}
                  onChangeText={setButtonSpeechText}
                  placeholder="e.g., 'I want more'"
                />

                <View style={styles.buttonEditorActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingButton(null);
                      setButtonLabel('');
                      setButtonSpeechText('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveButton}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {buttons.map((button, index) => (
              <View key={button.id} style={styles.buttonItem}>
                <View style={styles.buttonInfo}>
                  <Text style={styles.buttonLabel}>{button.label}</Text>
                  <Text style={styles.buttonSpeech}>{button.speech_text}</Text>
                </View>
                <View style={styles.buttonActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setEditingButton(button);
                      setButtonLabel(button.label);
                      setButtonSpeechText(button.speech_text);
                    }}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteButton(button.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {board && (
            <TouchableOpacity
              style={styles.deleteBoardButton}
              onPress={handleDeleteBoard}
            >
              <Text style={styles.deleteBoardButtonText}>Delete Board</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.heading.h2,
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label.medium,
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body.medium,
    backgroundColor: colors.background.light,
  },
  gridControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  gridButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridButtonText: {
    ...typography.heading.h2,
    color: colors.text.light,
  },
  gridValue: {
    ...typography.heading.h2,
    minWidth: 40,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  addButton: {
    backgroundColor: colors.secondary[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    ...typography.button.small,
    color: colors.text.light,
  },
  buttonEditor: {
    backgroundColor: colors.neutral[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  buttonEditorActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  buttonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  buttonInfo: {
    flex: 1,
  },
  buttonLabel: {
    ...typography.body.medium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  buttonSpeech: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  buttonActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.sm,
  },
  editButtonText: {
    ...typography.button.small,
    color: colors.text.light,
  },
  deleteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: borderRadius.sm,
  },
  deleteButtonText: {
    ...typography.button.small,
    color: colors.text.light,
  },
  deleteBoardButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  deleteBoardButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  actions: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  cancelButton: {
    backgroundColor: colors.neutral[200],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.button.medium,
    color: colors.text.primary,
  },
  errorText: {
    ...typography.body.medium,
    color: colors.error,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
