import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing } from '../../theme';
import { DWELL_TIME } from '../../utils/constants';

interface DwellSelectorProps {
  children: React.ReactNode;
  onSelect: () => void;
  dwellTime?: number; // milliseconds
  enabled?: boolean;
}

export const DwellSelector: React.FC<DwellSelectorProps> = ({
  children,
  onSelect,
  dwellTime = DWELL_TIME.DEFAULT,
  enabled = true,
}) => {
  const [isDwelling, setIsDwelling] = useState(false);
  const [progress, setProgress] = useState(0);
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const startDwell = () => {
    if (!enabled) return;

    setIsDwelling(true);
    setProgress(0);

    // Animate progress
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: dwellTime,
      useNativeDriver: false,
    }).start();

    // Update progress for visual feedback
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / dwellTime, 1);
      setProgress(newProgress);
    }, 50);

    // Trigger selection after dwell time
    dwellTimerRef.current = setTimeout(() => {
      onSelect();
      cancelDwell();
    }, dwellTime);
  };

  const cancelDwell = () => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsDwelling(false);
    setProgress(0);
    progressAnim.setValue(0);
  };

  useEffect(() => {
    return () => {
      cancelDwell();
    };
  }, []);

  return (
    <View
      style={styles.container}
      onTouchStart={startDwell}
      onTouchEnd={cancelDwell}
      onTouchCancel={cancelDwell}
    >
      {children}
      {isDwelling && (
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
});
