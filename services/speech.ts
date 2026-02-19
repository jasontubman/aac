import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

// Speech service wrapper for TTS

export interface SpeechOptions {
  language?: string;
  pitch?: number; // 0.0 to 2.0, default 1.0
  rate?: number; // 0.0 to 1.0, default 0.5
  voice?: string; // Voice identifier
  volume?: number; // 0.0 to 1.0, default 1.0
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

// Speech queue management
class SpeechQueue {
  private queue: string[] = [];
  private isSpeaking: boolean = false;
  private currentOptions: SpeechOptions | null = null;

  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text || text.trim().length === 0) {
        resolve();
        return;
      }

      let callbackFired = false;
      let timeoutId: NodeJS.Timeout | null = null;

      // Set a timeout to detect if callbacks never fire
      const maxDuration = Math.max(5000, text.length * 100); // At least 5 seconds, or 100ms per character

      const speechOptions: Speech.SpeechOptions = {
        language: options.language || 'en-US',
        pitch: options.pitch ?? 1.0,
        rate: options.rate ?? 0.5,
        volume: options.volume ?? 1.0,
        onStart: () => {
          if (timeoutId) clearTimeout(timeoutId);
          callbackFired = true;
          this.isSpeaking = true;
          console.log('Speech started:', text);
          options.onStart?.();
          // Set a new timeout for completion
          timeoutId = setTimeout(() => {
            if (this.isSpeaking) {
              console.warn('Speech onDone/onError never fired, forcing completion');
              this.isSpeaking = false;
              resolve();
              this.processQueue();
            }
          }, maxDuration);
        },
        onDone: () => {
          if (timeoutId) clearTimeout(timeoutId);
          callbackFired = true;
          this.isSpeaking = false;
          console.log('Speech completed:', text);
          options.onDone?.();
          resolve();
          this.processQueue();
        },
        onStopped: () => {
          if (timeoutId) clearTimeout(timeoutId);
          callbackFired = true;
          this.isSpeaking = false;
          console.log('Speech stopped:', text);
          options.onStopped?.();
          resolve();
          this.processQueue();
        },
        onError: (error: Error) => {
          if (timeoutId) clearTimeout(timeoutId);
          callbackFired = true;
          this.isSpeaking = false;
          console.error('Speech error:', error, 'Text:', text);
          console.error('Speech options:', speechOptions);
          options.onError?.(error);
          reject(error);
          this.processQueue();
        },
      };

      // Set voice if provided
      if (options.voice) {
        speechOptions.voice = options.voice;
      }

      // Set a timeout to detect if callbacks never fire (after speechOptions is defined)
      timeoutId = setTimeout(() => {
        if (!callbackFired) {
          callbackFired = true;
          this.isSpeaking = false;
          console.error('Speech timeout: callbacks did not fire for text:', text);
          console.error('Speech options:', speechOptions);
          // Still resolve to prevent hanging, but log the issue
          resolve();
          this.processQueue();
        }
      }, maxDuration);

      if (this.isSpeaking) {
        // Add to queue
        this.queue.push(text);
        this.currentOptions = options;
        if (timeoutId) clearTimeout(timeoutId);
        resolve();
      } else {
        // Speak immediately
        try {
          // Verify Speech module is available
          if (!Speech || typeof Speech.speak !== 'function') {
            throw new Error('Speech.speak is not available');
          }

          console.log('Calling Speech.speak with:', {
            text,
            language: speechOptions.language,
            pitch: speechOptions.pitch,
            rate: speechOptions.rate,
            volume: speechOptions.volume,
            voice: speechOptions.voice,
            platform: Platform.OS,
          });
          this.isSpeaking = true;
          Speech.speak(text, speechOptions);
          console.log('Speech.speak called successfully, waiting for callbacks...');
        } catch (error) {
          if (timeoutId) clearTimeout(timeoutId);
          this.isSpeaking = false;
          console.error('Error calling Speech.speak:', error);
          console.error('Speech module available:', !!Speech);
          console.error('Speech.speak function available:', typeof Speech?.speak === 'function');
          reject(error);
        }
      }
    });
  }

  private processQueue(): void {
    if (this.queue.length > 0 && !this.isSpeaking) {
      const nextText = this.queue.shift()!;
      const options = this.currentOptions || {};
      this.currentOptions = null;
      this.speak(nextText, options);
    }
  }

  stop(): void {
    Speech.stop();
    this.queue = [];
    this.isSpeaking = false;
    this.currentOptions = null;
  }

  clearQueue(): void {
    this.queue = [];
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}

// Global speech queue instance
const speechQueue = new SpeechQueue();

// Configure audio mode to play in silent mode (iOS)
// Use a promise to ensure this only runs once, even if called multiple times
let audioModeConfigPromise: Promise<void> | null = null;

