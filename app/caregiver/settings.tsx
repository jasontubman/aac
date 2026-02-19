import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useProfileStore } from '../../store/profileStore';
import { appStorage } from '../../services/storage';
import type { ProfileSettings } from '../../database/types';

interface AdvancedFeatures {
  behaviorDetection: boolean;
  emotionSuggestions: boolean;
  usageAnalytics: boolean; // Local only
  autoSave: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { activeProfile, updateProfileSettings } = useProfileStore();
  const [behaviorDetection, setBehaviorDetection] = useState(false);
  const [emotionSuggestions, setEmotionSuggestions] = useState(false);
  const [usageAnalytics, setUsageAnalytics] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeTargets, setLargeTargets] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [activeProfile]);

  const loadSettings = () => {
    if (!activeProfile) return;

    const settings: ProfileSettings = JSON.parse(
      activeProfile.settings_json || '{}'
    );
    const advanced: AdvancedFeatures = {
      behaviorDetection: settings.advancedFeatures?.behaviorDetection ?? false,
      emotionSuggestions: settings.advancedFeatures?.emotionSuggestions ?? false,
      usageAnalytics: settings.advancedFeatures?.usageAnalytics ?? false,
      autoSave: settings.advancedFeatures?.autoSave ?? true,
    };

    setBehaviorDetection(advanced.behaviorDetection);
    setEmotionSuggestions(advanced.emotionSuggestions);
    setUsageAnalytics(advanced.usageAnalytics);
    setAutoSave(advanced.autoSave);

    // Accessibility settings
    setHighContrast(settings.theme === 'highContrast');
    setReducedMotion(settings.reducedMotion || false);
    setLargeTargets(settings.gridSize?.cols === 2 || false);
  };

  const saveSettings = async () => {
    if (!activeProfile) return;

    const settings: ProfileSettings = {
      ...JSON.parse(activeProfile.settings_json || '{}'),
      advancedFeatures: {
        behaviorDetection,
        emotionSuggestions,
        usageAnalytics,
        autoSave,
      },
      theme: highContrast ? 'highContrast' : 'light',
      reducedMotion,
      gridSize: largeTargets
        ? { cols: 2, rows: 2 }
        : { cols: 4, rows: 4 },
    };

    await updateProfileSettings(activeProfile.id, settings);
    Alert.alert('Success', 'Settings saved');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Advanced Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced Features</Text>
        <Text style={styles.sectionDescription}>
          Enable or disable advanced features that may help with communication
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Behavior Detection</Text>
            <Text style={styles.settingDescription}>
              Detects patterns that might indicate frustration or emotional
              state. All analysis is done locally on your device.
            </Text>
          </View>
          <Switch
            value={behaviorDetection}
            onValueChange={setBehaviorDetection}
            trackColor={{
              false: colors.neutral[300],
              true: colors.primary[500],
            }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Emotion Suggestions</Text>
            <Text style={styles.settingDescription}>
              Suggests emotions based on detected behavior patterns. Only
              appears when behavior detection is enabled.
            </Text>
          </View>
          <Switch
            value={emotionSuggestions}
            onValueChange={setEmotionSuggestions}
            disabled={!behaviorDetection}
            trackColor={{
              false: colors.neutral[300],
              true: colors.primary[500],
            }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Local Usage Analytics</Text>
            <Text style={styles.settingDescription}>
              Tracks usage patterns locally to help improve the app experience.
              No data is sent anywhere - stored only on this device.
            </Text>
          </View>
          <Switch
            value={usageAnalytics}
            onValueChange={setUsageAnalytics}
            trackColor={{
              false: colors.neutral[300],
              true: colors.primary[500],
            }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto-Save</Text>
            <Text style={styles.settingDescription}>
              Automatically save changes to boards and buttons as you edit
              them.
            </Text>
          </View>
          <Switch
            value={autoSave}
            onValueChange={setAutoSave}
            trackColor={{
              false: colors.neutral[300],
              true: colors.primary[500],
            }}
          />
        </View>
      </View>

      {/* Accessibility Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibility</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>High Contrast Theme</Text>
            <Text style={styles.settingDescription}>
              Increases contrast for better visibility
            </Text>
          </View>
          <Switch
            value={highContrast}
            onValueChange={setHighContrast}
            trackColor={{
              false: colors.neutral[300],
              true: colors.primary[500],
            }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Reduced Motion</Text>
            <Text style={styles.settingDescription}>
              Minimizes animations and transitions
            </Text>
          </View>
          <Switch
            value={reducedMotion}
            onValueChange={setReducedMotion}
            trackColor={{
              false: colors.neutral[300],
              true: colors.primary[500],
            }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Large Touch Targets</Text>
            <Text style={styles.settingDescription}>
              Increases button sizes for easier tapping (2x2 grid)
            </Text>
          </View>
          <Switch
            value={largeTargets}
            onValueChange={setLargeTargets}
            trackColor={{
              false: colors.neutral[300],
              true: colors.primary[500],
            }}
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>

      {/* Legal Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/caregiver/privacy')}
        >
          <Text style={styles.linkButtonText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/caregiver/terms')}
        >
          <Text style={styles.linkButtonText}>Terms of Service</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About Advanced Features</Text>
        <Text style={styles.infoText}>
          Behavior detection analyzes button tapping patterns locally on your
          device to identify potential frustration or emotional states. This
          helps suggest relevant emotions in the emotion flow feature.
        </Text>
        <Text style={styles.infoText}>
          All analysis is done completely offline. No data is collected or sent
          anywhere. You can disable these features at any time.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    padding: spacing.md,
  },
  title: {
    ...typography.heading.h1,
    marginBottom: spacing.xl,
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
  },
  sectionTitle: {
    ...typography.heading.h2,
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  sectionDescription: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.label.medium,
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  settingDescription: {
    ...typography.body.small,
    color: colors.text.secondary,
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  saveButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  infoSection: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    ...typography.heading.h3,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  infoText: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  linkButton: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  linkButtonText: {
    ...typography.body.medium,
    color: colors.primary[600],
  },
});
