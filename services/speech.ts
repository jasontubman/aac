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

      const speechOptions: Speech.SpeechOptions = {
        language: options.language || 'en-US',
        pitch: options.pitch ?? 1.0,
        rate: options.rate ?? 0.5,
        volume: options.volume ?? 1.0,
        onStart: () => {
          this.isSpeaking = true;
          options.onStart?.();
        },
        onDone: () => {
          this.isSpeaking = false;
          options.onDone?.();
          resolve();
          this.processQueue();
        },
        onStopped: () => {
          this.isSpeaking = false;
          options.onStopped?.();
          resolve();
          this.processQueue();
        },
        onError: (error: Error) => {
          this.isSpeaking = false;
          options.onError?.(error);
          reject(error);
          this.processQueue();
        },
      };

      // Set voice if provided
      if (options.voice) {
        speechOptions.voice = options.voice;
      }

      if (this.isSpeaking) {
        // Add to queue
        this.queue.push(text);
        this.currentOptions = options;
        resolve();
      } else {
        // Speak immediately
        this.isSpeaking = true;
        Speech.speak(text, speechOptions);
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