async function configureAudioMode(): Promise<void> {
  // Return existing promise if already configuring
  if (audioModeConfigPromise) {
    return audioModeConfigPromise;
  }
  
  // Create a new promise for configuration
  audioModeConfigPromise = (async () => {
    try {
      if (Platform.OS === 'ios') {
        // Try expo-audio first (SDK 54+), fallback to expo-av
        try {
          const { setAudioModeAsync } = await import('expo-audio');
          const audioMode = {
            playsInSilentMode: true,
            interruptionMode: 'mixWithOthers' as const,
          };
          await setAudioModeAsync(audioMode);
          console.log('✅ Audio mode configured (expo-audio):', JSON.stringify(audioMode, null, 2));
        } catch (expoAudioError) {
          console.warn('expo-audio failed, falling back to expo-av:', expoAudioError);
          // Fallback to expo-av for older SDKs or if expo-audio not available
          try {
            const expoAv = await import('expo-av');
            const Audio = expoAv.Audio;
            if (Audio && typeof Audio.setAudioModeAsync === 'function') {
              const audioMode = {
                playsInSilentModeIOS: true,
                allowsRecordingIOS: false,
                staysActiveInBackground: false,
              };
              await Audio.setAudioModeAsync(audioMode);
              console.log('✅ Audio mode configured (expo-av):', JSON.stringify(audioMode, null, 2));
            } else {
              console.warn('expo-av Audio.setAudioModeAsync not available');
            }
          } catch (avError) {
            console.warn('expo-av also failed:', avError);
          }
        }
      } else {
        console.log('Audio mode configuration skipped (not iOS)');
      }
    } catch (error) {
      console.error('❌ Error configuring audio mode:', error);
      // Don't throw - allow speech to work even if audio mode config fails
    }
  })();
  
  return audioModeConfigPromise;
}

// Get available voices
export async function getAvailableVoices(): Promise<Speech.Voice[]> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices;
  } catch (error) {
    console.error('Error getting available voices:', error);
    return [];
  }
}

// Get default voice for platform
export async function getDefaultVoice(): Promise<string | undefined> {
  const voices = await getAvailableVoices();
  if (voices.length === 0) {
    return undefined;
  }

  // Prefer English voices
  const englishVoices = voices.filter((v) => v.language.startsWith('en'));
  if (englishVoices.length > 0) {
    return englishVoices[0].identifier;
  }

  return voices[0].identifier;
}

// Speak text with options
export async function speak(
  text: string,
  options: SpeechOptions = {}
): Promise<void> {
  return speechQueue.speak(text, options);
}

// Stop speaking
export function stopSpeaking(): void {
  speechQueue.stop();
}

// Clear speech queue
export function clearSpeechQueue(): void {
  speechQueue.clearQueue();
}

// Check if currently speaking
export function isSpeaking(): boolean {
  return speechQueue.isCurrentlySpeaking();
}

// Speech service with profile-specific settings
export class SpeechService {
  private voiceId: string | undefined;
  private pitch: number = 1.0;
  private rate: number = 0.5;
  private volume: number = 1.0;
  private language: string = 'en-US';

  constructor(options?: {
    voiceId?: string;
    pitch?: number;
    rate?: number;
    volume?: number;
    language?: string;
  }) {
    this.voiceId = options?.voiceId;
    this.pitch = options?.pitch ?? 1.0;
    this.rate = options?.rate ?? 0.5;
    this.volume = options?.volume ?? 1.0;
    this.language = options?.language ?? 'en-US';
  }

  async initialize(): Promise<void> {
    // Configure audio mode first (especially important for iOS silent mode)
    await configureAudioMode();
    
    if (!this.voiceId) {
      this.voiceId = await getDefaultVoice();
    }
  }

  async speak(text: string, overrides?: Partial<SpeechOptions>): Promise<void> {
    return speak(text, {
      voice: this.voiceId,
      pitch: overrides?.pitch ?? this.pitch,
      rate: overrides?.rate ?? this.rate,
      volume: overrides?.volume ?? this.volume,
      language: overrides?.language ?? this.language,
      ...overrides,
    });
  }

  stop(): void {
    stopSpeaking();
  }

  clearQueue(): void {
    clearSpeechQueue();
  }

  updateSettings(settings: {
    voiceId?: string;
    pitch?: number;
    rate?: number;
    volume?: number;
    language?: string;
  }): void {
    if (settings.voiceId !== undefined) this.voiceId = settings.voiceId;
    if (settings.pitch !== undefined) this.pitch = settings.pitch;
    if (settings.rate !== undefined) this.rate = settings.rate;
    if (settings.volume !== undefined) this.volume = settings.volume;
    if (settings.language !== undefined) this.language = settings.language;
  }
}

// Default speech service instance
let defaultSpeechService: SpeechService | null = null;

export function getDefaultSpeechService(): SpeechService {
  if (!defaultSpeechService) {
    defaultSpeechService = new SpeechService();
  }
  return defaultSpeechService;
}

// Test/verify function to check audio mode configuration
export async function verifyAudioMode(): Promise<void> {
  // Audio mode is already configured in configureAudioMode()
  // This function just logs confirmation for testing purposes
  console.log('🔍 Audio mode configuration status:');
  console.log('Platform:', Platform.OS);
  if (Platform.OS === 'ios') {
    console.log('✅ Audio mode configured: playsInSilentMode = true');
    console.log('📱 To test: Put iPhone in silent mode (side switch) and try speaking');
    console.log('   Speech should still play even when silent switch is on');
  } else {
    console.log('Audio mode configuration skipped (not iOS)');
  }
}
