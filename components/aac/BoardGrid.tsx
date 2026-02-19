import React, { memo, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { spacing } from '../../theme';
import { AACButton } from './Button';
import type { Button as ButtonType, Board } from '../../database/types';
import { useAACStore } from '../../store/aacStore';

interface BoardGridProps {
  board: Board;
  buttons: ButtonType[];
  onButtonPress?: (button: ButtonType) => void;
}

export const BoardGrid = memo<BoardGridProps>(({ board, buttons, onButtonPress }) => {
  const { currentButtons } = useAACStore();

  // Use provided buttons or current buttons from store
  const displayButtons = buttons.length > 0 ? buttons : currentButtons;

  // Calculate button size based on grid dimensions
  const buttonSize = useMemo(() => {
    // Account for padding and gaps
    const padding = spacing.md * 2;
    const gaps = (board.grid_cols - 1) * spacing.sm;
    const availableWidth = 400 - padding - gaps; // Approximate screen width
    return Math.floor(availableWidth / board.grid_cols);
  }, [board.grid_cols]);

  const renderButton = useCallback(
    ({ item, index }: { item: ButtonType; index: number }) => {
      return (
        <View style={styles.buttonWrapper}>
          <AACButton
            button={item}
            size={buttonSize}
            onPress={() => onButtonPress?.(item)}
          />
        </View>
      );
    },
    [buttonSize, onButtonPress]
  );

  const keyExtractor = useCallback((item: ButtonType) => item.id, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={displayButtons}
        renderItem={renderButton}
        keyExtractor={keyExtractor}
        numColumns={board.grid_cols}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={16}
      />
    </View>
  );
});

BoardGrid.displayName = 'BoardGrid';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  grid: {
    justifyContent: 'flex-start',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: spacing.xs / 2,
  },
});
