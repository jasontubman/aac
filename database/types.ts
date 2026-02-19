// Database type definitions

export interface Profile {
  id: string;
  name: string;
  created_at: number;
  avatar_path: string | null;
  settings_json: string; // JSON string
}

export interface ProfileSettings {
  gridSize?: { cols: number; rows: number };
  theme?: 'light' | 'dark' | 'highContrast';
  reducedMotion?: boolean;
  voiceId?: string;
  voiceRate?: number;
  voicePitch?: number;
  switchScanning?: boolean;
  dwellSelection?: boolean;
  scanSpeed?: number; // milliseconds
  dwellTime?: number; // milliseconds
  advancedFeatures?: {
    behaviorDetection?: boolean;
    emotionSuggestions?: boolean;
    usageAnalytics?: boolean;
    autoSave?: boolean;
  };
}

export interface Board {
  id: string;
  profile_id: string;
  name: string;
  is_core: number; // 0 or 1
  grid_cols: number;
  grid_rows: number;
  created_at: number;
  updated_at: number;
}

export interface Button {
  id: string;
  board_id: string;
  label: string;
  speech_text: string;
  image_path: string;
  symbol_path: string | null;
  position: number;
  color: string | null;
  is_pinned: number; // 0 or 1
  created_at: number;
}

export interface Routine {
  id: string;
  profile_id: string;
  name: string;
  pinned_button_ids_json: string; // JSON array of button IDs
  created_at: number;
  updated_at: number;
}

export interface MediaAsset {
  id: string;
  profile_id: string;
  file_path: string;
  type: 'photo' | 'symbol';
  created_at: number;
}

export interface Utterance {
  id: string;
  profile_id: string;
  text: string;
  timestamp: number;
  routine_id: string | null;
}

export interface SubscriptionStatus {
  id: number;
  status: 'uninitialized' | 'trial_active' | 'active_subscribed' | 'grace_period' | 'expired_limited_mode';
  expires_at: number | null;
  product_id: string | null;
  last_validated_at: number;
  trial_started_at: number | null;
  grace_period_ends_at: number | null;
  cached_entitlements_json: string;
}

export interface UsageLog {
  id: number;
  profile_id: string;
  event_type: string;
  timestamp: number;
  metadata_json: string;
}
