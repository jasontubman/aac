import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BoardGrid, SentenceBar, ClearButton } from '../../components/aac';
import { EmotionSuggestion } from '../../components/emotion-flow/EmotionSuggestion';
import { useAACStore } from '../../store/aacStore';
import { useUIStore } from '../../store/uiStore';
import { useProfileStore } from '../../store/profileStore';
import { useBehaviorDetection } from '../../services/behaviorDetection';
import { initDatabase } from '../../database/init';
import { colors, spacing } from '../../theme';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentBoard, currentButtons, initialize, addToSentence, isLoading } = useAACStore();
  const { isKidMode } = useUIStore();
  const { activeProfile, initialize: initProfile, isLoading: profileLoading } = useProfileStore();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Behavior detection (check if enabled in settings)
  const behaviorEnabled = activeProfile
    ? JSON.parse(activeProfile.settings_json || '{}').advancedFeatures
        ?.behaviorDetection || false
    : false;
  const { suggestedEmotion, recordEvent } = useBehaviorDetection(behaviorEnabled);
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    // Initialize stores (wait for database first)
    const init = async () => {
      try {
        setIsInitializing(true);
        // Ensure database is initialized
        await initDatabase();
        // Then initialize stores
        await initProfile();
      } catch (error) {
        console.error('Error initializing stores:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  // Initialize AAC store when profile is loaded
  useEffect(() => {
    if (!isInitializing && activeProfile) {
      const initAAC = async () => {
        try {
          await initialize(activeProfile.id);
        } catch (error) {
          console.error('Error initializing AAC store:', error);
        }
      };
      initAAC();
    } else if (!isInitializing && !profileLoading && !activeProfile) {
      // No profile, just initialize without profile ID
      const initAAC = async () => {
        try {
          await initialize();
        } catch (error) {
          console.error('Error initializing AAC store:', error);
        }
      };
      initAAC();
    }
  }, [activeProfile, isInitializing, profileLoading]);

  useEffect(() => {
    // Show suggestion when emotion is detected
    if (suggestedEmotion && behaviorEnabled) {
      setShowSuggestion(true);
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => setShowSuggestion(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [suggestedEmotion, behaviorEnabled]);

  // Long press to enter caregiver gate
  const handleLongPress = () => {
    if (isKidMode) {
      router.push('/caregiver/gate');
    }
  };

  // Show loading state while initializing
  if (isInitializing || profileLoading || isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading your board..." fullScreen />
      </View>
    );
  }

  // Show empty state if no board
  if (!currentBoard) {
    return (
      <View style={styles.container}>
        <Pressable onLongPress={handleLongPress} style={styles.emptyContainer}>
          <EmptyState
            title="No board available"
            message="Long press anywhere to access caregiver mode and create a board"
            icon="📱"
          />
        </Pressable>
      </View>
    );
  }

  const handleButtonPress = (button: any) => {
    // Record behavior event
    if (behaviorEnabled) {
      recordEvent({
        type: 'button_tap',
        timestamp: Date.now(),
        buttonId: button.id,
      });
    }
    addToSentence(button);
  };

  const handleClear = () => {
    if (behaviorEnabled) {
      recordEvent({
        type: 'clear',
        timestamp: Date.now(),
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable onLongPress={handleLongPress} style={styles.boardContainer}>
        <BoardGrid
          board={currentBoard}
          buttons={currentButtons}
          onButtonPress={handleButtonPress}
        />
      </Pressable>
      <SentenceBar />
      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.md }]}>
        <ClearButton onPress={handleClear} />
      </View>
      
      {/* Emotion Suggestion */}
      {showSuggestion && suggestedEmotion && (
        <EmotionSuggestion
          suggestedEmotion={suggestedEmotion}
          onSelect={() => {
            setShowSuggestion(false);
            router.push('/emotion-flow');
          }}
          onDismiss={() => setShowSuggestion(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  emptyContainer: {
    flex: 1,
    width: '100%',
  },
  boardContainer: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
});
