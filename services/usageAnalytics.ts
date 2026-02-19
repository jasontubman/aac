/**
 * Usage Analytics Service
 * 
 * Tracks user interactions locally for analytics purposes.
 * All data is stored locally and never sent anywhere.
 * Can be disabled by caregivers in settings.
 */

import { createUsageLog } from '../database/queries';
import { useProfileStore } from '../store/profileStore';
import type { ProfileSettings } from '../database/types';

// Event types
export const USAGE_EVENTS = {
  BUTTON_TAP: 'button_tap',
  SPEAK: 'speak',
  BOARD_SWITCH: 'board_switch',
  ROUTINE_SWITCH: 'routine_switch',
  BOARD_CREATE: 'board_create',
  BOARD_EDIT: 'board_edit',
  BOARD_DELETE: 'board_delete',
  BUTTON_CREATE: 'button_create',
  BUTTON_EDIT: 'button_edit',
  BUTTON_DELETE: 'button_delete',
  ROUTINE_CREATE: 'routine_create',
  ROUTINE_EDIT: 'routine_edit',
  ROUTINE_DELETE: 'routine_delete',
  EMOTION_FLOW_START: 'emotion_flow_start',
  EMOTION_SELECT: 'emotion_select',
  PROFILE_SWITCH: 'profile_switch',
  SETTINGS_CHANGE: 'settings_change',
} as const;

// Check if usage analytics is enabled for current profile
function isAnalyticsEnabled(): boolean {
  const { activeProfile } = useProfileStore.getState();
  if (!activeProfile) return false;

  try {
    const settings: ProfileSettings = JSON.parse(activeProfile.settings_json || '{}');
    return settings.advancedFeatures?.usageAnalytics ?? false;
  } catch {
    return false;
  }
}

// Log an event (only if analytics is enabled)
export async function logEvent(
  eventType: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  // Check if analytics is enabled
  if (!isAnalyticsEnabled()) {
    return;
  }

  const { activeProfile } = useProfileStore.getState();
  if (!activeProfile) {
    return;
  }

  try {
    await createUsageLog(activeProfile.id, eventType, metadata);
  } catch (error) {
    // Silent fail - analytics shouldn't break the app
    console.error('Error logging usage event:', error);
  }
}

// Helper functions for common events
export const usageAnalytics = {
  logButtonTap: (buttonId: string, buttonLabel: string, boardId: string) =>
    logEvent(USAGE_EVENTS.BUTTON_TAP, { buttonId, buttonLabel, boardId }),

  logSpeak: (text: string, boardId?: string) =>
    logEvent(USAGE_EVENTS.SPEAK, { text, boardId }),

  logBoardSwitch: (boardId: string, boardName: string) =>
    logEvent(USAGE_EVENTS.BOARD_SWITCH, { boardId, boardName }),

  logRoutineSwitch: (routineId: string, routineName: string) =>
    logEvent(USAGE_EVENTS.ROUTINE_SWITCH, { routineId, routineName }),

  logBoardCreate: (boardId: string, boardName: string) =>
    logEvent(USAGE_EVENTS.BOARD_CREATE, { boardId, boardName }),

  logBoardEdit: (boardId: string, changes: Record<string, any>) =>
    logEvent(USAGE_EVENTS.BOARD_EDIT, { boardId, ...changes }),

  logBoardDelete: (boardId: string, boardName: string) =>
    logEvent(USAGE_EVENTS.BOARD_DELETE, { boardId, boardName }),

  logButtonCreate: (buttonId: string, boardId: string) =>
    logEvent(USAGE_EVENTS.BUTTON_CREATE, { buttonId, boardId }),

  logButtonEdit: (buttonId: string, boardId: string) =>
    logEvent(USAGE_EVENTS.BUTTON_EDIT, { buttonId, boardId }),

  logButtonDelete: (buttonId: string, boardId: string) =>
    logEvent(USAGE_EVENTS.BUTTON_DELETE, { buttonId, boardId }),

  logRoutineCreate: (routineId: string, routineName: string) =>
    logEvent(USAGE_EVENTS.ROUTINE_CREATE, { routineId, routineName }),

  logRoutineEdit: (routineId: string, changes: Record<string, any>) =>
    logEvent(USAGE_EVENTS.ROUTINE_EDIT, { routineId, ...changes }),

  logRoutineDelete: (routineId: string, routineName: string) =>
    logEvent(USAGE_EVENTS.ROUTINE_DELETE, { routineId, routineName }),

  logEmotionFlowStart: () =>
    logEvent(USAGE_EVENTS.EMOTION_FLOW_START),

  logEmotionSelect: (emotion: string, need?: string) =>
    logEvent(USAGE_EVENTS.EMOTION_SELECT, { emotion, need }),

  logProfileSwitch: (profileId: string, profileName: string) =>
    logEvent(USAGE_EVENTS.PROFILE_SWITCH, { profileId, profileName }),

  logSettingsChange: (setting: string, value: any) =>
    logEvent(USAGE_EVENTS.SETTINGS_CHANGE, { setting, value }),
};
