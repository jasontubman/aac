import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { spacing } from '../../theme';
import { AACButton } from './Button';
import type { Button as ButtonType, Board } from '../../database/types';
import { useAACStore } from '../../store/aacStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useAccessibility } from '../../hooks/useAccessibility';
import { SwitchScanner } from '../accessibility/SwitchScanner';

interface BoardGridProps {
  board: Board;
  buttons: ButtonType[];
  onButtonPress?: (button: ButtonType) => void;
}

export const BoardGrid = memo<BoardGridProps>(({ board, buttons, onButtonPress }) => {
  const { currentButtons } = useAACStore();
  const { isFeatureAvailable } = useSubscriptionStore();
  const { settings } = useAccessibility();
  const [switchScanningEnabled, setSwitchScanningEnabled] = useState(false);

  // Use provided buttons or current buttons from store
  const displayButtons = buttons.length > 0 ? buttons : currentButtons;

  // Check if switch scanning is available and enabled
  const canUseSwitchScanning = isFeatureAvailable('switch_scanning') && settings.switchScanning;

  useEffect(() => {
    // Enable switch scanning if available
    setSwitchScanningEnabled(canUseSwitchScanning);
  }, [canUseSwitchScanning]);

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

  const handleSwitchSelect = useCallback((button: ButtonType) => {
    onButtonPress?.(button);
  }, [onButtonPress]);

  return (
    <View style={styles.container}>
      {switchScanningEnabled && (
        <SwitchScanner
          items={displayButtons}
          onSelect={handleSwitchSelect}
          scanSpeed={settings.scanSpeed || 1000}
          enabled={switchScanningEnabled}
        />
      )}
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
