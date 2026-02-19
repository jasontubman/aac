// App constants

// Subscription products
export const SUBSCRIPTION_PRODUCTS = {
  MONTHLY: 'monthly_subscription',
  ANNUAL: 'annual_subscription',
} as const;

export const SUBSCRIPTION_PRICES = {
  MONTHLY: 4.99,
  ANNUAL: 34.99,
} as const;

export const TRIAL_DAYS = 14;
export const GRACE_PERIOD_DAYS = 3;

// Subscription status
export type SubscriptionStatus =
  | 'uninitialized'
  | 'trial_active'
  | 'active_subscribed'
  | 'grace_period'
  | 'expired_limited_mode';

// Feature flags (for subscription gating)
export const FEATURES = {
  ROUTINES: 'routines',
  CUSTOM_BOARDS: 'custom_boards',
  PHOTO_ADDITIONS: 'photo_additions',
  MULTI_PROFILE: 'multi_profile',
  EMOTION_FLOW: 'emotion_flow',
  BOARD_EDITING: 'board_editing',
  SWITCH_SCANNING: 'switch_scanning',
  DWELL_SELECTION: 'dwell_selection',
  GRID_SIZE_ADJUSTMENT: 'grid_size_adjustment',
} as const;

// Features always available (even in fallback mode)
export const ALWAYS_AVAILABLE_FEATURES = [
  'core_board',
  'speak',
  'basic_tts',
  'high_contrast_theme',
  'reduced_motion',
] as const;

// Grid sizes
export const GRID_SIZES = {
  MIN_COLS: 2,
  MAX_COLS: 6,
  MIN_ROWS: 2,
  MAX_ROWS: 6,
  DEFAULT_COLS: 4,
  DEFAULT_ROWS: 4,
} as const;

// Core vocabulary words (for fallback mode)
export const CORE_VOCABULARY = [
  // People
  'I', 'you', 'me', 'mom', 'dad', 'help',
  // Actions
  'want', 'need', 'go', 'stop', 'more', 'done', 'yes', 'no',
  // Objects
  'water', 'food', 'bathroom', 'toilet',
  // Feelings
  'happy', 'sad', 'hurt', 'tired',
  // Places
  'home', 'school',
  // Time
  'now', 'later',
] as const;

// Caregiver gate
export const CAREGIVER_GATE = {
  MAX_ATTEMPTS: 3,
  TIMEOUT_SECONDS: 30,
  MIN_MATH_VALUE: 10,
  MAX_MATH_VALUE: 99,
} as const;

// Animation durations (ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Touch target sizes (points)
export const TOUCH_TARGET = {
  MIN: 44,
  LARGE: 60,
  EXTRA_LARGE: 80,
} as const;

// Dwell selection
export const DWELL_TIME = {
  MIN: 500, // 0.5 seconds
  MAX: 3000, // 3 seconds
  DEFAULT: 1000, // 1 second
} as const;

// Switch scanning
export const SCAN_SPEED = {
  SLOW: 2000, // 2 seconds per item
  NORMAL: 1000, // 1 second per item
  FAST: 500, // 0.5 seconds per item
} as const;
