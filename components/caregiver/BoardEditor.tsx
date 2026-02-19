import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DropProvider, Draggable, Droppable } from 'react-native-reanimated-dnd';
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
import { isValidImageUri } from '../../utils/performance';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import { useToast } from '../../hooks/useToast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = spacing.md;
const GRID_GAP = spacing.sm;

// Global registry for drop handlers - module-level to avoid closure serialization issues
const dropTargetsRegistry = new Map<string, { x: number; y: number; handler: ((data: any, target: { x: number; y: number }) => void) | null }>();

interface BoardEditorProps {
  boardId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

interface GridButton extends Button {
  x: number;
  y: number;
}

export const BoardEditor: React.FC<BoardEditorProps> = ({
  boardId,
  onSave,
  onCancel,
}) => {
  const insets = useSafeAreaInsets();
  const { activeProfile } = useProfileStore();
  const { isFeatureAvailable } = useSubscriptionStore();
  const { success, error: showError, ToastContainer } = useToast();
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
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [buttonToDelete, setButtonToDelete] = useState<Button | null>(null);
  const [draggingButtonId, setDraggingButtonId] = useState<string | null>(null);
  const handleDropRef = useRef<((draggedData: { buttonId: string; x: number; y: number }, dropTarget: { x: number; y: number }) => Promise<void>) | null>(null);
  const setDraggingButtonIdRef = useRef<((id: string | null) => void) | null>(null);
  // Map of cell coordinates to drop handlers - used to avoid closure serialization issues
  const dropHandlersRef = useRef<Map<string, (data: any) => void>>(new Map());

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
        const gridButtons = boardButtons
          .sort((a, b) => a.position - b.position)
          .map((btn) => {
            const pos = btn.position;
            const x = pos % boardData.grid_cols;
            const y = Math.floor(pos / boardData.grid_cols);
            return { ...btn, x, y };
          });
        setButtons(gridButtons);
      }
    } catch (error) {
      console.error('Error loading board:', error);
      showError('Failed to load board');
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

    try {
      if (board) {
        console.log('Saving board:', { boardId: board.id, name: boardName, gridCols, gridRows, buttonCount: buttons.length });
        
        // Save board settings
        await updateBoard(board.id, {
          name: boardName,
          grid_cols: gridCols,
          grid_rows: gridRows,
        });
        console.log('Board settings saved');
        
        // Save all button positions based on current grid size
        // This ensures positions are valid after grid size changes
        const positionUpdates = buttons.map((btn) => {
          const position = positionToIndex(btn.x, btn.y);
          console.log(`Saving button ${btn.id} position:`, { x: btn.x, y: btn.y, position });
          return updateButton(btn.id, { position });
        });
        
        if (positionUpdates.length > 0) {
          await Promise.all(positionUpdates);
          console.log(`Saved ${positionUpdates.length} button positions`);
        }
        
        success('Board settings saved!');
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
        success('Board created!');
      }
      await loadBoard();
    } catch (error) {
      console.error('Error saving board:', error);
      showError('Failed to save board');
    }
  };

  const handleAddButton = () => {
    setEditingButton(null);
    setButtonLabel('');
    setButtonSpeechText('');
    setButtonImagePath(null);
    setButtonSymbolPath(null);
    setTargetPosition(null);
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
      showError('Please fill in all required fields');
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
        success('Button updated!');
      } else {
        // Use target position if set, otherwise find next available
        let nextPosition!: number;
        if (targetPosition) {
          nextPosition = positionToIndex(targetPosition.x, targetPosition.y);
          const existingButton = buttons.find(
            (b) => b.x === targetPosition.x && b.y === targetPosition.y
          );
          if (existingButton) {
            showError('This position is already taken.');
            setTargetPosition(null);
            return;
          }
        } else {
          const occupiedPositions = new Set(buttons.map(b => positionToIndex(b.x, b.y)));
          let foundEmpty = false;
          for (let i = 0; i < gridRows * gridCols; i++) {
            if (!occupiedPositions.has(i)) {
              nextPosition = i;
              foundEmpty = true;
              break;
            }
          }
          if (!foundEmpty) {
            showError('Board is full. Increase grid size or remove buttons.');
            return;
          }
        }
        
        const { x, y } = indexToPosition(nextPosition);
        if (y >= gridRows) {
          showError('Board is full. Increase grid size or remove buttons.');
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
          null
        );
        setTargetPosition(null);
        success('Button created!');
      }
      await loadBoard();
      setShowButtonModal(false);
      setEditingButton(null);
      setButtonLabel('');
      setButtonSpeechText('');
      setButtonImagePath(null);
      setButtonSymbolPath(null);
      setTargetPosition(null);
    } catch (error) {
      console.error('Error saving button:', error);
      showError('Failed to save button');
    }
  };

  const handleDeleteButton = (button: Button) => {
    setButtonToDelete(button);
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteButton = async () => {
    if (!buttonToDelete) return;
    try {
      await deleteButton(buttonToDelete.id);
      success('Button deleted!');
      await loadBoard();
    } catch (error) {
      console.error('Error deleting button:', error);
      showError('Failed to delete button');
    } finally {
      setDeleteConfirmVisible(false);
      setButtonToDelete(null);
    }
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
            console.error('Error deleting board:', error);
            showError('Failed to delete board');
          }
        },
      },
    ]);
  };

  // Handle drag and drop
  const handleDrop = useCallback(
    async (draggedData: { buttonId: string; x: number; y: number }, dropTarget: { x: number; y: number }) => {
      console.log('handleDrop called:', { draggedData, dropTarget, gridCols });
      const draggedButton = buttons.find((b) => b.id === draggedData.buttonId);
      if (!draggedButton) {
        console.warn('Dragged button not found:', draggedData.buttonId);
        return;
      }

      const fromIndex = positionToIndex(draggedButton.x, draggedButton.y);
      const toIndex = positionToIndex(dropTarget.x, dropTarget.y);

      console.log('Position indices:', { fromIndex, toIndex, gridCols });

      if (fromIndex === toIndex) return;

      const targetButton = buttons.find((b) => b.x === dropTarget.x && b.y === dropTarget.y && b.id !== draggedData.buttonId);
      
      // Optimistically update UI
      const oldButtons = [...buttons];
      let newButtons: GridButton[];
      
      if (targetButton) {
        // Swap positions
        newButtons = buttons.map((btn) => {
          if (btn.id === draggedData.buttonId) {
            return { ...btn, x: dropTarget.x, y: dropTarget.y };
          }
          if (btn.id === targetButton.id) {
            return { ...btn, x: draggedButton.x, y: draggedButton.y };
          }
          return btn;
        });
      } else {
        // Move to empty cell
        newButtons = buttons.map((btn) => {
          if (btn.id === draggedData.buttonId) {
            return { ...btn, x: dropTarget.x, y: dropTarget.y };
          }
          return btn;
        });
      }
      
      setButtons(newButtons);
      
      // Update database
      try {
        const newPosition = positionToIndex(dropTarget.x, dropTarget.y);
        const updates: Promise<void>[] = [];
        
        if (targetButton) {
          const oldPosition = positionToIndex(draggedButton.x, draggedButton.y);
          updates.push(
            updateButton(draggedData.buttonId, { position: newPosition }),
            updateButton(targetButton.id, { position: oldPosition })
          );
        } else {
          updates.push(updateButton(draggedData.buttonId, { position: newPosition }));
        }
        
        await Promise.all(updates);
        console.log('Database updates completed');
        
        // Update positions in state
        const finalButtons = newButtons.map((btn) => ({
          ...btn,
          position: positionToIndex(btn.x, btn.y),
        }));
        setButtons(finalButtons);
        success('Button moved!');
      } catch (error) {
        console.error('Error moving button:', error);
        // Revert on error
        setButtons(oldButtons);
        showError('Failed to move button');
      }
    },
    [buttons, positionToIndex, success, showError, gridCols]
  );

  // Update refs when functions change
  useEffect(() => {
    handleDropRef.current = handleDrop;
    // Also update all registered drop handlers with the new function
    dropTargetsRegistry.forEach((entry) => {
      entry.handler = handleDrop;
    });
  }, [handleDrop]);

  useEffect(() => {
    setDraggingButtonIdRef.current = setDraggingButtonId;
  }, []);

  // Stable wrapper functions for worklet callbacks
  // These are wrapped in useCallback to ensure stable references for runOnJS
  const handleDragStart = useCallback((buttonId: string) => {
    if (setDraggingButtonIdRef.current) {
      setDraggingButtonIdRef.current(buttonId);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    if (setDraggingButtonIdRef.current) {
      setDraggingButtonIdRef.current(null);
    }
  }, []);

  // Create serializable drop handlers using module-level registry
  // This avoids closure serialization issues since the handler function has no closures
  const getDropHandler = useCallback((x: number, y: number) => {
    const droppableId = `cell-${x}-${y}`;
    
    // Update global registry with current handler and coordinates
    dropTargetsRegistry.set(droppableId, {
      x,
      y,
      handler: handleDropRef.current,
    });
    
    // Create a function with NO closures - store droppableId as a property
    // This makes it serializable by react-native-worklets
    const handler: any = function(draggedData: any) {
      // Read droppableId from function property, not closure
      const id = (handler as any).__droppableId;
      const entry = dropTargetsRegistry.get(id);
      if (!entry || !entry.handler) {
        console.warn('Drop handler not found in registry:', id);
        return;
      }
      if (draggedData && typeof draggedData === 'object' && 'buttonId' in draggedData) {
        entry.handler(draggedData as { buttonId: string; x: number; y: number }, { x: entry.x, y: entry.y });
      }
    };
    // Store droppableId as property to avoid closure
    (handler as any).__droppableId = droppableId;
    return handler;
  }, []);

  // Render grid button
  const renderGridButton = (button: GridButton) => {
    const isDragging = draggingButtonId === button.id;
    
    return (
      <Draggable
        key={button.id}
        data={{ buttonId: button.id, x: button.x, y: button.y }}
        onDragStart={() => {
          handleDragStart(button.id);
        }}
        onDragEnd={() => {
          handleDragEnd();
        }}
        style={[
          styles.draggableButton,
          {
            width: cellSize,
            height: cellSize,
          },
          isDragging && styles.draggableButtonActive,
        ]}
      >
        <Pressable
          style={[
            styles.gridButton,
            {
              backgroundColor: button.color || colors.button.default,
            },
          ]}
          onPress={() => {
            if (!isDragging) {
              setEditingButton(button);
              setButtonLabel(button.label);
              setButtonSpeechText(button.speech_text);
              setButtonImagePath(button.image_path);
              setButtonSymbolPath(button.symbol_path || null);
              setShowButtonModal(true);
            }
          }}
          onLongPress={() => {
            if (!isDragging) {
              handleDeleteButton(button);
            }
          }}
          delayLongPress={500}
        >
          {(button.symbol_path && isValidImageUri(button.symbol_path)) && (
            <Image
              source={{ uri: button.symbol_path }}
              style={styles.gridButtonImage}
              resizeMode="contain"
            />
          )}
          {(button.image_path && isValidImageUri(button.image_path) && !button.symbol_path) && (
            <Image
              source={{ uri: button.image_path }}
              style={styles.gridButtonImage}
              resizeMode="cover"
            />
          )}
          <Text style={styles.gridButtonLabel} numberOfLines={2}>
            {button.label}
          </Text>
        </Pressable>
      </Draggable>
    );
  };

  // Render grid cell
  const renderGridCell = (index: number) => {
    const { x, y } = indexToPosition(index);
    const button = buttons.find((b) => b.x === x && b.y === y);

    return (
      <Droppable
        key={`cell-${index}`}
        droppableId={`cell-${x}-${y}`}
        onDrop={getDropHandler(x, y)}
        style={[
          styles.gridCell,
          {
            width: cellSize,
            height: cellSize,
            marginRight: x < gridCols - 1 ? GRID_GAP : 0,
            marginBottom: y < gridRows - 1 ? GRID_GAP : 0,
          },
        ]}
        activeStyle={styles.gridCellActive}
      >
        {button ? (
          renderGridButton(button)
        ) : (
          <Pressable
            style={styles.emptyCell}
            onPress={() => {
              setTargetPosition({ x, y });
              setEditingButton(null);
              setButtonLabel('');
              setButtonSpeechText('');
              setButtonImagePath(null);
              setButtonSymbolPath(null);
              setShowButtonModal(true);
            }}
          >
            <Text style={styles.emptyCellText}>+</Text>
          </Pressable>
        )}
      </Droppable>
    );
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
    <GestureHandlerRootView style={styles.container}>
      <DropProvider>
        <ToastContainer />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {board ? 'Edit Board' : 'Create Board'}
            </Text>
          </View>

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
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grid Size</Text>
              <View style={styles.gridControls}>
                <View style={styles.gridControlGroup}>
                  <Text style={styles.gridLabel}>Columns</Text>
                  <View style={styles.gridButtons}>
                    <TouchableOpacity
                      style={styles.gridButtonControl}
                      onPress={() => setGridCols(Math.max(2, gridCols - 1))}
                    >
                      <Text style={styles.gridButtonControlText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.gridValue}>{gridCols}</Text>
                    <TouchableOpacity
                      style={styles.gridButtonControl}
                      onPress={() => setGridCols(Math.min(6, gridCols + 1))}
                    >
                      <Text style={styles.gridButtonControlText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.gridControlGroup}>
                  <Text style={styles.gridLabel}>Rows</Text>
                  <View style={styles.gridButtons}>
                    <TouchableOpacity
                      style={styles.gridButtonControl}
                      onPress={() => setGridRows(Math.max(2, gridRows - 1))}
                    >
                      <Text style={styles.gridButtonControlText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.gridValue}>{gridRows}</Text>
                    <TouchableOpacity
                      style={styles.gridButtonControl}
                      onPress={() => setGridRows(Math.min(6, gridRows + 1))}
                    >
                      <Text style={styles.gridButtonControlText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.saveBoardButton} onPress={handleSaveBoard}>
              <Text style={styles.saveBoardButtonText}>💾 Save Board Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Grid View */}
          {board && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Board Layout</Text>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowSearch(true)}
                  >
                    <Text style={styles.actionButtonText}>🔍</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleAddButton}
                  >
                    <Text style={styles.actionButtonText}>+</Text>
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
                  {Array.from({ length: gridRows * gridCols }).map((_, index) =>
                    renderGridCell(index)
                  )}
                </View>
              </View>

              <Text style={styles.hintText}>
                💡 Long press a button to delete, drag to move
              </Text>
            </View>
          )}

          {/* Delete Board */}
          {board && (
            <TouchableOpacity
              style={styles.deleteBoardButton}
              onPress={handleDeleteBoard}
            >
              <Text style={styles.deleteBoardButtonText}>🗑️ Delete Board</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Sticky Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <TouchableOpacity style={styles.cancelFooterButton} onPress={onCancel}>
            <Text style={styles.cancelFooterButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneFooterButton} onPress={onSave || onCancel}>
            <Text style={styles.doneFooterButtonText}>✓ Done</Text>
          </TouchableOpacity>
        </View>
      </DropProvider>

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
              <Text style={styles.modalClose}>✕</Text>
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
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Speech Text</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={buttonSpeechText}
                onChangeText={setButtonSpeechText}
                placeholder="e.g., 'I want more'"
                placeholderTextColor={colors.text.secondary}
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Image</Text>
              {(buttonImagePath || buttonSymbolPath) && (
                <View style={styles.previewContainer}>
                  {buttonImagePath && isValidImageUri(buttonImagePath) && (
                    <Image
                      source={{ uri: buttonImagePath }}
                      style={styles.previewImage}
                    />
                  )}
                  {buttonSymbolPath && isValidImageUri(buttonSymbolPath) && (
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
                  <Text style={styles.imageButtonText}>📷 Choose Photo</Text>
                </TouchableOpacity>
                {board && (
                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={() => {
                      setShowButtonModal(false);
                      setShowPhotoCapture(true);
                    }}
                  >
                    <Text style={styles.imageButtonText}>📸 Take Photo</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => {
                    setShowSymbolPicker(true);
                  }}
                >
                  <Text style={styles.imageButtonText}>🎨 Choose Symbol</Text>
                </TouchableOpacity>
                {(buttonImagePath || buttonSymbolPath) && (
                  <TouchableOpacity
                    style={[styles.imageButton, styles.removeButton]}
                    onPress={() => {
                      setButtonImagePath(null);
                      setButtonSymbolPath(null);
                    }}
                  >
                    <Text style={styles.removeButtonText}>🗑️ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveButton}
              disabled={!buttonLabel.trim() || !buttonSpeechText.trim()}
            >
              <Text style={styles.saveButtonText}>
                {editingButton ? '💾 Save Changes' : '✨ Create Button'}
              </Text>
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

      <ConfirmationDialog
        visible={deleteConfirmVisible}
        title="Delete Button"
        message={`Are you sure you want to delete "${buttonToDelete?.label}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteButton}
        onCancel={() => {
          setDeleteConfirmVisible(false);
          setButtonToDelete(null);
        }}
        destructive={true}
      />
    </GestureHandlerRootView>
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
  header: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.heading.h1,
    color: colors.text.primary,
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
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  hintText: {
    ...typography.body.small,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 20,
    color: colors.text.light,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label.medium,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body.medium,
    backgroundColor: colors.background.light,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  gridControls: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  gridControlGroup: {
    flex: 1,
  },
  gridLabel: {
    ...typography.label.medium,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  gridButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  gridButtonControl: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridButtonControlText: {
    fontSize: 24,
    color: colors.text.light,
    fontWeight: '700',
  },
  gridValue: {
    ...typography.heading.h2,
    minWidth: 40,
    textAlign: 'center',
    color: colors.text.primary,
  },
  saveBoardButton: {
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBoardButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  gridContainer: {
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  gridCellActive: {
    backgroundColor: colors.primary[100],
    borderWidth: 2,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.md,
  },
  draggableButton: {
    borderRadius: borderRadius.md,
  },
  draggableButtonActive: {
    opacity: 0.7,
    transform: [{ scale: 1.05 }],
    zIndex: 1000,
    elevation: 10,
  },
  gridButton: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  gridButtonImage: {
    width: '60%',
    height: '60%',
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  gridButtonLabel: {
    ...typography.body.small,
    color: colors.text.primary,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCell: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.neutral[300],
  },
  emptyCellText: {
    fontSize: 32,
    color: colors.text.secondary,
    fontWeight: '300',
  },
  deleteBoardButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  deleteBoardButtonText: {
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
  doneFooterButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  doneFooterButtonText: {
    ...typography.button.large,
    color: colors.text.light,
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    ...typography.heading.h2,
    color: colors.text.primary,
  },
  modalClose: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  imageButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  imageButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.primary[500],
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
    color: colors.text.light,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  errorText: {
    ...typography.body.medium,
    color: colors.error,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
