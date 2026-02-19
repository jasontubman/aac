# App Store Compliance Checklist

## ✅ Completed Requirements

### Apple App Store

#### Privacy & Data Collection ✅
- ✅ **Privacy Labels**: Configured in app.json
- ✅ **No Tracking**: No analytics or tracking SDKs
- ✅ **No Data Collection**: All data stored locally
- ✅ **Privacy Policy**: Implemented in app (`/caregiver/privacy`)
- ✅ **Terms of Service**: Implemented in app (`/caregiver/terms`)
- ✅ **COPPA Compliance**: Explicitly stated in privacy policy

#### Subscriptions ✅
- ✅ **Restore Purchases**: Implemented and prominently displayed
- ✅ **Subscription Terms**: Clear disclosure in subscription screen
- ✅ **Trial Disclosure**: "14-day free trial included" clearly stated
- ✅ **Auto-Renewal Disclosure**: "Subscriptions automatically renew unless cancelled..."
- ✅ **Cancellation Instructions**: "Manage in device settings"
- ✅ **Pricing**: Clearly displayed ($4.99/month, $34.99/year)
- ✅ **Links**: Privacy Policy and Terms links in subscription screen

#### Content Guidelines ✅
- ✅ **Age Appropriate**: Designed for children, requires adult supervision
- ✅ **No Medical Claims**: App is communication support tool only
- ✅ **Kid Protection**: Subscription UI only accessible via caregiver gate
- ✅ **No Dark Patterns**: No misleading pricing or forced subscriptions

#### Technical Requirements ✅
- ✅ **Bundle Identifier**: `com.aac.simple`
- ✅ **Permissions**: Camera, photo library, speech (with descriptions)
- ✅ **Encryption**: Uses non-exempt encryption (local only)
- ✅ **Privacy Manifests**: Ready for iOS 17+ requirements

### Google Play Store

#### Data Safety ✅
- ✅ **No Data Collection**: All data stored locally
- ✅ **No Sharing**: No data shared with third parties
- ✅ **No Tracking**: No tracking or analytics
- ✅ **Families Policy**: Compliant (no ads, no tracking, parent-controlled)

#### Subscriptions ✅
- ✅ **Clear Pricing**: Displayed in subscription screen
- ✅ **Trial Disclosure**: Clearly stated
- ✅ **Cancellation**: Instructions provided
- ✅ **Restore Purchases**: Implemented

## 📋 Pre-Submission Checklist

### Before Submitting to App Store

#### Apple App Store Connect
- [ ] Complete App Privacy labels:
  - [ ] Data types collected: **None**
  - [ ] Data linked to user: **No**
  - [ ] Data used for tracking: **No**
  - [ ] Data used for third-party advertising: **No**
- [ ] Subscription configuration:
  - [ ] Create products in App Store Connect
  - [ ] Set up subscription groups
  - [ ] Configure pricing tiers
  - [ ] Set up free trial
- [ ] App metadata:
  - [ ] App description (focus on communication support)
  - [ ] Keywords (AAC, communication, kids, accessibility)
  - [ ] Screenshots (show core features)
  - [ ] App preview video (optional)
  - [ ] Support URL
  - [ ] Marketing URL (optional)
- [ ] Age rating:
  - [ ] Select appropriate age rating (likely 4+)
  - [ ] Complete content questionnaire
- [ ] RevenueCat setup:
  - [ ] Configure API keys
  - [ ] Set up products in RevenueCat dashboard
  - [ ] Link to App Store Connect products

#### Google Play Console
- [ ] Complete Data Safety form:
  - [ ] Data collection: **No data collected**
  - [ ] Data sharing: **No data shared**
  - [ ] Security practices: **Data encrypted in transit and at rest**
- [ ] Subscription setup:
  - [ ] Create products in Play Console
  - [ ] Configure pricing
  - [ ] Set up free trial
