import { colors, highContrastColors } from './colors';
import { spacing, componentSpacing } from './spacing';
import { typography } from './typography';

// Accessibility theme variants

export interface AccessibilityTheme {
  highContrast: boolean;
  reducedMotion: boolean;
  largeTargets: boolean;
  fontSizeScale: number; // 1.0 to 2.0
}

export const defaultAccessibilityTheme: AccessibilityTheme = {
  highContrast: false,
  reducedMotion: false,
  largeTargets: false,
  fontSizeScale: 1.0,
};

// Get accessibility-adjusted colors
export function getAccessibilityColors(theme: AccessibilityTheme) {
  if (theme.highContrast) {
    return highContrastColors;
  }
  return colors;
}

// Get accessibility-adjusted spacing
export function getAccessibilitySpacing(theme: AccessibilityTheme) {
  const baseSpacing = { ...spacing };
  const baseComponentSpacing = { ...componentSpacing };

  if (theme.largeTargets) {
    // Increase touch target sizes
    return {
      ...baseSpacing,
      ...baseComponentSpacing,
      button: {
        ...baseComponentSpacing.button,
        minHeight: 60, // Increased from 48
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
      },
      board: {
        ...baseComponentSpacing.board,
        gap: spacing.md,
        buttonGap: spacing.sm,
      },
    };
  }

  return {
    ...baseSpacing,
    ...baseComponentSpacing,
  };
}

// Get accessibility-adjusted typography
export function getAccessibilityTypography(theme: AccessibilityTheme) {
  const scale = theme.fontSizeScale;
  const scaledTypography = { ...typography };

  // Scale all font sizes
  Object.keys(scaledTypography).forEach((key) => {
    const category = scaledTypography[key as keyof typeof typography];
    if (typeof category === 'object' && category !== null) {
      Object.keys(category).forEach((subKey) => {
        const style = category[subKey as keyof typeof category];
        if (style && typeof style === 'object' && 'fontSize' in style) {
          style.fontSize = Math.round(style.fontSize * scale);
          style.lineHeight = Math.round(style.lineHeight * scale);
        }
      });
    }
  });

  return scaledTypography;
}

// Minimum touch target size (WCAG 2.1 Level AAA)
export const MIN_TOUCH_TARGET_SIZE = 44; // 44x44 points minimum
export const LARGE_TOUCH_TARGET_SIZE = 60; // 60x60 points for large targets

// Get touch target size based on accessibility settings
export function getTouchTargetSize(theme: AccessibilityTheme): number {
  return theme.largeTargets ? LARGE_TOUCH_TARGET_SIZE : MIN_TOUCH_TARGET_SIZE;
}

// Animation duration based on reduced motion preference
export function getAnimationDuration(
  theme: AccessibilityTheme,
  defaultDuration: number = 300
): number {
  return theme.reducedMotion ? 0 : defaultDuration;
}

// Get transition style based on reduced motion
export function getTransitionStyle(theme: AccessibilityTheme) {
  if (theme.reducedMotion) {
    return {
      transitionDuration: '0ms',
      transitionTimingFunction: 'linear',
    };
  }
  return {
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease-in-out',
  };
}
