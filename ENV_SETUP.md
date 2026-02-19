# Environment Variables Setup Guide

This guide explains how to configure API keys and environment variables for the AAC app.

## Required API Keys

### 1. RevenueCat API Keys (Required for Subscriptions)

RevenueCat is used for managing in-app subscriptions. You'll need separate API keys for iOS and Android.

#### Getting Your RevenueCat API Keys

1. **Create a RevenueCat Account**
   - Go to https://app.revenuecat.com/
   - Sign up for a free account

2. **Create a Project**
   - Create a new project in RevenueCat dashboard
   - Name it something like "Simple AAC" or "AAC App"

3. **Get Your API Keys**
   - Navigate to **Project Settings** → **API Keys**
   - Copy your **iOS API Key** (starts with `appl_...`)
   - Copy your **Android API Key** (starts with `goog_...`)
   
   ⚠️ **Important**: These are **public API keys** (safe to include in client apps). They are different from secret API keys (server-side only).

4. **Set Up Products**
   - Go to **Products** in RevenueCat dashboard
   - Create products matching your subscription offerings:
     - Monthly subscription (e.g., `aac_monthly`)
     - Annual subscription (e.g., `aac_annual`)
   - Link these to your App Store Connect / Google Play Console products

## Setting Up Environment Variables

### Option 1: Using `.env` File (Recommended for Development)

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```bash
   # Open .env in your editor
   nano .env
   # or
   code .env
   ```

3. **Add your API keys:**
   ```env
   REVENUECAT_API_KEY_IOS=appl_your_ios_key_here
   REVENUECAT_API_KEY_ANDROID=goog_your_android_key_here
   ```

4. **Save the file**

   ⚠️ **Note**: The `.env` file is already in `.gitignore` and won't be committed to git.

### Option 2: Using System Environment Variables (Recommended for CI/CD)

Set environment variables in your system or CI/CD platform:

**macOS/Linux:**
```bash
export REVENUECAT_API_KEY_IOS=appl_your_ios_key_here
export REVENUECAT_API_KEY_ANDROID=goog_your_android_key_here
```

**Windows (PowerShell):**
```powershell
$env:REVENUECAT_API_KEY_IOS="appl_your_ios_key_here"
$env:REVENUECAT_API_KEY_ANDROID="goog_your_android_key_here"
```

**Windows (Command Prompt):**
```cmd
set REVENUECAT_API_KEY_IOS=appl_your_ios_key_here
set REVENUECAT_API_KEY_ANDROID=goog_your_android_key_here
```

### Option 3: Using a Single Key (If Same for Both Platforms)

If you're using the same API key for both platforms (not recommended for production):

```env
REVENUECAT_API_KEY=your_api_key_here
```

## How It Works

1. **Environment variables** are read by `app.config.js` during build time
2. **`app.config.js`** passes them to Expo's `extra` config
3. **App code** accesses them via `Constants.expoConfig.extra.revenueCatApiKey`
4. **`services/subscription.ts`** uses the appropriate key based on platform

## Verifying Configuration

After setting up your environment variables:

1. **Restart your development server:**
   ```bash
   npm start
   ```

2. **Check the console** - you should NOT see warnings about missing API keys

3. **Test RevenueCat initialization** - The app will attempt to initialize RevenueCat on first launch

## Troubleshooting

### "RevenueCat API key not configured" Warning

- ✅ Check that your `.env` file exists and contains the keys
- ✅ Restart your Expo development server after creating/editing `.env`
- ✅ Verify the keys are correct (no extra spaces, correct format)
- ✅ Check that `app.config.js` is reading from environment variables correctly

### API Key Format

- **iOS keys** start with `appl_` (e.g., `appl_abc123...`)
- **Android keys** start with `goog_` (e.g., `goog_xyz789...`)

### Platform-Specific Issues

- If iOS builds fail, check `REVENUECAT_API_KEY_IOS`
- If Android builds fail, check `REVENUECAT_API_KEY_ANDROID`

## Production Deployment

### EAS Build (Expo Application Services)

When building with EAS, set environment variables in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "REVENUECAT_API_KEY_IOS": "appl_your_production_key",
        "REVENUECAT_API_KEY_ANDROID": "goog_your_production_key"
      }
    }
  }
}
```

Or use EAS Secrets:
```bash
eas secret:create --scope project --name REVENUECAT_API_KEY_IOS --value appl_your_key
eas secret:create --scope project --name REVENUECAT_API_KEY_ANDROID --value goog_your_key
```

### Local Builds

For local builds, ensure environment variables are set before running:
```bash
export REVENUECAT_API_KEY_IOS=appl_your_key
export REVENUECAT_API_KEY_ANDROID=goog_your_key
npx expo run:ios
# or
npx expo run:android
```

## Other Services

### ARASAAC Symbols (No API Key Required)

The app uses ARASAAC (https://arasaac.org) for AAC symbols. This is a free, public API that doesn't require authentication.

- **License**: CC BY-NC-SA (Creative Commons Attribution-NonCommercial-ShareAlike)
- **API**: https://api.arasaac.org
- **No API key needed** - it's a public service

## Security Notes

- ✅ **Public API keys** (like RevenueCat) are safe to include in client apps
- ✅ **Never commit** `.env` files to git (already in `.gitignore`)
- ✅ **Use different keys** for development and production
- ✅ **Rotate keys** if they're ever exposed or compromised
- ❌ **Never use secret keys** in client-side code

## Next Steps

1. ✅ Set up your RevenueCat account and get API keys
2. ✅ Create `.env` file with your keys
3. ✅ Configure products in RevenueCat dashboard
4. ✅ Test subscription flow in development
5. ✅ Set up production keys before App Store submission

For more information:
- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
