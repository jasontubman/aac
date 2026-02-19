# Missing Critical Features Review

Based on the implementation plan, here are the critical features that are missing or need completion:

## ✅ Implemented Features

- Core vocabulary board with motor-plan stable positioning
- Sentence builder with visual feedback
- Tap-to-speak functionality
- Kid mode + caregiver gate
- Routine management (create/edit routines)
- Emotion → Need → Speak flow
- Photo capture and personalization
- Multi-profile support
- Subscription management with RevenueCat
- Board editor with drag-and-drop
- High contrast theme
- Reduced motion support

## ❌ Missing Critical Features

### 1. Search Functionality
**Status**: Not implemented
**Plan Reference**: Lines 264-268
**Requirements**:
- Simple text search across all buttons
- Filters board in real-time
- Accessible via caregiver mode
**Priority**: Medium (useful for large boards)

### 2. Symbol Library Integration
**Status**: Partially implemented (service exists but not fully integrated)
**Plan Reference**: Lines 348-353
**Requirements**:
- Pre-loaded symbol library (ARASAAC or similar)
- Search symbols
- Assign to buttons
- Hybrid: photo + symbol overlay option
**Priority**: High (core feature for AAC apps)

### 3. Export Data (JSON Backup)
**Status**: Not implemented
**Plan Reference**: Line 299
**Requirements**:
- Export all profile data as JSON
- Include boards, buttons, routines, media assets
- Accessible from caregiver mode
**Priority**: Medium (important for data portability)

### 4. Switch Scanning
**Status**: Component exists but needs integration
**Plan Reference**: Lines 357-363
**Requirements**:
- Visual scanning indicator
- Configurable scan speed
- Auto-select on dwell
- Switch input support
**Priority**: High (critical accessibility feature)

### 5. Dwell Selection
**Status**: Component exists but needs integration
**Plan Reference**: Lines 365-370
**Requirements**:
- Configurable dwell time (0.5s - 3s)
- Visual feedback during dwell
- Cancel on movement
**Priority**: High (critical accessibility feature)

### 6. Voice Selection Per Profile
**Status**: Not implemented
**Plan Reference**: Line 273
**Requirements**:
- Multiple offline voices (system voices)
- Voice selection per profile
- Persist selection in profile settings
**Priority**: Medium (enhances personalization)

### 7. Rate/Pitch Adjustment for TTS
**Status**: Not implemented
**Plan Reference**: Line 274
**Requirements**:
- Rate adjustment (speed)
- Pitch adjustment
- Per-profile settings
- Accessible from caregiver settings
**Priority**: Medium (important for customization)

## 🔧 Implementation Notes

### Search Functionality
- Add search bar component in caregiver mode
- Filter buttons by label or speech_text
- Real-time filtering as user types
- Highlight matching text

### Symbol Library
- Complete integration of `services/symbolLibrary.ts`
- Add symbol picker UI component
- Integrate with BoardEditor
- Support symbol + photo hybrid mode

### Export Data
- Create export service in `services/export.ts`
- Generate JSON with all profile data
- Use Expo FileSystem to save/share
- Add export button in caregiver settings

### Switch Scanning & Dwell Selection
- Integrate existing components into main AAC flow
- Add settings for scan speed and dwell time
- Test with actual switch hardware
- Ensure proper subscription gating

### Voice & TTS Settings
- Extend `services/speech.ts` with rate/pitch
- Add voice selection to profile settings
- Store preferences in profile settings_json
- Update TTS calls to use profile settings

## 📋 Priority Order

1. **High Priority** (Critical for core functionality):
   - Symbol library integration
   - Switch scanning integration
   - Dwell selection integration

2. **Medium Priority** (Important for user experience):
   - Search functionality
   - Export data
   - Voice selection per profile
   - Rate/pitch adjustment

## 🎯 Next Steps

1. Complete symbol library integration
2. Integrate switch scanning and dwell selection
3. Add search functionality
4. Implement export data feature
5. Add voice and TTS customization options
