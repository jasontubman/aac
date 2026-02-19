import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BoardGrid, SentenceBar, ClearButton } from '../../components/aac';
import { EmotionSuggestion } from '../../components/emotion-flow/EmotionSuggestion';
import { useAACStore } from '../../store/aacStore';
import { useUIStore } from '../../store/uiStore';
import { useProfileStore } from '../../store/profileStore';
import { useBehaviorDetection } from '../../services/behaviorDetection';
import { colors } from '../../theme';

export default function HomeScreen() {
  const router = useRouter();
  const { currentBoard, currentButtons, initialize, addToSentence } = useAACStore();
  const { isKidMode } = useUIStore();
  const { activeProfile, initialize: initProfile } = useProfileStore();
  
  // Behavior detection (check if enabled in settings)
  const behaviorEnabled = activeProfile
    ? JSON.parse(activeProfile.settings_json || '{}').advancedFeatures
        ?.behaviorDetection || false
    : false;
  const { suggestedEmotion, recordEvent } = useBehaviorDetection(behaviorEnabled);
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    // Initialize stores
    initProfile();
    initialize();
  }, []);

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

  if (!currentBoard) {
    return (
      <View style={styles.container}>
        <Pressable onLongPress={handleLongPress} style={styles.emptyContainer}>
          {/* Empty state - will be populated when board is loaded */}
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
    <View style={styles.container}>
      <Pressable onLongPress={handleLongPress} style={styles.boardContainer}>
        <BoardGrid
          board={currentBoard}
          buttons={currentButtons}
          onButtonPress={handleButtonPress}
        />
      </Pressable>
      <SentenceBar />
      <View style={styles.controls}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardContainer: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
});
