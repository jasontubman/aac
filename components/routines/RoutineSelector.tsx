import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useAACStore } from '../../store/aacStore';
import { useProfileStore } from '../../store/profileStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { getRoutinesByProfile, getButtonsByBoard } from '../../database/queries';
import type { Routine, Button } from '../../database/types';
import { isValidImageUri } from '../../utils/performance';
import { EmptyState } from '../common/EmptyState';

interface RoutineSelectorProps {
  onSelect?: (routineId: string | null) => void;
}

export const RoutineSelector: React.FC<RoutineSelectorProps> = ({
  onSelect,
}) => {
  const insets = useSafeAreaInsets();
  const { activeProfile } = useProfileStore();
  const { currentRoutineId, setCurrentRoutine } = useAACStore();
  const { isFeatureAvailable } = useSubscriptionStore();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineButtons, setRoutineButtons] = useState<Record<string, Button[]>>({});

  useEffect(() => {
    if (activeProfile) {
      loadRoutines();
    }
  }, [activeProfile]);

  useEffect(() => {
    // Load button previews for each routine
    const loadButtonPreviews = async () => {
      const buttonsMap: Record<string, Button[]> = {};
      for (const routine of routines) {
        const pinnedIds = JSON.parse(routine.pinned_button_ids_json || '[]');
        if (pinnedIds.length > 0) {
          // Get buttons from all boards (simplified - in production you'd track which board)
          try {
            const allButtons: Button[] = [];
            // This is a simplified approach - ideally we'd track board_id per routine
            // For now, we'll just show the first few buttons
            buttonsMap[routine.id] = [];
          } catch (error) {
            console.error('Error loading button previews:', error);
          }
        }
      }
      setRoutineButtons(buttonsMap);
    };
    if (routines.length > 0) {
      loadButtonPreviews();
    }
  }, [routines]);

  const loadRoutines = async () => {
    if (!activeProfile) return;
    try {
      const profileRoutines = await getRoutinesByProfile(activeProfile.id);
      setRoutines(profileRoutines);
    } catch (error) {
      console.error('Error loading routines:', error);
    }
  };

  const handleSelectRoutine = async (routineId: string | null) => {
    await setCurrentRoutine(routineId);
    onSelect?.(routineId);
  };

  if (!isFeatureAvailable('routines')) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Routines require an active subscription.
        </Text>
      </View>
    );
  }

  const pinnedCount = (routine: Routine) => {
    return JSON.parse(routine.pinned_button_ids_json || '[]').length;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Routine</Text>
        <Text style={styles.subtitle}>
          Choose a routine to use, or use the default board
        </Text>
      </View>

      {/* Default Board Option */}
      <TouchableOpacity
        style={[
          styles.routineCard,
          currentRoutineId === null && styles.routineCardActive,
        ]}
        onPress={() => handleSelectRoutine(null)}
        activeOpacity={0.7}
      >
        <View style={styles.routineIconContainer}>
          <Text style={styles.routineIcon}>📋</Text>
        </View>
        <View style={styles.routineContent}>
          <Text
            style={[
              styles.routineName,
              currentRoutineId === null && styles.routineNameActive,
            ]}
          >
            Default Board
          </Text>
          <Text style={styles.routineDescription}>
            Use all buttons from your current board
          </Text>
        </View>
        {currentRoutineId === null && (
          <View style={styles.activeIndicator}>
            <Text style={styles.activeIndicatorText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Routines List */}
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const count = pinnedCount(item);
          const isActive = currentRoutineId === item.id;
          return (
            <TouchableOpacity
              style={[
                styles.routineCard,
                isActive && styles.routineCardActive,
              ]}
              onPress={() => handleSelectRoutine(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.routineIconContainer}>
                <Text style={styles.routineIcon}>⏰</Text>
              </View>
              <View style={styles.routineContent}>
                <Text
                  style={[
                    styles.routineName,
                    isActive && styles.routineNameActive,
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={styles.routineDescription}>
                  {count} {count === 1 ? 'button' : 'buttons'} pinned
                </Text>
              </View>
              {isActive && (
                <View style={styles.activeIndicator}>
                  <Text style={styles.activeIndicatorText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ListEmptyComponent={
          <EmptyState
            title="No routines yet"
            message="Create your first routine to get started"
            icon="⏰"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  title: {
    ...typography.heading.h2,
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  list: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  routineCardActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  routineIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  routineIcon: {
    fontSize: 28,
  },
  routineContent: {
    flex: 1,
  },
  routineName: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  routineNameActive: {
    color: colors.primary[700],
    fontWeight: '700',
  },
  routineDescription: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  activeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  activeIndicatorText: {
    color: colors.text.light,
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    ...typography.body.medium,
    color: colors.error,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
