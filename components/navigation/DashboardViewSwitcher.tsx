import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';

type DashboardView = 'board' | 'routines' | 'emotion-flow';

interface ViewOption {
  id: DashboardView;
  label: string;
  icon: string;
  route: string;
}

const VIEW_OPTIONS: ViewOption[] = [
  { id: 'board', label: 'Board', icon: '📋', route: '/(tabs)' },
  { id: 'routines', label: 'Routines', icon: '⏰', route: '/(tabs)/routines' },
  { id: 'emotion-flow', label: 'Feelings', icon: '💭', route: '/(tabs)/emotion-flow' },
];

interface DashboardViewSwitcherProps {
  currentView?: DashboardView;
}

export const DashboardViewSwitcher: React.FC<DashboardViewSwitcherProps> = ({
  currentView,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Determine current view from pathname if not provided
  const activeView = currentView || (() => {
    if (pathname?.includes('/routines')) return 'routines';
    if (pathname?.includes('/emotion-flow')) return 'emotion-flow';
    return 'board';
  })();

  const handleViewChange = (view: ViewOption) => {
    router.push(view.route as any);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {VIEW_OPTIONS.map((view) => {
        const isActive = activeView === view.id;
        return (
          <TouchableOpacity
            key={view.id}
            style={[styles.viewButton, isActive && styles.viewButtonActive]}
            onPress={() => handleViewChange(view)}
            activeOpacity={0.7}
            accessibilityLabel={`Switch to ${view.label} view`}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={styles.viewIcon}>{view.icon}</Text>
            <Text style={[styles.viewLabel, isActive && styles.viewLabelActive]}>
              {view.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.light,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  viewButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[50],
    minHeight: 60,
  },
  viewButtonActive: {
    backgroundColor: colors.primary[500],
  },
  viewIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  viewLabel: {
    ...typography.label.medium,
    color: colors.text.secondary,
    fontSize: 12,
    textAlign: 'center',
  },
  viewLabelActive: {
    color: colors.text.light,
    fontWeight: '600',
  },
});
