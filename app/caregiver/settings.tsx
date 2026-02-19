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
import { Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useProfileStore } from '../../store/profileStore';
import { appStorage } from '../../services/storage';
import type { ProfileSettings } from '../../database/types';
import { POLICY_URLS, shouldUseInAppScreens } from '../../utils/policyUrls';
import { exportAndShareProfileData } from '../../services/export';
import * as Speech from 'expo-speech';

interface AdvancedFeatures {
  behaviorDetection: boolean;
  emotionSuggestions: boolean;
  usageAnalytics: boolean; // Local only
  autoSave: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeProfile, updateProfileSettings } = useProfileStore();
  const [behaviorDetection, setBehaviorDetection] = useState(false);
  const [emotionSuggestions, setEmotionSuggestions] = useState(false);
  const [usageAnalytics, setUsageAnalytics] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeTargets, setLargeTargets] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<Speech.Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [voiceRate, setVoiceRate] = useState(0.5);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadSettings();
    loadVoices();
  }, [activeProfile]);

  const loadVoices = async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      setAvailableVoices(voices);
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  };

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

    // Voice/TTS settings
    setSelectedVoice(settings.voiceId || '');
    setVoiceRate(settings.voiceRate ?? 0.5);
    setVoicePitch(settings.voicePitch ?? 1.0);
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
      voiceId: selectedVoice || undefined,
      voiceRate,
      voicePitch,
    };

    await updateProfileSettings(activeProfile.id, settings);
    Alert.alert('Success', 'Settings saved');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
    >

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

      {/* Voice & TTS Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice & Speech</Text>
        <Text style={styles.sectionDescription}>
          Customize text-to-speech voice and settings
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Voice</Text>
            <Text style={styles.settingDescription}>
              Select a voice for speech output
            </Text>
          </View>
        </View>
        {availableVoices.length > 0 && (
          <View style={styles.voicePicker}>
            {availableVoices.slice(0, 5).map((voice) => (
              <TouchableOpacity
                key={voice.identifier}
                style={[
                  styles.voiceOption,
                  selectedVoice === voice.identifier && styles.voiceOptionSelected,
                ]}
                onPress={() => setSelectedVoice(voice.identifier)}
              >
                <Text
                  style={[
                    styles.voiceOptionText,
                    selectedVoice === voice.identifier && styles.voiceOptionTextSelected,
                  ]}
                >
                  {voice.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Speech Rate</Text>
            <Text style={styles.settingDescription}>
              Speed of speech: {voiceRate.toFixed(1)}x
            </Text>
          </View>
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>0.0</Text>
          <View style={styles.sliderWrapper}>
            <View
              style={[
                styles.sliderTrack,
                { width: `${(voiceRate / 1.0) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.sliderLabel}>1.0</Text>
        </View>
        <View style={styles.sliderButtons}>
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={() => setVoiceRate(Math.max(0, voiceRate - 0.1))}
          >
            <Text>-</Text>
          </TouchableOpacity>
          <Text style={styles.sliderValue}>{voiceRate.toFixed(1)}</Text>
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={() => setVoiceRate(Math.min(1.0, voiceRate + 0.1))}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Pitch</Text>
            <Text style={styles.settingDescription}>
              Voice pitch: {voicePitch.toFixed(1)}x
            </Text>
          </View>
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>0.5</Text>
          <View style={styles.sliderWrapper}>
            <View
              style={[
                styles.sliderTrack,
                { width: `${((voicePitch - 0.5) / 1.5) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.sliderLabel}>2.0</Text>
        </View>
        <View style={styles.sliderButtons}>
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={() => setVoicePitch(Math.max(0.5, voicePitch - 0.1))}
          >
            <Text>-</Text>
          </TouchableOpacity>
          <Text style={styles.sliderValue}>{voicePitch.toFixed(1)}</Text>
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={() => setVoicePitch(Math.min(2.0, voicePitch + 0.1))}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Data Management Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity
          style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
          onPress={async () => {
            if (!activeProfile || isExporting) return;
            setIsExporting(true);
            try {
              await exportAndShareProfileData(activeProfile.id);
              Alert.alert('Success', 'Profile data exported successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to export data. Please try again.');
              console.error('Export error:', error);
            } finally {
              setIsExporting(false);
            }
          }}
          disabled={isExporting}
        >
          <Text style={styles.exportButtonText}>
            {isExporting ? 'Exporting...' : 'Export Profile Data'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.exportDescription}>
          Export all boards, buttons, routines, and settings as a JSON file for backup
        </Text>
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
          onPress={async () => {
            if (shouldUseInAppScreens() || !POLICY_URLS.privacy) {
              router.push('/caregiver/privacy');
            } else {
              const canOpen = await Linking.canOpenURL(POLICY_URLS.privacy);
              if (canOpen) {
                await Linking.openURL(POLICY_URLS.privacy);
              }
            }
          }}
        >
          <Text style={styles.linkButtonText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={async () => {
            if (shouldUseInAppScreens() || !POLICY_URLS.terms) {
              router.push('/caregiver/terms');
            } else {
              const canOpen = await Linking.canOpenURL(POLICY_URLS.terms);
              if (canOpen) {
                await Linking.openURL(POLICY_URLS.terms);
              }
            }
          }}
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
  voicePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  voiceOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[200],
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  voiceOptionSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  voiceOptionText: {
    ...typography.body.small,
    color: colors.text.primary,
  },
  voiceOptionTextSelected: {
    color: colors.text.light,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  sliderWrapper: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderTrack: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  sliderLabel: {
    ...typography.body.small,
    color: colors.text.secondary,
    minWidth: 30,
    textAlign: 'center',
  },
  sliderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderValue: {
    ...typography.heading.h3,
    minWidth: 50,
    textAlign: 'center',
    color: colors.text.primary,
  },
  exportButton: {
    backgroundColor: colors.secondary[500],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  exportButtonDisabled: {
    opacity: 0.5,
  },
  exportButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
  exportDescription: {
    ...typography.body.small,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
