import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { highContrastColors } from '../../theme/colors';

/**
 * High contrast theme wrapper
 * Applies high contrast colors to components
 */
export function useHighContrastTheme(enabled: boolean) {
  if (!enabled) {
    return {
      colors: {},
      styles: {},
    };
  }

  return {
    colors: highContrastColors,
    styles: {
      container: {
        backgroundColor: highContrastColors.background,
      } as ViewStyle,
      text: {
        color: highContrastColors.text,
      } as TextStyle,
      button: {
        backgroundColor: highContrastColors.button,
        borderColor: highContrastColors.border,
        borderWidth: 2,
      } as ViewStyle,
      buttonText: {
        color: highContrastColors.buttonText,
      } as TextStyle,
    },
  };
}
