// Spacing system - consistent spacing throughout the app

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Component-specific spacing
export const componentSpacing = {
  // Button spacing
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    minHeight: 48, // Minimum touch target size
  },

  // Board grid spacing
  board: {
    gap: spacing.sm,
    padding: spacing.md,
    buttonGap: spacing.xs,
  },

  // Screen padding
  screen: {
    horizontal: spacing.md,
    vertical: spacing.lg,
  },

  // Card spacing
  card: {
    padding: spacing.md,
    gap: spacing.sm,
    margin: spacing.md,
  },

  // Form spacing
  form: {
    gap: spacing.md,
    fieldGap: spacing.sm,
  },
};

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999, // Fully rounded
};

// Button border radius
export const buttonRadius = {
  small: borderRadius.md,
  medium: borderRadius.lg,
  large: borderRadius.xl,
  round: borderRadius.round,
};
