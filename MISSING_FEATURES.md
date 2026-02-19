# Missing Critical Features Review

Based on the implementation plan, here are the critical features that are missing or need completion:

## ✅ Implemented Features

- Core vocabulary board with motor-plan stable positioning
- Sentence builder with visual feedback and Speak button
- Tap-to-speak functionality
- Kid mode + caregiver gate
- Routine management (create/edit routines)
- Emotion → Need → Speak flow
- Photo capture and personalization
- Multi-profile support
- Subscription management with RevenueCat (fully integrated)
- Board editor with drag-and-drop
- High contrast theme
- Reduced motion support
- **Symbol library integration** (ARASAAC search, symbol picker, hybrid mode)
- **Search functionality** (real-time button search in caregiver mode)
- **Export data** (JSON backup with sharing)
- **Voice & TTS settings** (voice selection, rate/pitch adjustment)
- **Switch scanning** (integrated into BoardGrid)
- **Dwell selection** (integrated into buttons)
- **Fallback mode enforcement** (core board only when expired)
- **Improved subscription screen** (trial days remaining, upgrade from trial, RevenueCat paywall always used)
- **Profile management** (create, edit, delete, switch profiles with avatars)
- **Board duplication** (copy boards with all buttons)
- **Toast notifications** (better user feedback)
- **Confirmation dialogs** (for destructive actions)
- **Improved empty states** (helpful messages and actions)
- **Loading states** (consistent loading indicators)
- **Accessibility improvements** (labels, hints, roles)
- **Fixed back button navigation** (no more header shifting)

## ❌ Missing Critical Features

### 1. ~~Search Functionality~~ ✅ COMPLETED
**Status**: ✅ Implemented
**Plan Reference**: Lines 264-268
**Requirements**:
- Simple text search across all buttons
- Filters board in real-time
- Accessible via caregiver mode
**Priority**: Medium (useful for large boards)

### 2. ~~Symbol Library Integration~~ ✅ COMPLETED
**Status**: ✅ Fully implemented
- ARASAAC API integration
- Symbol picker component
- Search symbols
- Assign to buttons
- Hybrid: photo + symbol overlay option

### 3. ~~Export Data (JSON Backup)~~ ✅ COMPLETED
**Status**: ✅ Implemented
- Export service created
- JSON export with all profile data
- Share functionality
- Accessible from caregiver settings

### 4. ~~Switch Scanning~~ ✅ COMPLETED
**Status**: ✅ Integrated
- Integrated into BoardGrid
- Visual scanning indicator
- Configurable scan speed
- Subscription gated

### 5. ~~Dwell Selection~~ ✅ COMPLETED
**Status**: ✅ Integrated
- Wrapped buttons with DwellSelector
- Visual feedback during dwell
- Configurable dwell time
- Subscription gated

### 6. ~~Voice Selection Per Profile~~ ✅ COMPLETED
**Status**: ✅ Implemented
- Voice picker in settings
- Multiple system voices
- Persists in profile settings

### 7. ~~Rate/Pitch Adjustment for TTS~~ ✅ COMPLETED
**Status**: ✅ Implemented
- Rate slider (0.0-1.0)
- Pitch slider (0.5-2.0)
- Per-profile settings
- Integrated with speech service

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
