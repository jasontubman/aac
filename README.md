# Simple AAC - Offline-First AAC App for Kids

A production-ready, offline-first Augmentative and Alternative Communication (AAC) app built with React Native and Expo.

## Features

### Core AAC Engine
- ✅ Core vocabulary board with motor-plan stable positioning
- ✅ Sentence builder with visual feedback
- ✅ Tap-to-speak functionality
- ✅ Multiple offline TTS voices
- ✅ Adjustable grid sizes (2x2 to 6x6)

### Kid Mode & Caregiver Gate
- ✅ Full-screen kid mode (no accidental edits)
- ✅ Math gate for caregiver access
- ✅ Long-press to enter caregiver mode

### Subscription Management
- ✅ RevenueCat integration
- ✅ Offline-first entitlement caching
- ✅ 14-day free trial
- ✅ Grace period handling (3 days)
- ✅ Fallback mode (core board only when expired)
- ✅ Restore purchases

### Multi-Profile Support
- ✅ Multiple child profiles
- ✅ Profile switching (caregiver only)
- ✅ Data isolation per profile

### Data Storage
- ✅ SQLite for structured data
- ✅ MMKV for fast key-value storage
- ✅ SecureStore for encryption keys
- ✅ Local-first architecture (fully offline)

### Accessibility
- ✅ High contrast theme
- ✅ Reduced motion support
- ✅ Large touch targets
- ✅ Switch scanning (planned)
- ✅ Dwell selection (planned)

## Tech Stack

- **Framework**: React Native + Expo (SDK 54)
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Database**: expo-sqlite
- **Fast Storage**: react-native-mmkv
- **Subscriptions**: react-native-purchases (RevenueCat)
- **TTS**: expo-speech
- **Security**: expo-secure-store

## Project Structure

```
/app
  /(tabs)          # Main app tabs
  /caregiver       # Caregiver-only screens
/components        # Reusable components
/database          # SQLite schema and queries
/hooks             # Custom React hooks
/services          # Business logic services
/store             # Zustand state stores
/theme             # Design system
/utils             # Utility functions
```

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (see `ENV_SETUP.md`):
```bash
cp .env.example .env
# Edit .env with your RevenueCat API keys
```

3. Run the app:
```bash
npm start
```

## Configuration

See `ENV_SETUP.md` for detailed setup instructions including:
- RevenueCat API key configuration
- Environment variable setup
- Production deployment

The database is automatically initialized on first launch. Core vocabulary boards are created for each profile.

## Subscription Model

- **Trial**: 14-day free trial (automatic on first launch)
- **Monthly**: $4.99/month
- **Annual**: $34.99/year (42% savings)
- **Grace Period**: 3 days offline access after expiration
- **Fallback Mode**: Core board (20-40 words) always available

## Privacy & Compliance

- ✅ No analytics SDKs
- ✅ No ads SDKs
- ✅ No third-party trackers
- ✅ Local-only data storage
- ✅ COPPA-conscious
- ✅ App Store compliant

## Testing

See `TESTING.md` for complete testing instructions including:
- Running on iOS/Android simulators
- Testing on physical devices
- Subscription testing with RevenueCat
- Unit tests
- Debugging tips

## Documentation

- `TESTING.md` - Complete testing guide
- `ENV_SETUP.md` - Environment variables and API key configuration
- `APP_STORE_COMPLIANCE.md` - App Store compliance checklist
- `SUBMISSION_CHECKLIST.md` - Pre-submission checklist
- `BEHAVIOR_DETECTION.md` - Behavior detection feature guide
- `SYMBOL_LIBRARY_GUIDE.md` - AAC symbol library integration
- `PRIVACY_MANIFEST.md` - iOS Privacy Manifest configuration
- `policies/HOSTING_GUIDE.md` - Policy document hosting guide

## License

Private - All rights reserved
