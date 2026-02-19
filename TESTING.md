# Testing Guide

Complete guide for testing the Easy AAC app.

## Prerequisites

1. **Node.js** (v18+ recommended)
2. **npm** or **yarn**
3. **Expo CLI** (installed globally or via npx)
4. **iOS Simulator** (macOS only) or **Android Emulator**
5. **Expo Go** app on physical device (optional)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

This will:
- Start the Metro bundler
- Open Expo DevTools in your browser
- Display a QR code for testing on physical devices

## Testing Options

### Option 1: iOS Simulator (macOS only)

```bash
npm run ios
# or
npx expo start --ios
```

**Requirements:**
- macOS with Xcode installed
- iOS Simulator available

**First time setup:**
```bash
# Install CocoaPods dependencies
cd ios && pod install && cd ..
```

### Option 2: Android Emulator

```bash
npm run android
# or
npx expo start --android
```

**Requirements:**
- Android Studio installed
- Android emulator created and running

**First time setup:**
1. Open Android Studio
2. Create a virtual device (AVD)
3. Start the emulator before running the command

### Option 3: Physical Device (Recommended for Full Testing)

1. **Install Expo Go** on your device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the dev server:**
   ```bash
   npm start
   ```

3. **Connect:**
   - **iOS**: Scan QR code with Camera app
   - **Android**: Scan QR code with Expo Go app
   - Or enter the URL manually in Expo Go

### Option 4: Web Browser (Limited - for UI testing only)

```bash
npm run web
# or
npx expo start --web
```

**Note:** Some features won't work on web (native modules, camera, etc.)

## Testing Features

### Core AAC Features

1. **Board Display**
   - ✅ Verify core vocabulary board loads
   - ✅ Check grid layout (default 4x4)
   - ✅ Verify buttons display correctly

2. **Speech Functionality**
   - ✅ Tap a button → should speak the word
   - ✅ Build a sentence → should speak full sentence
   - ✅ Test clear button

3. **Kid Mode**
   - ✅ Long press to enter caregiver mode
   - ✅ Math gate appears
   - ✅ Solve math problem to access settings

### Subscription Testing

**Important:** Use RevenueCat test API key for testing purchases.

1. **Test Subscription Flow:**
   - Navigate to subscription screen (via caregiver gate)
   - Test RevenueCat Paywall presentation
   - Test custom pricing cards
   - Test restore purchases

2. **Sandbox Testing:**
   - **iOS**: Use sandbox test account
   - **Android**: Use test account in Play Console
   - Test monthly/yearly/lifetime purchases

3. **Entitlement Checking:**
   - Verify `hasProEntitlement()` works
   - Test feature gating
   - Test fallback mode when expired

### Database Testing

1. **Profile Management:**
   - Create new profile
   - Switch between profiles
   - Verify data isolation

2. **Board Management:**
   - Create custom board
   - Add/edit buttons
   - Delete board

3. **Routines:**
   - Create routine
   - Pin buttons to routine
   - Switch between routines

### Accessibility Testing

1. **High Contrast Theme:**
   - Enable in settings
   - Verify colors change
   - Test readability

2. **Large Touch Targets:**
   - Enable in settings
   - Verify grid changes to 2x2
   - Test button sizes

3. **Reduced Motion:**
   - Enable in settings
   - Verify animations disabled

## Running Unit Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Specific Test File

```bash
npm test -- __tests__/database.test.ts
```

## Testing RevenueCat Integration

### Setup Test Environment

1. **Configure Test API Key:**
   - Test key is already configured: `test_sceaVJYxWTNqFLWkHQAZFXsYUnN`
   - Works automatically in development mode

2. **Test Scenarios:**

   ```typescript
   // Test initialization
   await initializeRevenueCat();
   
   // Test offerings
   const offerings = await getOfferings();
   console.log('Offerings:', offerings);
   
   // Test entitlement check
   const hasPro = await hasProEntitlement();
   console.log('Has Pro:', hasPro);
   
   // Test customer info
   const customerInfo = await getCustomerInfo();
   console.log('Customer Info:', customerInfo);
   ```

### Sandbox Purchase Testing

**iOS:**
1. Sign out of App Store on simulator
2. When prompted, sign in with sandbox test account
3. Complete test purchase

**Android:**
1. Add test account in Play Console
2. Sign in with test account on device/emulator
3. Complete test purchase

## Debugging

### Enable Debug Logging

Add to your code:
```typescript
// Enable RevenueCat debug logs
Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
```

### React Native Debugger

1. Install React Native Debugger
2. Open debugger
3. Enable "Debug JS Remotely" in dev menu

### Expo DevTools

Access at `http://localhost:19002` when dev server is running:
- View logs
- Reload app
- Open dev menu
- Inspect network requests

## Common Issues

### Issue: "Unable to resolve module"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### Issue: iOS build fails

**Solution:**
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

### Issue: Android build fails

**Solution:**
```bash
# Clean gradle cache
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Issue: RevenueCat not initializing

**Solution:**
- Check API key is configured
- Verify network connection
- Check RevenueCat dashboard for product setup

### Issue: Purchases not working

**Solution:**
- Verify products exist in RevenueCat dashboard
- Check product IDs match exactly (`monthly`, `yearly`, `lifetime`)
- Ensure entitlement `easy_aac_pro` is created
- Test with sandbox accounts

## Performance Testing

### Check Bundle Size

```bash
npx expo export --platform ios
# Check output/bundles/ios-*.js size
```

### Monitor Performance

1. Enable performance monitor in Expo DevTools
2. Use React DevTools Profiler
3. Check memory usage in device settings

## Manual Testing Checklist

### Core Features
- [ ] App launches successfully
- [ ] Core board displays
- [ ] Buttons are tappable
- [ ] Speech works
- [ ] Sentence builder works
- [ ] Clear button works

### Kid/Caregiver Mode
- [ ] Kid mode is default
- [ ] Long press opens caregiver gate
- [ ] Math gate works
- [ ] Settings accessible after gate

### Subscriptions
- [ ] Subscription screen loads
- [ ] RevenueCat Paywall presents
- [ ] Custom pricing cards work
- [ ] Purchase flow works (sandbox)
- [ ] Restore purchases works
- [ ] Customer Center opens
- [ ] Entitlement checking works

### Database
- [ ] Profile creation works
- [ ] Profile switching works
- [ ] Board creation works
- [ ] Button creation works
- [ ] Data persists after app restart

### Accessibility
- [ ] High contrast theme works
- [ ] Large touch targets work
- [ ] Reduced motion works

## Continuous Testing

### Pre-Commit Checks

Add to `.husky/pre-commit` (if using husky):
```bash
npm test
npm run lint
```

### CI/CD Testing

Example GitHub Actions workflow:
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

## Next Steps

1. ✅ Set up testing environment
2. ✅ Run manual tests
3. ✅ Test subscriptions in sandbox
4. ⏭️ Write unit tests for critical paths
5. ⏭️ Set up E2E tests (Detox, Maestro, etc.)
6. ⏭️ Test on multiple devices
7. ⏭️ Performance testing
8. ⏭️ Accessibility testing with screen readers
