import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useProfileStore } from '../../store/profileStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import {
  createRoutine,
  updateRoutine,
  deleteRoutine,
  getRoutine,
  getButtonsByBoard,
  getBoardsByProfile,
} from '../../database/queries';
import { generateId } from '../../utils/id';
import type { Routine, Button, Board } from '../../database/types';

interface RoutineEditorProps {
  routineId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export const RoutineEditor: React.FC<RoutineEditorProps> = ({
  routineId,
  onSave,
  onCancel,
}) => {
  const { activeProfile } = useProfileStore();
  const { isFeatureAvailable } = useSubscriptionStore();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [routineName, setRoutineName] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [availableButtons, setAvailableButtons] = useState<Button[]>([]);
  const [pinnedButtonIds, setPinnedButtonIds] = useState<string[]>([]);

  useEffect(() => {
    if (activeProfile) {
      loadBoards();
    }
    if (routineId) {
      loadRoutine();
    }
  }, [routineId, activeProfile]);

  useEffect(() => {
    if (selectedBoardId) {
      loadButtons();
    }
  }, [selectedBoardId]);

  const loadBoards = async () => {
    if (!activeProfile) return;
    try {
      const profileBoards = await getBoardsByProfile(activeProfile.id);
      setBoards(profileBoards);
      if (profileBoards.length > 0 && !selectedBoardId) {
        setSelectedBoardId(profileBoards[0].id);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  };

  const loadRoutine = async () => {
    if (!routineId) return;
    try {
      const routineData = await getRoutine(routineId);
      if (routineData) {
        setRoutine(routineData);
        setRoutineName(routineData.name);
        const pinnedIds = JSON.parse(
          routineData.pinned_button_ids_json || '[]'
        );
        setPinnedButtonIds(pinnedIds);
      }
    } catch (error) {
      console.error('Error loading routine:', error);
    }
  };

  const loadButtons = async () => {
    if (!selectedBoardId) return;
    try {
      const boardButtons = await getButtonsByBoard(selectedBoardId);
      setAvailableButtons(boardButtons);
    } catch (error) {
      console.error('Error loading buttons:', error);
    }
  };

  const handleTogglePin = (buttonId: string) => {
    setPinnedButtonIds((prev) => {
      if (prev.includes(buttonId)) {
        return prev.filter((id) => id !== buttonId);
      } else {
        return [...prev, buttonId];
      }
    });
  };

  const handleSave = async () => {
    if (!activeProfile || !routineName.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }

    try {
      if (routine) {
        await updateRoutine(routine.id, {
          name: routineName,
          pinned_button_ids_json: JSON.stringify(pinnedButtonIds),
        });
      } else {
        const newRoutineId = generateId();
        await createRoutine(
          newRoutineId,
          activeProfile.id,
          routineName,
          pinnedButtonIds
        );
      }
      onSave?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to save routine');
      console.error('Error saving routine:', error);
    }
  };

  const handleDelete = async () => {
    if (!routine) return;

    Alert.alert('Delete Routine', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRoutine(routine.id);
            onCancel?.();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete routine');
          }
        },
      },
    ]);
  };

  if (!isFeatureAvailable('routines')) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Routines require an active subscription.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Routine Name</Text>
        <TextInput
          style={styles.input}
          value={routineName}
          onChangeText={setRoutineName}
          placeholder="e.g., Morning Routine"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Select Board</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {boards.map((board) => (
            <TouchableOpacity
              key={board.id}
              style={[
                styles.boardChip,
                selectedBoardId === board.id && styles.boardChipActive,
              ]}
              onPress={() => setSelectedBoardId(board.id)}
            >
              <Text
                style={[
                  styles.boardChipText,
                  selectedBoardId === board.id && styles.boardChipTextActive,
                ]}
              >
                {board.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedBoardId && (
        <View style={styles.section}>
          <Text style={styles.label}>
            Pin Buttons ({pinnedButtonIds.length} selected)
          </Text>
          <Text style={styles.hint}>
            Tap buttons to pin them to this routine
          </Text>
          <View style={styles.buttonGrid}>
            {availableButtons.map((button) => {
              const isPinned = pinnedButtonIds.includes(button.id);
              return (
                <TouchableOpacity
                  key={button.id}
                  style={[
                    styles.buttonChip,
                    isPinned && styles.buttonChipPinned,
                  ]}
                  onPress={() => handleTogglePin(button.id)}
                >
                  <Text
                    style={[
                      styles.buttonChipText,
                      isPinned && styles.buttonChipTextPinned,
                    ]}
                  >
                    {button.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Routine</Text>
        </TouchableOpacity>

        {routine && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete Routine</Text>
          </TouchableOpacity>
        )}

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
  label: {
    ...typography.label.medium,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  hint: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body.medium,
    backgroundColor: colors.background.light,
  },
  boardChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[200],
    marginRight: spacing.sm,
  },
  boardChipActive: {
    backgroundColor: colors.primary[500],
  },
  boardChipText: {
    ...typography.button.small,
    color: colors.text.primary,
  },
  boardChipTextActive: {
    color: colors.text.light,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  buttonChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonChipPinned: {
    backgroundColor: colors.secondary[200],
    borderColor: colors.secondary[500],
  },
  buttonChipText: {
    ...typography.button.small,
    color: colors.text.primary,
  },
  buttonChipTextPinned: {
    color: colors.secondary[700],
    fontWeight: '600',
  },
  actions: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  deleteButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deleteButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
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
