import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, getTouchTargetSize, defaultAccessibilityTheme } from '../../theme';
import type { Button as ButtonType } from '../../database/types';
import { useAACStore } from '../../store/aacStore';
import { useSpeech } from '../../hooks/useSpeech';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useAccessibility } from '../../hooks/useAccessibility';
import { DwellSelector } from '../accessibility/DwellSelector';
import { usageAnalytics } from '../../services/usageAnalytics';
import { isValidImageUri } from '../../utils/performance';

interface AACButtonProps {
  button: ButtonType;
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export const AACButton = memo<AACButtonProps>(({ button, size = 100, onPress, style }) => {
  const { addToSentence, currentBoard } = useAACStore();
  const { speak } = useSpeech();
  const { isFeatureAvailable } = useSubscriptionStore();
  const { settings } = useAccessibility();

  const canUseDwellSelection = isFeatureAvailable('dwell_selection') && settings.dwellSelection;

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    // Log button tap
    if (currentBoard) {
      await usageAnalytics.logButtonTap(button.id, button.label, currentBoard.id);
    }

    // Add to sentence
    addToSentence(button);
    
    // Speak immediately if speech_text exists
    if (button.speech_text && button.speech_text.trim().length > 0) {
      await speak(button.speech_text);
    } else {
      console.warn('Button has no speech_text:', button.label, button.id);
    }
  };

  const buttonSize = Math.max(size, getTouchTargetSize(defaultAccessibilityTheme));

  const buttonContent = (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          backgroundColor: button.color || colors.button.default,
          borderRadius: borderRadius.lg,
        },
        style,
      ]}
      onPress={canUseDwellSelection ? undefined : handlePress}
      activeOpacity={0.7}
      accessibilityLabel={button.label}
      accessibilityHint={`Speaks: ${button.speech_text}`}
      accessibilityRole="button"
    >
      {(button.symbol_path && isValidImageUri(button.symbol_path)) && (
        <Image
          source={{ uri: button.symbol_path }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
      {(button.image_path && isValidImageUri(button.image_path)) && (
        <Image
          source={{ uri: button.image_path }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <Text style={styles.label} numberOfLines={2}>
        {button.label}
      </Text>
    </TouchableOpacity>
  );

  if (canUseDwellSelection) {
    return (
      <DwellSelector
        onSelect={handlePress}
        dwellTime={settings.dwellTime || 1500}
        enabled={canUseDwellSelection}
      >
        {buttonContent}
      </DwellSelector>
    );
  }

  return buttonContent;
});

AACButton.displayName = 'AACButton';

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '60%',
    height: '60%',
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
});
