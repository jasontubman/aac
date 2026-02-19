import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useUIStore } from '../../store/uiStore';

export default function CaregiverDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lockCaregiverMode, setKidMode } = useUIStore();

  const handleExitCaregiverMode = async () => {
    await lockCaregiverMode();
    await setKidMode(true);
    router.replace('/(tabs)');
  };

  const menuItems = [
    {
      title: 'Boards',
      description: 'Create and edit communication boards',
      icon: '📋',
      route: '/caregiver/boards',
    },
    {
      title: 'Profiles',
      description: 'Manage profiles',
      icon: '👤',
      route: '/caregiver/profiles',
    },
    {
      title: 'Subscription',
      description: 'Manage your subscription',
      icon: '💳',
      route: '/caregiver/subscription',
    },
    {
      title: 'Settings',
      description: 'App settings and preferences',
      icon: '⚙️',
      route: '/caregiver/settings',
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
    >
      <View style={styles.header}>
        <Text style={styles.subtitle}>Manage boards, profiles, and settings</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.exitButton}
          onPress={handleExitCaregiverMode}
        >
          <Text style={styles.exitButtonText}>Exit Caregiver Mode</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  subtitle: {
    ...typography.body.medium,
    color: colors.text.secondary,
  },
  menu: {
    padding: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 36,
    marginRight: spacing.md,
    width: 50,
    textAlign: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  menuDescription: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  menuArrow: {
    ...typography.heading.h2,
    color: colors.primary[500],
    marginLeft: spacing.sm,
    fontSize: 24,
  },
  footer: {
    padding: spacing.xl,
  },
  exitButton: {
    backgroundColor: colors.neutral[200],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  exitButtonText: {
    ...typography.button.medium,
    color: colors.text.primary,
  },
});
