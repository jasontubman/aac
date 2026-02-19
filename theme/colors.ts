// Color palette for AAC app - calm, child-friendly colors

export const colors = {
  // Primary colors - calm and friendly
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Secondary colors - warm and inviting
  secondary: {
    50: '#fef3c7',
    100: '#fde68a',
    200: '#fcd34d',
    300: '#fbbf24',
    400: '#f59e0b',
    500: '#d97706', // Main secondary
    600: '#b45309',
    700: '#92400e',
    800: '#78350f',
    900: '#451a03',
  },

  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Background colors
  background: {
    light: '#ffffff',
    dark: '#171717',
    highContrast: '#000000',
  },

  // Text colors
  text: {
    primary: '#171717',
    secondary: '#525252',
    light: '#ffffff',
    highContrast: '#ffffff',
  },

  // Button colors
  button: {
    default: '#0ea5e9',
    pressed: '#0284c7',
    disabled: '#d4d4d4',
    highContrast: '#ffffff',
    highContrastBorder: '#000000',
  },
};

// High contrast theme colors
export const highContrastColors = {
  background: '#000000',
  surface: '#1a1a1a',
  text: '#ffffff',
  textSecondary: '#cccccc',
  border: '#ffffff',
  button: '#ffffff',
  buttonText: '#000000',
  buttonPressed: '#cccccc',
  primary: '#ffffff',
  secondary: '#ffff00',
  error: '#ff0000',
  success: '#00ff00',
};

// Theme type
export type ColorTheme = 'light' | 'dark' | 'highContrast';

export function getThemeColors(theme: ColorTheme) {
  if (theme === 'highContrast') {
    return highContrastColors;
  }
  return colors;
}
