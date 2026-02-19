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

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure RevenueCat:
   - Update `services/subscription.ts` with your RevenueCat API keys
   - Set up products in RevenueCat dashboard:
     - `monthly_subscription` - $4.99/month
     - `annual_subscription` - $34.99/year

3. Run the app:
```bash
npm start
```

## Configuration

### App Store Setup

Update `app.json` with:
- Bundle identifier (iOS)
- Package name (Android)
- RevenueCat API keys
- Subscription product IDs

### Database

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

## Development Status

### Completed ✅
- Project setup and architecture
- Database schema and queries
- Theme system
- Core AAC components
- Speech service
- Kid/caregiver modes
- Subscription integration
- State management
- Storage services
- Navigation structure

### In Progress 🚧
- Profile management UI
- Board editor
- Routine system
- Emotion flow
- Photo personalization
- Accessibility features (switch scanning, dwell selection)

### Planned 📋
- Testing infrastructure
- Performance optimization
- App Store submission
- Documentation

## License

Private - All rights reserved
