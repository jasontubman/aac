# Testing on iPhone - Quick Guide

## Step-by-Step Instructions

### 1. Install Expo Go on Your iPhone

1. Open the **App Store** on your iPhone
2. Search for **"Expo Go"**
3. Install the app (it's free)
4. Open Expo Go (you can close it for now)

### 2. Network Setup

**Option A: Same Wi-Fi Network (Faster)**
- ✅ iPhone connected to Wi-Fi
- ✅ Your Mac/computer connected to the same Wi-Fi

**Option B: Tunnel Mode (Works Anywhere)**
- Works even if devices are on different networks
- Slightly slower but more reliable
- Use: `npm start -- --tunnel`

### 3. Start the Development Server

Open Terminal on your Mac and run:

```bash
cd /Users/jason/src/aac
npm start
```

You'll see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### 4. Connect Your iPhone

**Option A: Scan QR Code (Easiest)**
1. Open the **Camera** app on your iPhone
2. Point it at the QR code in your terminal
3. Tap the notification that appears
4. Expo Go will open and load the app

**Option B: Manual Connection**
1. Open **Expo Go** app on iPhone
2. Tap **"Enter URL manually"**
3. Type the URL shown in terminal (e.g., `exp://192.168.1.100:8081`)
4. Tap **"Connect"**

### 5. Wait for App to Load

- First load may take 30-60 seconds
- You'll see "Building JavaScript bundle..."
- App will automatically reload when you make code changes

## Troubleshooting

### Issue: "Unable to connect to server"

**Solution 1: Use Tunnel Mode (Recommended)**
```bash
npm start -- --tunnel
```
This uses Expo's tunnel service (works even if devices are on different networks)

**Note:** If you see a prompt to install ngrok, you can install it:
```bash
npm install --global @expo/ngrok@^4.1.0
```
The uuid deprecation warning is harmless and can be ignored.

**Solution 2: Check Firewall**
- Make sure your Mac's firewall allows Node.js
- System Preferences → Security & Privacy → Firewall

**Solution 3: Verify Same Network**
- iPhone Settings → Wi-Fi → Check network name
- Mac System Preferences → Network → Check network name
- They must match exactly

### Issue: QR Code Not Scanning

**Solution:**
1. Make sure terminal window is large enough
2. Try increasing terminal font size
3. Or use manual URL entry in Expo Go

### Issue: "Metro bundler failed to start"

**Solution:**
```bash
# Kill any existing processes
killall node

# Clear cache and restart
npm start -- --clear
```

### Issue: App Crashes on Launch

**Solution:**
1. Check terminal for error messages
2. Try clearing Expo Go cache:
   - Shake device (or Cmd+D in simulator)
   - Tap "Reload"
   - Or close Expo Go completely and reopen

### Issue: Slow Loading

**Solution:**
- First load is always slow (downloading bundle)
- Subsequent loads are faster (cached)
- Use tunnel mode if on different networks (slower but works)

## Quick Commands

```bash
# Start dev server
npm start

# Start with tunnel (works across networks)
npm start -- --tunnel

# Start and clear cache
npm start -- --clear

# Start iOS simulator instead
npm run ios
```

## Testing Features on iPhone

Once connected, test these features:

1. **Core Board**
   - Tap buttons → Should speak
   - Build sentences → Should speak full sentence

2. **Kid Mode**
   - Long press anywhere → Opens caregiver gate
   - Solve math problem → Access settings

3. **Subscriptions**
   - Go to subscription screen
   - Test RevenueCat Paywall
   - Test restore purchases (use sandbox account)

4. **Camera/Photos**
   - Test photo capture for custom buttons
   - Test photo library access

## Tips

- **Keep Terminal Open**: Don't close the terminal while testing
- **Auto Reload**: Changes auto-reload on iPhone (shake to manually reload)
- **Debug Menu**: Shake iPhone or Cmd+D to open debug menu
- **Logs**: Check terminal for console logs and errors

## Next Steps

Once testing works:
- Test all core features
- Test subscription flow with sandbox account
- Test on different iPhone models if available
- Test with different iOS versions
