import { useEffect, useRef } from 'react';
import { SpeechService, getDefaultSpeechService } from '../services/speech';
import { useProfileStore } from '../store/profileStore';
import type { ProfileSettings } from '../database/types';

export function useSpeech() {
  const speechServiceRef = useRef<SpeechService | null>(null);
  const { activeProfile } = useProfileStore();

  useEffect(() => {
    // Initialize speech service
    const service = getDefaultSpeechService();
    speechServiceRef.current = service;
    service.initialize();

    // Update settings from profile
    if (activeProfile) {
      const settings: ProfileSettings = JSON.parse(activeProfile.settings_json || '{}');
      service.updateSettings({
        voiceId: settings.voiceId,
        pitch: settings.voicePitch,
        rate: settings.voiceRate,
      });
    }

    return () => {
      // Cleanup on unmount
      service.stop();
      service.clearQueue();
    };
  }, [activeProfile]);

  const speak = async (text: string): Promise<void> => {
    if (speechServiceRef.current) {
      await speechServiceRef.current.speak(text);
    }
  };

  const stop = (): void => {
    if (speechServiceRef.current) {
      speechServiceRef.current.stop();
    }
  };

  const clearQueue = (): void => {
    if (speechServiceRef.current) {
      speechServiceRef.current.clearQueue();
    }
  };

  return {
    speak,
    stop,
    clearQueue,
  };
}
