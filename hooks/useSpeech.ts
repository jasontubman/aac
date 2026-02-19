import { useEffect, useRef } from 'react';
import { SpeechService, getDefaultSpeechService } from '../services/speech';
import { useProfileStore } from '../store/profileStore';
import type { ProfileSettings } from '../database/types';

export function useSpeech() {
  const speechServiceRef = useRef<SpeechService | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const { activeProfile } = useProfileStore();

  useEffect(() => {
    // Initialize speech service
    const initializeService = async () => {
      try {
        const service = getDefaultSpeechService();
        speechServiceRef.current = service;
        await service.initialize();
        isInitializedRef.current = true;

        // Update settings from profile
        if (activeProfile) {
          const settings: ProfileSettings = JSON.parse(activeProfile.settings_json || '{}');
          service.updateSettings({
            voiceId: settings.voiceId,
            pitch: settings.voicePitch,
            rate: settings.voiceRate,
          });
        }
      } catch (error) {
        console.error('Error initializing speech service:', error);
        isInitializedRef.current = false;
      }
    };

    initializeService();

    return () => {
      // Cleanup on unmount
      if (speechServiceRef.current) {
        speechServiceRef.current.stop();
        speechServiceRef.current.clearQueue();
      }
      isInitializedRef.current = false;
    };
  }, [activeProfile]);

  const speak = async (text: string): Promise<void> => {
    if (!text || text.trim().length === 0) {
      console.warn('Attempted to speak empty text');
      return;
    }

    // Wait for initialization if not ready
    if (!isInitializedRef.current || !speechServiceRef.current) {
      console.warn('Speech service not initialized yet, waiting...');
      // Wait up to 2 seconds for initialization
      let attempts = 0;
      while (!isInitializedRef.current && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!isInitializedRef.current || !speechServiceRef.current) {
        console.error('Speech service failed to initialize');
        return;
      }
    }

    try {
      console.log('Speaking text:', text);
      await speechServiceRef.current.speak(text);
    } catch (error) {
      console.error('Error speaking text:', error, 'Text:', text);
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
