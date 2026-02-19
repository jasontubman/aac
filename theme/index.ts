// Theme system exports

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './accessibility';

import { colors, getThemeColors, ColorTheme } from './colors';
import { typography, fontFamilies, getScaledFontSize } from './typography';
import { spacing, componentSpacing, borderRadius, buttonRadius } from './spacing';
import {
  AccessibilityTheme,
  defaultAccessibilityTheme,
  getAccessibilityColors,
  getAccessibilitySpacing,
  getAccessibilityTypography,
  getTouchTargetSize,
  getAnimationDuration,
  getTransitionStyle,
  MIN_TOUCH_TARGET_SIZE,
  LARGE_TOUCH_TARGET_SIZE,
} from './accessibility';

export const theme = {
  colors,
  typography,
  spacing,
  componentSpacing,
  borderRadius,
  buttonRadius,
  fontFamilies,
  getThemeColors,
  getScaledFontSize,
};

export type { ColorTheme, AccessibilityTheme };

export {
  defaultAccessibilityTheme,
  getAccessibilityColors,
  getAccessibilitySpacing,
  getAccessibilityTypography,
  getTouchTargetSize,
  getAnimationDuration,
  getTransitionStyle,
  MIN_TOUCH_TARGET_SIZE,
  LARGE_TOUCH_TARGET_SIZE,
};
