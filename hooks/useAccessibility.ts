import { useEffect } from 'react';
import { useProfileStore } from '../store/profileStore';
import { appStorage } from '../services/storage';
import type { AccessibilityTheme } from '../theme/accessibility';
import { defaultAccessibilityTheme } from '../theme/accessibility';

export function useAccessibility() {
  const { activeProfile } = useProfileStore();
  const [settings, setSettings] = React.useState<AccessibilityTheme>(
    defaultAccessibilityTheme
  );

  useEffect(() => {
    loadSettings();
  }, [activeProfile]);

  const loadSettings = () => {
    const cached = appStorage.getAccessibilitySettings();
    if (cached) {
      setSettings(cached);
    } else if (activeProfile) {
      const profileSettings = JSON.parse(activeProfile.settings_json || '{}');
      if (profileSettings.accessibility) {
        setSettings(profileSettings.accessibility);
      }
    }
  };

  const updateSettings = (newSettings: Partial<AccessibilityTheme>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    appStorage.setAccessibilitySettings(updated);

    // Also update profile settings
    if (activeProfile) {
      const profileSettings = JSON.parse(activeProfile.settings_json || '{}');
      profileSettings.accessibility = updated;
      // Update profile would go here
    }
  };

  return {
    settings,
    updateSettings,
  };
}

// Fix missing import
import React from 'react';
