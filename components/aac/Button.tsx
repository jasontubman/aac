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

interface AACButtonProps {
  button: ButtonType;
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export const AACButton = memo<AACButtonProps>(({ button, size = 100, onPress, style }) => {
  const { addToSentence } = useAACStore();
  const { speak } = useSpeech();
  const { isFeatureAvailable } = useSubscriptionStore();

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    // Add to sentence
    addToSentence(button);
    
    // Speak immediately
    await speak(button.speech_text);
  };

  const buttonSize = Math.max(size, getTouchTargetSize(defaultAccessibilityTheme));

  return (
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
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={button.label}
      accessibilityHint={`Speaks: ${button.speech_text}`}
      accessibilityRole="button"
    >
      {button.image_path && (
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
