# Privacy Manifest Configuration

## iOS Privacy Manifest (iOS 17+)

For iOS 17+, apps must include a Privacy Manifest file. Create `PrivacyInfo.xcprivacy`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array/>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

## API Usage Reasons

- **CA92.1**: Access user defaults only for app functionality (local settings)

## Required Privacy Labels (App Store Connect)

### Data Collection
- **None**: No data collected

### Data Linked to User
- **No**: No data linked to user identity

### Data Used for Tracking
- **No**: No tracking

### Data Used for Third-Party Advertising
- **No**: No advertising

## Google Play Data Safety Form

### Data Collection
- **No data collected**

### Data Sharing
- **No data shared**

### Security Practices
- Data encrypted in transit: N/A (no network data)
- Data encrypted at rest: Yes (SecureStore)

### Data Deletion
- Users can delete all data via app settings
- Data deletion is immediate and permanent
