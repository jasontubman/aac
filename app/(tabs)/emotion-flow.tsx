import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmotionSelector } from '../../components/emotion-flow/EmotionSelector';
import { NeedSelector } from '../../components/emotion-flow/NeedSelector';
import { SpeakButton } from '../../components/emotion-flow/SpeakButton';
import { DashboardViewSwitcher } from '../../components/navigation/DashboardViewSwitcher';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { colors, typography } from '../../theme';

type FlowStep = 'emotion' | 'need' | 'speak';

interface SelectedEmotion {
  id: string;
  label: string;
}

interface SelectedNeed {
  id: string;
  text: string;
}

export default function EmotionFlowScreen() {
  const insets = useSafeAreaInsets();
  const { isFeatureAvailable } = useSubscriptionStore();
  const [step, setStep] = useState<FlowStep>('emotion');
  const [selectedEmotion, setSelectedEmotion] = useState<SelectedEmotion | null>(null);
  const [selectedNeed, setSelectedNeed] = useState<SelectedNeed | null>(null);

  if (!isFeatureAvailable('emotion_flow')) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Emotion flow requires an active subscription.
        </Text>
      </View>
    );
  }

  const handleEmotionSelect = (emotion: { id: string; label: string }) => {
    setSelectedEmotion(emotion);
    setStep('need');
  };

  const handleNeedSelect = (need: { id: string; text: string }) => {
    setSelectedNeed(need);
    setStep('speak');
  };

  const handleComplete = () => {
    // Reset flow
    setStep('emotion');
    setSelectedEmotion(null);
    setSelectedNeed(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {step === 'emotion' && (
        <EmotionSelector onSelect={handleEmotionSelect} />
      )}
      {step === 'need' && selectedEmotion && (
        <NeedSelector
          emotionId={selectedEmotion.id}
          onSelect={handleNeedSelect}
          onBack={() => setStep('emotion')}
        />
      )}
      {step === 'speak' && selectedEmotion && selectedNeed && (
        <SpeakButton
          emotionLabel={selectedEmotion.label}
          needText={selectedNeed.text}
          onComplete={handleComplete}
          onBack={() => setStep('need')}
        />
      )}
      <DashboardViewSwitcher currentView="emotion-flow" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  errorText: {
    ...typography.body.medium,
    color: colors.error,
    textAlign: 'center',
    padding: 40,
  },
});
