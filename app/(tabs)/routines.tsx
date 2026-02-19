import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoutineSelector } from '../../components/routines/RoutineSelector';
import { RoutineEditor } from '../../components/routines/RoutineEditor';
import { DashboardViewSwitcher } from '../../components/navigation/DashboardViewSwitcher';
import { colors, spacing, typography } from '../../theme';
import { useProfileStore } from '../../store/profileStore';
import { getRoutinesByProfile } from '../../database/queries';
import { generateId } from '../../utils/id';
import { createRoutine } from '../../database/queries';

export default function RoutinesScreen() {
  const insets = useSafeAreaInsets();
  const { activeProfile } = useProfileStore();
  const [editingRoutineId, setEditingRoutineId] = useState<string | undefined>();
  const [showSelector, setShowSelector] = useState(true);

  const handleCreateRoutine = async () => {
    if (!activeProfile) return;
    try {
      const newRoutineId = generateId();
      await createRoutine(newRoutineId, activeProfile.id, 'New Routine', []);
      setEditingRoutineId(newRoutineId);
      setShowSelector(false);
    } catch (error) {
      console.error('Error creating routine:', error);
    }
  };

  if (editingRoutineId) {
    return (
      <View style={styles.container}>
        <RoutineEditor
          routineId={editingRoutineId}
          onSave={() => {
            setEditingRoutineId(undefined);
            setShowSelector(true);
          }}
          onCancel={() => {
            setEditingRoutineId(undefined);
            setShowSelector(true);
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {showSelector && (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateRoutine}
            >
              <Text style={styles.createButtonText}>+ Create Routine</Text>
            </TouchableOpacity>
          </View>
          <RoutineSelector
            onSelect={(routineId) => {
              if (routineId) {
                setEditingRoutineId(routineId);
                setShowSelector(false);
              }
            }}
          />
          <DashboardViewSwitcher currentView="routines" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  createButton: {
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    ...typography.button.medium,
    color: colors.text.light,
  },
});
