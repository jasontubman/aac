import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useAACStore } from '../../store/aacStore';
import { useProfileStore } from '../../store/profileStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { getRoutinesByProfile } from '../../database/queries';
import type { Routine } from '../../database/types';

interface RoutineSelectorProps {
  onSelect?: (routineId: string | null) => void;
}

export const RoutineSelector: React.FC<RoutineSelectorProps> = ({
  onSelect,
}) => {
  const { activeProfile } = useProfileStore();
  const { currentRoutineId, setCurrentRoutine } = useAACStore();
  const { isFeatureAvailable } = useSubscriptionStore();
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    if (activeProfile) {
      loadRoutines();
    }
  }, [activeProfile]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Routine</Text>

      <TouchableOpacity
        style={[
          styles.routineItem,
          currentRoutineId === null && styles.routineItemActive,
        ]}
        onPress={() => handleSelectRoutine(null)}
      >
        <Text
          style={[
            styles.routineName,
            currentRoutineId === null && styles.routineNameActive,
          ]}
        >
          Default Board
        </Text>
      </TouchableOpacity>

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.routineItem,
              currentRoutineId === item.id && styles.routineItemActive,
            ]}
            onPress={() => handleSelectRoutine(item.id)}
          >
            <Text
              style={[
                styles.routineName,
                currentRoutineId === item.id && styles.routineNameActive,
              ]}
            >
              {item.name}
            </Text>
            <Text style={styles.routineInfo}>
              {JSON.parse(item.pinned_button_ids_json || '[]').length} pinned
              buttons
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
    padding: spacing.md,
  },
  title: {
    ...typography.heading.h2,
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  list: {
    paddingBottom: spacing.md,
  },
  routineItem: {
    backgroundColor: colors.neutral[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  routineItemActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  routineName: {
    ...typography.heading.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  routineNameActive: {
    color: colors.primary[700],
  },
  routineInfo: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
  errorText: {
    ...typography.body.medium,
    color: colors.error,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
