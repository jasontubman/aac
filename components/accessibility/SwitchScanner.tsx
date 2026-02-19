import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing } from '../../theme';
import { SCAN_SPEED } from '../../utils/constants';

interface SwitchScannerProps {
  items: any[];
  onSelect: (item: any) => void;
  scanSpeed?: number; // milliseconds per item
  enabled?: boolean;
}

export const SwitchScanner: React.FC<SwitchScannerProps> = ({
  items,
  onSelect,
  scanSpeed = SCAN_SPEED.NORMAL,
  enabled = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const highlightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (enabled && items.length > 0) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [enabled, items.length]);

  const startScanning = () => {
    setIsScanning(true);
    setCurrentIndex(0);
    
    scanIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % items.length;
        
        // Animate highlight
        Animated.sequence([
          Animated.timing(highlightAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
          }),
          Animated.timing(highlightAnim, {
            toValue: 0,
            duration: scanSpeed - 200,
            useNativeDriver: false,
          }),
        ]).start();

        return next;
      });
    }, scanSpeed);
  };

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const handleSelect = () => {
    if (items[currentIndex]) {
      onSelect(items[currentIndex]);
      stopScanning();
    }
  };

  // Expose select function for external switch input
  React.useImperativeHandle(
    React.forwardRef(() => null),
    () => ({
      select: handleSelect,
    }),
    [currentIndex, items]
  );

  if (!enabled || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isHighlighted = index === currentIndex && isScanning;
        return (
          <Animated.View
            key={item.id || index}
            style={[
              styles.item,
              isHighlighted && {
                backgroundColor: highlightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [colors.primary[50], colors.primary[300]],
                }),
                borderWidth: 3,
                borderColor: colors.primary[500],
              },
            ]}
          >
            {/* Item content would be rendered here by parent */}
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  item: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
