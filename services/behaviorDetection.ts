/**
 * Behavior Detection Service
 * 
 * Detects patterns that might indicate frustration or emotional state
 * Features:
 * - Rapid button tapping (frustration indicator)
 * - Repeated same button (stuck/confused)
 * - Long pauses (thinking/overwhelmed)
 * - Clear button usage (starting over frequently)
 * 
 * Privacy: All analysis done locally, no data sent anywhere
 * Can be disabled by caregivers in settings
 */

interface BehaviorEvent {
  type: 'button_tap' | 'clear' | 'speak' | 'pause';
  timestamp: number;
  buttonId?: string;
  duration?: number;
}

class BehaviorDetector {
  private events: BehaviorEvent[] = [];
  private readonly MAX_EVENTS = 50; // Keep last 50 events
  private readonly FRUSTRATION_THRESHOLD = 5; // 5 rapid taps
  private readonly RAPID_TAP_WINDOW = 3000; // 3 seconds
  private readonly REPEATED_BUTTON_THRESHOLD = 3; // Same button 3+ times

  recordEvent(event: BehaviorEvent): void {
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }
  }

  /**
   * Detect frustration patterns
   * Returns suggested emotion or null
   */
  detectFrustration(): 'frustrated' | 'angry' | 'overwhelmed' | null {
    if (this.events.length < 3) {
      return null;
    }

    const recentEvents = this.events.slice(-10);
    const now = Date.now();

    // Pattern 1: Rapid button tapping
    const rapidTaps = recentEvents.filter(
      (e, i) =>
        e.type === 'button_tap' &&
        i > 0 &&
        e.timestamp - recentEvents[i - 1].timestamp < 500 // Less than 500ms between taps
    );

    if (rapidTaps.length >= this.FRUSTRATION_THRESHOLD) {
      return 'frustrated';
    }

    // Pattern 2: Same button repeated
    const buttonIds = recentEvents
      .filter((e) => e.type === 'button_tap' && e.buttonId)
      .map((e) => e.buttonId!);
    
    if (buttonIds.length >= this.REPEATED_BUTTON_THRESHOLD) {
      const lastButton = buttonIds[buttonIds.length - 1];
      const repeatedCount = buttonIds.filter((id) => id === lastButton).length;
      
      if (repeatedCount >= this.REPEATED_BUTTON_THRESHOLD) {
        return 'frustrated';
      }
    }

    // Pattern 3: Frequent clears (starting over)
    const clears = recentEvents.filter(
      (e) => e.type === 'clear'
    );
    
    if (clears.length >= 3) {
      return 'overwhelmed';
    }

    // Pattern 4: Very rapid taps (anger)
    const veryRapidTaps = recentEvents.filter(
      (e, i) =>
        e.type === 'button_tap' &&
        i > 0 &&
        e.timestamp - recentEvents[i - 1].timestamp < 200 // Less than 200ms
    );

    if (veryRapidTaps.length >= 3) {
      return 'angry';
    }

    return null;
  }

  /**
   * Clear event history
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Get recent behavior summary
   */
  getSummary(): {
    totalEvents: number;
    rapidTaps: number;
    clears: number;
    averageTimeBetweenTaps: number;
  } {
    const taps = this.events.filter((e) => e.type === 'button_tap');
    const clears = this.events.filter((e) => e.type === 'clear');
    
    let totalTime = 0;
    let timeCount = 0;
    for (let i = 1; i < taps.length; i++) {
      const timeDiff = taps[i].timestamp - taps[i - 1].timestamp;
      if (timeDiff < 5000) { // Only count reasonable intervals
        totalTime += timeDiff;
        timeCount++;
      }
    }

    return {
      totalEvents: this.events.length,
      rapidTaps: taps.filter(
        (e, i) =>
          i > 0 && e.timestamp - taps[i - 1].timestamp < 500
      ).length,
      clears: clears.length,
      averageTimeBetweenTaps: timeCount > 0 ? totalTime / timeCount : 0,
    };
  }
}

// Global behavior detector instance
export const behaviorDetector = new BehaviorDetector();

/**
 * Hook to use behavior detection
 */
export function useBehaviorDetection(enabled: boolean) {
  const [suggestedEmotion, setSuggestedEmotion] = React.useState<
    'frustrated' | 'angry' | 'overwhelmed' | null
  >(null);

  React.useEffect(() => {
    if (!enabled) {
      setSuggestedEmotion(null);
      return;
    }

    // Check for frustration every 2 seconds
    const interval = setInterval(() => {
      const detected = behaviorDetector.detectFrustration();
      setSuggestedEmotion(detected);
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled]);

  return {
    suggestedEmotion,
    recordEvent: (event: BehaviorEvent) => {
      if (enabled) {
        behaviorDetector.recordEvent(event);
      }
    },
    clear: () => behaviorDetector.clear(),
    getSummary: () => behaviorDetector.getSummary(),
  };
}

// Fix missing import
import React from 'react';
