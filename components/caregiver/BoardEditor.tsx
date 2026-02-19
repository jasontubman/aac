import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../../theme';
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
import { PhotoCapture } from './PhotoCapture';
import { SymbolPicker } from './SymbolPicker';
import { BoardSearch } from './BoardSearch';
import * as ImagePicker from 'expo-image-picker';
import type { SymbolResult } from '../../services/symbolLibrary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = spacing.md;
const GRID_GAP = spacing.sm;

interface BoardEditorProps {
  boardId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

interface GridButton extends Button {
  x: number;
  y: number;
  isDragging?: boolean;
}

export const BoardEditor: React.FC<BoardEditorProps> = ({
  boardId,
  onSave,
  onCancel,
}) => {
  const insets = useSafeAreaInsets();
  const { activeProfile } = useProfileStore();
  const { isFeatureAvailable } = useSubscriptionStore();
  const [board, setBoard] = useState<Board | null>(null);
  const [buttons, setButtons] = useState<GridButton[]>([]);
  const [boardName, setBoardName] = useState('');
  const [gridCols, setGridCols] = useState(4);
  const [gridRows, setGridRows] = useState(4);
  const [editingButton, setEditingButton] = useState<Button | null>(null);
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('');
  const [buttonSpeechText, setButtonSpeechText] = useState('');
  const [buttonImagePath, setButtonImagePath] = useState<string | null>(null);
  const [buttonSymbolPath, setButtonSymbolPath] = useState<string | null>(null);
  const [draggedButtonId, setDraggedButtonId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);

  // Calculate grid dimensions
  const gridWidth = SCREEN_WIDTH - GRID_PADDING * 2;
  const cellSize = (gridWidth - GRID_GAP * (gridCols - 1)) / gridCols;

  useEffect(() => {
    if (boardId && activeProfile) {
      loadBoard();
    }
  }, [boardId, activeProfile]);

  const loadBoard = async () => {
    if (!boardId || !activeProfile) return;

    try {
      const boardData = await getBoard(boardId);
      if (boardData) {
        setBoard(boardData);
        setBoardName(boardData.name);
        setGridCols(boardData.grid_cols);
        setGridRows(boardData.grid_rows);

        const boardButtons = await getButtonsByBoard(boardId);
        // Convert position to x, y coordinates
        const gridButtons = boardButtons.map((btn) => {
          const pos = btn.position;
          const x = pos % boardData.grid_cols;
          const y = Math.floor(pos / boardData.grid_cols);
          return { ...btn, x, y };
        });
        setButtons(gridButtons);
      }
    } catch (error) {
      console.error('Error loading board:', error);
    }
  };

  const positionToIndex = useCallback(
    (x: number, y: number) => {
      return y * gridCols + x;
    },
    [gridCols]
  );

  const indexToPosition = useCallback(
    (index: number) => {
      const x = index % gridCols;
      const y = Math.floor(index / gridCols);
      return { x, y };
    },
    [gridCols]
  );

  const handleSaveBoard = async () => {
    if (!activeProfile) return;

    // Validate grid size changes
    if (board && buttons.length > 0) {
      const buttonsOutsideBounds = buttons.filter(
        (btn) => btn.x >= gridCols || btn.y >= gridRows
      );
      if (buttonsOutsideBounds.length > 0) {
        Alert.alert(
          'Warning',
          `Some buttons are outside the new grid size. They will be repositioned.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue',
              onPress: async () => {
                await saveBoardWithRepositioning();
              },
            },
          ]
        );
        return;
      }
    }

    await saveBoardWithRepositioning();
  };

  const saveBoardWithRepositioning = async () => {
    if (!activeProfile) return;

    try {
      if (board) {
        // Reposition buttons that are outside bounds
        const buttonsToUpdate: Promise<void>[] = [];
        buttons.forEach((btn) => {
          if (btn.x >= gridCols || btn.y >= gridRows) {
            // Find next available position
            let newPos = 0;
            let found = false;
            for (let y = 0; y < gridRows && !found; y++) {
              for (let x = 0; x < gridCols && !found; x++) {
                const pos = positionToIndex(x, y);
                const occupied = buttons.some(
                  (b) => b.id !== btn.id && positionToIndex(b.x, b.y) === pos
                );
                if (!occupied) {
                  newPos = pos;
                  found = true;
                }
              }
            }
            buttonsToUpdate.push(updateButton(btn.id, { position: newPos }));
          }
        });
        await Promise.all(buttonsToUpdate);

        await updateBoard(board.id, {
          name: boardName,
          grid_cols: gridCols,
          grid_rows: gridRows,
        });
      } else {
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
      await loadBoard();
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
    setButtonImagePath(null);
    setButtonSymbolPath(null);
    setShowButtonModal(true);
  };

  const handleSelectPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setButtonImagePath(result.assets[0].uri);
    }
  };

  const handleSaveButton = async () => {
    if (!board || !activeProfile || !buttonLabel || !buttonSpeechText) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingButton) {
        await updateButton(editingButton.id, {
          label: buttonLabel,
          speech_text: buttonSpeechText,
          image_path: buttonImagePath || editingButton.image_path,
          symbol_path: buttonSymbolPath || null,
        });
      } else {
        // Use target position if set (from tapping empty cell), otherwise find next available
        let nextPosition: number;
        if (targetPosition) {
          nextPosition = positionToIndex(targetPosition.x, targetPosition.y);
          // Check if position is already taken
          const existingButton = buttons.find(
            (b) => b.x === targetPosition.x && b.y === targetPosition.y
          );
          if (existingButton) {
            Alert.alert('Error', 'This position is already taken.');
            setTargetPosition(null);
            return;
          }
        } else {
          const maxPosition = buttons.length > 0 
            ? Math.max(...buttons.map(b => positionToIndex(b.x, b.y)))
            : -1;
          nextPosition = maxPosition + 1;
        }
        
        const { x, y } = indexToPosition(nextPosition);
        if (y >= gridRows) {
          Alert.alert('Error', 'Board is full. Increase grid size or remove buttons.');
          setTargetPosition(null);
          return;
        }

        const newButtonId = generateId();
        await createButton(
          newButtonId,
          board.id,
          buttonLabel,
          buttonSpeechText,
          buttonImagePath || `asset://button/${newButtonId}.png`,
          nextPosition,
          buttonSymbolPath || null,
          null // color
        );
        setTargetPosition(null);
      }
      await loadBoard();
      setShowButtonModal(false);
      setEditingButton(null);
      setButtonLabel('');
      setButtonSpeechText('');
      setButtonImagePath(null);
      setTargetPosition(null);
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

  const handleButtonDrag = useCallback(
    async (buttonId: string, newX: number, newY: number) => {
      if (newX < 0 || newX >= gridCols || newY < 0 || newY >= gridRows) {
        return; // Out of bounds
      }

      const newPosition = positionToIndex(newX, newY);
      const existingButton = buttons.find(
        (b) => b.id !== buttonId && b.x === newX && b.y === newY
      );

      try {
        if (existingButton) {
          // Swap positions
          const oldButton = buttons.find((b) => b.id === buttonId);
          if (oldButton) {
            const oldPosition = positionToIndex(oldButton.x, oldButton.y);
            await Promise.all([
              updateButton(existingButton.id, { position: oldPosition }),
              updateButton(buttonId, { position: newPosition }),
            ]);
          }
        } else {
          // Move to empty cell
          await updateButton(buttonId, { position: newPosition });
        }
        await loadBoard();
      } catch (error) {
        console.error('Error moving button:', error);
        Alert.alert('Error', 'Failed to move button');
      }
    },
    [buttons, gridCols, gridRows, positionToIndex]
  );

  if (!isFeatureAvailable('board_editing')) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Board editing requires an active subscription.
        </Text>
      </View>
    );
  }

  if (showPhotoCapture && board) {
    return (
      <PhotoCapture
        boardId={board.id}
        onComplete={() => {
          setShowPhotoCapture(false);
          loadBoard();
        }}
        onCancel={() => setShowPhotoCapture(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      >
        {/* Board Settings */}
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
            <Text style={styles.label}>Grid Size</Text>
            <View style={styles.gridControls}>
              <View style={styles.gridControlGroup}>
                <Text style={styles.gridLabel}>Columns</Text>
                <View style={styles.gridButtons}>
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

              <View style={styles.gridControlGroup}>
                <Text style={styles.gridLabel}>Rows</Text>
                <View style={styles.gridButtons}>
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
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveBoard}>
            <Text style={styles.saveButtonText}>Save Board Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Visual Grid Editor */}
        {board && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Board Layout</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => setShowSearch(true)}
                >
                  <Text style={styles.searchButtonText}>🔍 Search</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddButton}
                >
                  <Text style={styles.addButtonText}>+ Add Button</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.gridContainer}>
              <View
                style={[
                  styles.grid,
                  {
                    width: gridWidth,
                    height: (cellSize + GRID_GAP) * gridRows - GRID_GAP,
                  },
                ]}
              >
                {Array.from({ length: gridRows * gridCols }).map((_, index) => {
                  const { x, y } = indexToPosition(index);
                  const button = buttons.find((b) => b.x === x && b.y === y);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.gridCell,
                        {
                          width: cellSize,
                          height: cellSize,
                          marginRight: x < gridCols - 1 ? GRID_GAP : 0,
                          marginBottom: y < gridRows - 1 ? GRID_GAP : 0,
                        },
                      ]}
                    >
                      {button && (
                        <DraggableButton
                          button={button}
                          size={cellSize}
                          onPress={() => {
                            setEditingButton(button);
                            setButtonLabel(button.label);
                            setButtonSpeechText(button.speech_text);
                            setButtonImagePath(button.image_path);
                            setButtonSymbolPath(button.symbol_path || null);
                            setShowButtonModal(true);
                          }}
                          onLongPress={() => {
                            if (editMode) {
                              handleDeleteButton(button.id);
                            }
                          }}
                          onDragEnd={(newX, newY) =>
                            handleButtonDrag(button.id, newX, newY)
                          }
                          gridCols={gridCols}
                          gridRows={gridRows}
                          editMode={editMode}
                        />
                      )}
                      {!button && editMode && (
                        <TouchableOpacity
                          style={styles.emptyCell}
                          onPress={() => {
                            const { x: cellX, y: cellY } = indexToPosition(index);
                            setTargetPosition({ x: cellX, y: cellY });
                            setEditingButton(null);
                            setButtonLabel('');
                            setButtonSpeechText('');
                            setButtonImagePath(null);
                            setShowButtonModal(true);
                          }}
                        >
                          <Text style={styles.emptyCellText}>+</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.editModeToggle}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  editMode && styles.toggleButtonActive,
                ]}
                onPress={() => setEditMode(!editMode)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    editMode && styles.toggleButtonTextActive,
                  ]}
                >
                  {editMode ? 'Edit Mode' : 'Preview Mode'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {board && (
          <TouchableOpacity
            style={styles.deleteBoardButton}
            onPress={handleDeleteBoard}
          >
            <Text style={styles.deleteBoardButtonText}>Delete Board</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Button Editor Modal */}
      <Modal
        visible={showButtonModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingButton ? 'Edit Button' : 'New Button'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowButtonModal(false);
                setEditingButton(null);
                setButtonLabel('');
                setButtonSpeechText('');
                setButtonImagePath(null);
                setButtonSymbolPath(null);
                setTargetPosition(null);
              }}
            >
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Button Label</Text>
              <TextInput
                style={styles.input}
                value={buttonLabel}
                onChangeText={setButtonLabel}
                placeholder="e.g., 'More'"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Speech Text</Text>
              <TextInput
                style={styles.input}
                value={buttonSpeechText}
                onChangeText={setButtonSpeechText}
                placeholder="e.g., 'I want more'"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Image</Text>
              {(buttonImagePath || buttonSymbolPath) && (
                <View style={styles.previewContainer}>
                  {buttonImagePath && (
                    <Image
                      source={{ uri: buttonImagePath }}
                      style={styles.previewImage}
                    />
                  )}
                  {buttonSymbolPath && (
                    <Image
                      source={{ uri: buttonSymbolPath }}
                      style={styles.previewImage}
                    />
                  )}
                </View>
              )}
              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handleSelectPhoto}
                >
                  <Text style={styles.imageButtonText}>Choose Photo</Text>
                </TouchableOpacity>
                {board && (
                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={() => {
                      setShowButtonModal(false);
                      setShowPhotoCapture(true);
                    }}
                  >
                    <Text style={styles.imageButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => {
                    setShowSymbolPicker(true);
                  }}
                >
                  <Text style={styles.imageButtonText}>Choose Symbol</Text>
                </TouchableOpacity>
                {(buttonImagePath || buttonSymbolPath) && (
                  <TouchableOpacity
                    style={[styles.imageButton, styles.removeButton]}
                    onPress={() => {
                      setButtonImagePath(null);
                      setButtonSymbolPath(null);
                    }}
                  >
                    <Text style={styles.removeButtonText}>Remove Image</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveButton}
            >
              <Text style={styles.saveButtonText}>Save Button</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Symbol Picker Modal */}
      <SymbolPicker
        visible={showSymbolPicker}
        onSelect={(symbol) => {
          setButtonSymbolPath(symbol.imageUrl);
          setShowSymbolPicker(false);
          setShowButtonModal(true);
        }}
        onCancel={() => {
          setShowSymbolPicker(false);
          setShowButtonModal(true);
        }}
        searchKeyword={buttonLabel}
      />

      {/* Search Modal */}
      {showSearch && (
        <BoardSearch
          buttons={buttons}
          onSelectButton={(button) => {
            setEditingButton(button);
            setButtonLabel(button.label);
            setButtonSpeechText(button.speech_text);
            setButtonImagePath(button.image_path);
            setButtonSymbolPath(button.symbol_path || null);
            setShowButtonModal(true);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}
    </View>
  );
};

// Draggable Button Component
interface DraggableButtonProps {
  button: GridButton;
  size: number;
  onPress: () => void;
  onLongPress: () => void;
  onDragEnd: (x: number, y: number) => void;
  gridCols: number;
  gridRows: number;
  editMode: boolean;
}

const DraggableButton: React.FC<DraggableButtonProps> = ({
  button,
  size,
  onPress,
  onLongPress,
  onDragEnd,
  gridCols,
  gridRows,
  editMode,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const gesture = Gesture.Pan()
    .enabled(editMode)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      isDragging.value = true;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      const cellSize = size;
      const cellWithGap = cellSize + GRID_GAP;
      
      // Calculate new grid position based on total translation
      const totalX = button.x * cellWithGap + translateX.value;
      const totalY = button.y * cellWithGap + translateY.value;
      
      const newX = Math.round(totalX / cellWithGap);
      const newY = Math.round(totalY / cellWithGap);

      const clampedX = Math.max(0, Math.min(newX, gridCols - 1));
      const clampedY = Math.max(0, Math.min(newY, gridRows - 1));
      
      // Only trigger drag end if position actually changed
      if (clampedX !== button.x || clampedY !== button.y) {
        runOnJS(onDragEnd)(clampedX, clampedY);
      } else {
        // Reset position if didn't move to new cell
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
      
      isDragging.value = false;

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      isDragging.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      zIndex: isDragging.value ? 1000 : 1,
      opacity: isDragging.value ? 0.8 : 1,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.draggableButton, animatedStyle]}>
        <TouchableOpacity
          style={[
            styles.buttonPreview,
            {
              width: size,
              height: size,
              backgroundColor: button.color || colors.button.default,
            },
          ]}
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.7}
        >
          {button.image_path && (
            <Image
              source={{ uri: button.image_path }}
              style={styles.buttonImage}
              resizeMode="cover"
            />
          )}
          <Text style={styles.buttonPreviewLabel} numberOfLines={2}>
            {button.label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchButton: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  searchButtonText: {
    ...typography.button.small,
    color: colors.text.primary,
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
    gap: spacing.lg,
  },
  gridControlGroup: {
    flex: 1,
  },
  gridLabel: {
    ...typography.label.small,
    marginBottom: spacing.xs,
    color: colors.text.secondary,
  },
  gridButtons: {
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
  gridContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.neutral[100],
    padding: GRID_PADDING,
    borderRadius: borderRadius.lg,
  },
  gridCell: {
    position: 'relative',
  },
  emptyCell: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
  emptyCellText: {
    ...typography.heading.h1,
    color: colors.neutral[400],
  },
  draggableButton: {
    position: 'absolute',
  },
  buttonPreview: {
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  buttonImage: {
    width: '60%',
    height: '60%',
    borderRadius: borderRadius.sm,
  },
  buttonPreviewLabel: {
    ...typography.body.small,
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  editModeToggle: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  toggleButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[200],
  },
  toggleButtonActive: {
    backgroundColor: colors.primary[500],
  },
  toggleButtonText: {
    ...typography.button.small,
    color: colors.text.secondary,
  },
  toggleButtonTextActive: {
    color: colors.text.light,
  },
  deleteBoardButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
  },
  deleteBoardButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  actions: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.light,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    ...typography.heading.h2,
    color: colors.text.primary,
  },
  modalClose: {
    ...typography.button.medium,
    color: colors.primary[500],
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  previewContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
  },
  imageButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  imageButton: {
    flex: 1,
    backgroundColor: colors.secondary[500],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  imageButtonText: {
    ...typography.button.small,
    color: colors.text.light,
  },
  removeButton: {
    backgroundColor: colors.error,
  },
  removeButtonText: {
    ...typography.button.small,
    color: colors.text.light,
  },
});
