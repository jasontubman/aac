import { Platform } from 'react-native';

// Typography system - large, readable fonts for accessibility

export const typography = {
  // Display sizes - for large headings
  display: {
    large: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    medium: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    small: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600' as const,
    },
  },

  // Heading sizes
  heading: {
    h1: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700' as const,
    },
    h2: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as const,
    },
    h3: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as const,
    },
    h4: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600' as const,
    },
  },

  // Body text
  body: {
    large: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: '400' as const,
    },
    medium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
    },
  },

  // Button text
  button: {
    large: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    },
    medium: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600' as const,
      letterSpacing: 0.3,
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as const,
    },
  },

  // Label text (for buttons, inputs)
  label: {
    large: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '500' as const,
    },
    medium: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
    },
    small: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500' as const,
    },
  },

  // Caption text
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
};

// Font families
export const fontFamilies = {
  default: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
};

// Accessibility text scaling
export function getScaledFontSize(baseSize: number, scaleFactor: number = 1): number {
  return Math.round(baseSize * scaleFactor);
}