- [ ] App content:
  - [ ] Target audience: **Children**
  - [ ] Content rating: Complete questionnaire
  - [ ] Store listing: Description, screenshots, etc.
- [ ] Families policy:
  - [ ] Declare as designed for children
  - [ ] No ads, no tracking
  - [ ] Parent-controlled features

### Legal Documents

#### Privacy Policy ✅
- ✅ Implemented in app
- ✅ Covers all required points:
  - Data collection (none)
  - Data storage (local only)
  - Third-party services (RevenueCat for subscriptions only)
  - User rights (data deletion)
  - COPPA compliance
  - Contact information

#### Terms of Service ✅
- ✅ Implemented in app
- ✅ Covers:
  - Service description
  - Subscription terms
  - User responsibilities
  - Limitation of liability
  - Age restrictions
  - Privacy reference

### Testing Requirements

#### Functional Testing
- [ ] Test subscription purchase flow
- [ ] Test restore purchases
- [ ] Test trial period
- [ ] Test subscription expiration
- [ ] Test fallback mode
- [ ] Test offline functionality
- [ ] Test all core features

#### Compliance Testing
- [ ] Verify no data is sent externally (except RevenueCat receipts)
- [ ] Verify subscription terms are clear
- [ ] Verify restore purchases works
- [ ] Verify privacy policy accessible
- [ ] Verify terms accessible
- [ ] Test on both iOS and Android

## 🚨 Critical Compliance Points

### Must Have Before Submission

1. **RevenueCat API Keys**: Add real API keys (currently placeholders)
2. **Symbol Attribution**: If using ARASAAC symbols, include attribution
3. **Support Contact**: Add real support email/URL
4. **App Icons**: Ensure all required icon sizes are present
5. **Screenshots**: Prepare screenshots for both stores
6. **Age Rating**: Complete age rating questionnaires

### Privacy Manifest (iOS 17+)

The app uses:
- ✅ No tracking APIs
- ✅ No user defaults (except local app settings)
- ✅ No file timestamps for tracking
- ✅ No system boot time access

Privacy manifest should declare:
```xml
<key>NSPrivacyTracking</key>
<false/>
<key>NSPrivacyTrackingDomains</key>
<array/>
```

### Data Safety Form (Google Play)

**Data Collection**: None
**Data Sharing**: None  
**Security Practices**: 
- Data encrypted in transit: N/A (no network data)
- Data encrypted at rest: Yes (SecureStore)

## 📝 Store Listing Content

### App Description (Draft)

```
Simple AAC - Offline-First Communication Support

Simple AAC is a private, affordable communication support app designed for children. Works completely offline - no internet required, no accounts needed.

Features:
• Core vocabulary boards with motor-plan stable positioning
• Text-to-speech with multiple offline voices
• Custom boards and photo personalization
• Routine management for different contexts
• Emotion flow for expressing feelings and needs
• Fully accessible with switch scanning and high contrast themes

Privacy First:
• No data collection
• No tracking
• No ads
• All data stored locally on your device

Subscription:
• 14-day free trial
• $4.99/month or $34.99/year
• Cancel anytime in device settings

Designed with accessibility in mind. Simple, calm, and child-friendly.
```

### Keywords
`AAC, communication, kids, children, speech, offline, accessibility, special needs, autism, nonverbal`

## ⚠️ Important Notes

1. **Medical Claims**: Never claim the app diagnoses or treats conditions
2. **COPPA**: Ensure all features comply with children's privacy laws
3. **Subscription**: Must be clear about auto-renewal and cancellation
4. **Support**: Provide clear support contact information
5. **Updates**: Keep privacy policy and terms updated with app changes

## 🔄 Ongoing Compliance

- Review privacy policy annually
- Update terms if subscription model changes
- Monitor App Store guideline updates
- Keep RevenueCat SDK updated
- Test restore purchases regularly
- Monitor user feedback for compliance issues
