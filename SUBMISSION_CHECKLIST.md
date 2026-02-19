# App Store Submission Checklist

## Pre-Submission Requirements

### ✅ Code Compliance

- [x] No analytics SDKs
- [x] No tracking SDKs  
- [x] No advertising SDKs
- [x] No third-party data collection
- [x] Privacy policy implemented
- [x] Terms of service implemented
- [x] Subscription terms clearly disclosed
- [x] Restore purchases implemented
- [x] Kid protection (caregiver gate)

### 📱 App Store Connect Setup

#### App Information
- [ ] App name: "Simple AAC"
- [ ] Subtitle: "Offline Communication Support"
- [ ] Category: Medical or Education
- [ ] Age rating: Complete questionnaire (likely 4+)
- [ ] Content rating: Complete questionnaire

#### Privacy
- [ ] App Privacy labels:
  - Data types collected: **None**
  - Data linked to user: **No**
  - Data used for tracking: **No**
  - Data used for third-party advertising: **No**
- [ ] Privacy policy URL (or in-app)
- [ ] Support URL

#### Subscriptions
- [ ] Create subscription products:
  - Monthly: $4.99/month
  - Annual: $34.99/year
- [ ] Set up subscription group
- [ ] Configure free trial (14 days)
- [ ] Set pricing for all regions
- [ ] Configure subscription display name

#### App Metadata
- [ ] App description (see APP_STORE_COMPLIANCE.md)
- [ ] Keywords: AAC, communication, kids, offline, accessibility
- [ ] Promotional text (optional)
- [ ] Marketing URL (optional)
- [ ] Support URL (required)

#### Screenshots
- [ ] iPhone screenshots (6.7", 6.5", 5.5")
- [ ] iPad screenshots (12.9", 11")
- [ ] Show core features:
  - Main board screen
  - Emotion flow
  - Settings
  - Subscription screen

#### App Preview (Optional)
- [ ] Video showing app in use
- [ ] Max 30 seconds
- [ ] Show key features

### 🤖 RevenueCat Setup

- [ ] Create RevenueCat account
- [ ] Add iOS API key to `services/subscription.ts`
- [ ] Add Android API key to `services/subscription.ts`
- [ ] Create products in RevenueCat:
  - `monthly_subscription`
  - `annual_subscription`
- [ ] Link to App Store Connect products
- [ ] Configure entitlements:
  - `premium_access`
- [ ] Test purchases in sandbox

### 📋 Google Play Console Setup

#### App Information
- [ ] App name: "Simple AAC"
- [ ] Short description: "Offline-first communication support for kids"
- [ ] Full description (see APP_STORE_COMPLIANCE.md)
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone and tablet)

#### Content Rating
- [ ] Complete content rating questionnaire
- [ ] Target audience: Children
- [ ] Age group: 4+

#### Data Safety Form
- [ ] Data collection: **No data collected**
- [ ] Data sharing: **No data shared**
- [ ] Security practices:
  - Data encrypted at rest: **Yes**
  - Data encrypted in transit: **N/A** (no network data)
- [ ] Data deletion: Users can delete all data

#### Subscriptions
- [ ] Create subscription products:
  - Monthly: $4.99/month
  - Annual: $34.99/year
- [ ] Configure free trial (14 days)
- [ ] Set up subscription management

#### Families Policy
- [ ] Declare as designed for children
- [ ] No ads
- [ ] No tracking
- [ ] Parent-controlled features

### 🧪 Testing

#### Functional Testing
- [ ] Test subscription purchase (sandbox)
- [ ] Test restore purchases
- [ ] Test trial period
- [ ] Test subscription expiration
- [ ] Test fallback mode
- [ ] Test offline functionality
- [ ] Test all core features
- [ ] Test on multiple devices
- [ ] Test on iOS and Android

#### Compliance Testing
- [ ] Verify no external data transmission (except RevenueCat)
- [ ] Verify subscription terms are clear
- [ ] Verify restore purchases works
- [ ] Verify privacy policy accessible
- [ ] Verify terms accessible
- [ ] Test caregiver gate
- [ ] Test kid mode (no subscription UI)

### 📄 Legal Documents

#### Privacy Policy ✅
- [x] Implemented in app
- [ ] Hosted on website (optional but recommended)
- [ ] Covers all required points
- [ ] Includes contact information

#### Terms of Service ✅
- [x] Implemented in app
- [ ] Hosted on website (optional but recommended)
- [ ] Covers subscription terms
- [ ] Includes limitation of liability

### 🔐 Security

- [ ] Verify encryption keys are secure
- [ ] Review SecureStore implementation
- [ ] Verify no sensitive data in logs
- [ ] Test data deletion functionality

### 📱 Build Configuration

- [ ] Update bundle identifier (if needed)
- [ ] Update package name (if needed)
- [ ] Configure EAS Build (if using)
- [ ] Set up code signing
- [ ] Configure app icons (all sizes)
- [ ] Configure splash screen

### 🚀 Submission

#### Apple App Store
- [ ] Create app record in App Store Connect
- [ ] Upload build via Xcode or EAS
- [ ] Complete all required information
- [ ] Submit for review
- [ ] Respond to review feedback (if any)

#### Google Play Store
- [ ] Create app in Play Console
- [ ] Upload APK/AAB
- [ ] Complete store listing
- [ ] Complete Data Safety form
- [ ] Submit for review
- [ ] Respond to review feedback (if any)

## Post-Submission

- [ ] Monitor for review status
- [ ] Respond to any review questions
- [ ] Prepare for potential rejections
- [ ] Have support contact ready
- [ ] Monitor user feedback

## Common Rejection Reasons to Avoid

1. **Missing subscription terms**: ✅ Covered
2. **No restore purchases**: ✅ Implemented
3. **Privacy policy not accessible**: ✅ In app
4. **Misleading pricing**: ✅ Clear pricing
5. **No cancellation instructions**: ✅ Included
6. **Data collection without disclosure**: ✅ No data collected
7. **Tracking without consent**: ✅ No tracking
8. **Medical claims**: ✅ Avoided (communication support only)

## Notes

- Keep all legal documents updated
- Monitor App Store guideline changes
- Test restore purchases regularly
- Keep RevenueCat SDK updated
- Maintain clear support contact
