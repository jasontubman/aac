# Behavior Detection Feature

## Overview

The behavior detection feature analyzes user interaction patterns to identify potential frustration or emotional states. This helps suggest relevant emotions in the emotion flow feature.

## Privacy & Ethics

- **100% Local**: All analysis happens on-device. No data is sent anywhere.
- **Opt-In**: Caregivers must explicitly enable this feature in settings.
- **Transparent**: Users can see what's being detected and disable at any time.
- **No Storage**: Behavior events are not permanently stored - only analyzed in real-time.

## Detection Patterns

### 1. Rapid Button Tapping
- **Pattern**: Multiple button taps within 3 seconds
- **Threshold**: 5+ rapid taps
- **Suggests**: Frustration

### 2. Repeated Same Button
- **Pattern**: Same button tapped 3+ times in a row
- **Suggests**: Stuck, confused, or frustrated

### 3. Frequent Clearing
- **Pattern**: Clear button used 3+ times in short period
- **Suggests**: Overwhelmed, starting over frequently

### 4. Very Rapid Taps
- **Pattern**: Button taps less than 200ms apart
- **Suggests**: Anger or high frustration

## Implementation

```typescript
import { useBehaviorDetection } from '../services/behaviorDetection';

// In component
const { suggestedEmotion, recordEvent } = useBehaviorDetection(enabled);

// Record button tap
recordEvent({
  type: 'button_tap',
  timestamp: Date.now(),
  buttonId: button.id,
});

// Show suggestion when emotion detected
if (suggestedEmotion) {
  // Show emotion suggestion UI
}
```

## Settings

Caregivers can enable/disable:
- **Behavior Detection**: Master toggle for all detection
- **Emotion Suggestions**: Show suggestions based on detection (requires behavior detection)

## Future Enhancements

Potential improvements (all opt-in):
- Pause detection (long pauses might indicate thinking)
- Button sequence patterns (common sequences)
- Time-of-day patterns
- Learning user's normal patterns

## Ethical Considerations

- Never force suggestions - always allow dismissal
- Don't make assumptions - suggestions are hints, not diagnoses
- Respect user autonomy - they know their feelings best
- Keep it simple - don't over-analyze
