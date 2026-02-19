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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { isValidImageUri } from '../../utils/performance';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import { useToast } from '../../hooks/useToast';

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
  const insets = useSafeAreaInsets();
  const { activeProfile } = useProfileStore();
  const { isFeatureAvailable } = useSubscriptionStore();
  const { success, error: showError, ToastContainer } = useToast();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [routineName, setRoutineName] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [availableButtons, setAvailableButtons] = useState<Button[]>([]);
  const [pinnedButtonIds, setPinnedButtonIds] = useState<string[]>([]);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

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
      showError('Failed to load boards');
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
      showError('Failed to load routine');
    }
  };

  const loadButtons = async () => {
    if (!selectedBoardId) return;
    try {
      const boardButtons = await getButtonsByBoard(selectedBoardId);
      setAvailableButtons(boardButtons);
    } catch (error) {
      console.error('Error loading buttons:', error);
      showError('Failed to load buttons');
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

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setPinnedButtonIds((prev) => {
      const newOrder = [...prev];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      return newOrder;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === pinnedButtonIds.length - 1) return;
    setPinnedButtonIds((prev) => {
      const newOrder = [...prev];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      return newOrder;
    });
  };

  const handleSave = async () => {
    if (!activeProfile || !routineName.trim()) {
      showError('Please enter a routine name');
      return;
    }

    try {
      if (routine) {
        await updateRoutine(routine.id, {
          name: routineName,
          pinned_button_ids_json: JSON.stringify(pinnedButtonIds),
        });
        success('Routine updated successfully!');
      } else {
        const newRoutineId = generateId();
        await createRoutine(
          newRoutineId,
          activeProfile.id,
          routineName,
          pinnedButtonIds
        );
        success('Routine created successfully!');
      }
      onSave?.();
    } catch (error) {
      console.error('Error saving routine:', error);
      showError('Failed to save routine');
    }
  };

  const handleDelete = async () => {
    if (!routine) return;
    try {
      await deleteRoutine(routine.id);
      success('Routine deleted successfully');
      onCancel?.();
    } catch (error) {
      console.error('Error deleting routine:', error);
      showError('Failed to delete routine');
    }
  };

  const getPinnedButtons = () => {
    return pinnedButtonIds
      .map((id) => availableButtons.find((btn) => btn.id === id))
      .filter((btn): btn is Button => btn !== undefined);
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

  const pinnedButtons = getPinnedButtons();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ToastContainer />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.sectionTitle}>Routine Name</Text>
          <TextInput
            style={styles.nameInput}
            value={routineName}
            onChangeText={setRoutineName}
            placeholder="e.g., Morning Routine"
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        {/* Board Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Board</Text>
          <Text style={styles.sectionDescription}>
            Choose a board to select buttons from
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.boardScroll}
            contentContainerStyle={styles.boardScrollContent}
          >
            {boards.map((board) => (
              <TouchableOpacity
                key={board.id}
                style={[
                  styles.boardCard,
                  selectedBoardId === board.id && styles.boardCardActive,
                ]}
                onPress={() => setSelectedBoardId(board.id)}
              >
                <Text style={styles.boardIcon}>📋</Text>
                <Text
                  style={[
                    styles.boardCardText,
                    selectedBoardId === board.id && styles.boardCardTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {board.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pinned Buttons Preview */}
        {pinnedButtons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Routine Buttons ({pinnedButtons.length})
            </Text>
            <Text style={styles.sectionDescription}>
              These buttons will appear in your routine
            </Text>
            <View style={styles.pinnedGrid}>
              {pinnedButtons.map((button, index) => (
                <View key={button.id} style={styles.pinnedButtonContainer}>
                  <View style={styles.pinnedButtonCard}>
                    {(button.symbol_path && isValidImageUri(button.symbol_path)) && (
                      <Image
                        source={{ uri: button.symbol_path }}
                        style={styles.buttonImage}
                        resizeMode="contain"
                      />
                    )}
                    {(button.image_path && isValidImageUri(button.image_path) && !button.symbol_path) && (
                      <Image
                        source={{ uri: button.image_path }}
                        style={styles.buttonImage}
                        resizeMode="cover"
                      />
                    )}
                    <Text style={styles.buttonLabel} numberOfLines={2}>
                      {button.label}
                    </Text>
                  </View>
                  <View style={styles.reorderButtons}>
                    <TouchableOpacity
                      style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
                      onPress={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <Text style={styles.reorderButtonText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reorderButton, index === pinnedButtons.length - 1 && styles.reorderButtonDisabled]}
                      onPress={() => handleMoveDown(index)}
                      disabled={index === pinnedButtons.length - 1}
                    >
                      <Text style={styles.reorderButtonText}>↓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Available Buttons */}
        {selectedBoardId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Available Buttons
            </Text>
            <Text style={styles.sectionDescription}>
              Tap buttons to add them to your routine
            </Text>
            <View style={styles.availableGrid}>
              {availableButtons.map((button) => {
                const isPinned = pinnedButtonIds.includes(button.id);
                return (
                  <TouchableOpacity
                    key={button.id}
                    style={[
                      styles.availableButtonCard,
                      isPinned && styles.availableButtonCardPinned,
                    ]}
                    onPress={() => handleTogglePin(button.id)}
                    activeOpacity={0.7}
                  >
                    {(button.symbol_path && isValidImageUri(button.symbol_path)) && (
                      <Image
                        source={{ uri: button.symbol_path }}
                        style={styles.availableButtonImage}
                        resizeMode="contain"
                      />
                    )}
                    {(button.image_path && isValidImageUri(button.image_path) && !button.symbol_path) && (
                      <Image
                        source={{ uri: button.image_path }}
                        style={styles.availableButtonImage}
                        resizeMode="cover"
                      />
                    )}
                    <Text 
                      style={[
                        styles.availableButtonLabel,
                        isPinned && styles.availableButtonLabelPinned,
                      ]}
                      numberOfLines={2}
                    >
                      {button.label}
                    </Text>
                    {isPinned && (
                      <View style={styles.pinnedBadge}>
                        <Text style={styles.pinnedBadgeText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Delete Button */}
        {routine && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setDeleteConfirmVisible(true)}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete Routine</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Sticky Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity style={styles.cancelFooterButton} onPress={onCancel}>
          <Text style={styles.cancelFooterButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveFooterButton} 
          onPress={handleSave}
          disabled={!routineName.trim()}
        >
          <Text style={styles.saveFooterButtonText}>
            {routine ? '💾 Save Changes' : '✨ Create Routine'}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmationDialog
        visible={deleteConfirmVisible}
        title="Delete Routine"
        message={`Are you sure you want to delete "${routine?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
        destructive={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  headerSection: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  nameInput: {
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...typography.heading.h3,
    backgroundColor: colors.background.light,
    marginTop: spacing.sm,
  },
  boardScroll: {
    marginHorizontal: -spacing.md,
  },
  boardScrollContent: {
    paddingHorizontal: spacing.md,
  },
  boardCard: {
    backgroundColor: colors.neutral[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  boardCardActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  boardIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  boardCardText: {
    ...typography.label.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  boardCardTextActive: {
    color: colors.text.light,
    fontWeight: '600',
  },
  pinnedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  pinnedButtonContainer: {
    width: '48%',
    marginBottom: spacing.md,
  },
  pinnedButtonCard: {
    backgroundColor: colors.secondary[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.secondary[300],
    minHeight: 140,
    justifyContent: 'center',
  },
  buttonImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  buttonLabel: {
    ...typography.label.medium,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  reorderButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  reorderButton: {
    backgroundColor: colors.neutral[200],
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  reorderButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
  },
  availableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  availableButtonCard: {
    width: '31%',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 100,
    justifyContent: 'center',
    position: 'relative',
  },
  availableButtonCardPinned: {
    backgroundColor: colors.secondary[100],
    borderColor: colors.secondary[400],
  },
  availableButtonImage: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  availableButtonLabel: {
    ...typography.body.small,
    color: colors.text.primary,
    textAlign: 'center',
    fontSize: 11,
  },
  availableButtonLabelPinned: {
    color: colors.secondary[700],
    fontWeight: '600',
  },
  pinnedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.success,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinnedBadgeText: {
    color: colors.text.light,
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  deleteButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  footer: {
    backgroundColor: colors.background.light,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cancelFooterButton: {
    flex: 1,
    backgroundColor: colors.neutral[200],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  cancelFooterButtonText: {
    ...typography.button.large,
    color: colors.text.primary,
  },
  saveFooterButton: {
    flex: 2,
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  saveFooterButtonText: {
    ...typography.button.large,
    color: colors.text.light,
    fontSize: 18,
  },
  errorText: {
    ...typography.body.medium,
    color: colors.error,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
