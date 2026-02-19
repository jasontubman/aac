# Hosting Policy Documents Guide

This guide explains how to host your Privacy Policy and Terms of Service documents so they can be accessed via URLs.

## Why Host Policies?

- **App Store Requirements**: Both Apple and Google require accessible privacy policies and terms of service
- **Easy Updates**: Update policies without releasing a new app version
- **Better UX**: Users can access policies from any device
- **Compliance**: Easier to demonstrate compliance with regulations

## Quick Setup Options

### Option 1: GitHub Pages (Free & Easy)

1. **Create a GitHub repository:**
   ```bash
   # Create a new repo (e.g., "aac-policies")
   git init
   git add policies/
   git commit -m "Add policy documents"
   git remote add origin https://github.com/yourusername/aac-policies.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Select source branch (usually `main`)
   - Save

3. **Update `utils/policyUrls.ts`:**
   ```typescript
   const POLICY_BASE_URL = 'https://yourusername.github.io/aac-policies';
   ```

4. **Your policies will be available at:**
   - `https://yourusername.github.io/aac-policies/privacy-policy.html`
   - `https://yourusername.github.io/aac-policies/terms-of-service.html`

### Option 2: Netlify (Free & Easy)

1. **Create account** at https://netlify.com

2. **Drag and drop** the `policies/` folder to Netlify

3. **Get your URL** (e.g., `https://random-name-123.netlify.app`)

4. **Update `utils/policyUrls.ts`:**
   ```typescript
   const POLICY_BASE_URL = 'https://random-name-123.netlify.app';
   ```

### Option 3: Your Own Domain

1. **Upload** the `policies/` folder to your web server

2. **Update `utils/policyUrls.ts`:**
   ```typescript
   const POLICY_BASE_URL = 'https://yourdomain.com/policies';
   ```

## Configuration Steps

### 1. Update Policy URLs

Edit `utils/policyUrls.ts`:

```typescript
// Change this to your hosted URL
const POLICY_BASE_URL = 'https://yourusername.github.io/aac-policies';

// Set to false to use hosted URLs, true to use in-app screens
const USE_IN_APP_SCREENS = false;
```

### 2. Customize Policy Content

Before hosting, update the policy HTML files:

**`policies/privacy-policy.html`:**
- Replace `[Your support email address]` with your actual email
- Update the "Last Updated" date
- Customize any sections as needed

**`policies/terms-of-service.html`:**
- Replace `[Your support email address]` with your actual email
- Replace `[Your Jurisdiction]` with your actual jurisdiction
- Update the "Last Updated" date
- Customize subscription terms if different

### 3. Test the Links

1. Host your policies
2. Update `POLICY_BASE_URL` in `utils/policyUrls.ts`
3. Set `USE_IN_APP_SCREENS = false`
4. Run the app and test the links

## App Store Requirements

### Apple App Store

- Privacy Policy URL is **required** in App Store Connect
- Terms of Service URL is **recommended**
- URLs must be accessible without authentication
- Must be HTTPS (not HTTP)

### Google Play Store

- Privacy Policy URL is **required** in Play Console
- Terms of Service URL is **recommended**
- URLs must be accessible without authentication
- Must be HTTPS (not HTTP)

## Best Practices

1. **Keep URLs Updated**: If you change hosting, update the URLs in the app
2. **Version Control**: Keep policy versions in git for audit trail
3. **Accessibility**: Ensure policies are readable on mobile devices
4. **Regular Updates**: Review and update policies periodically
5. **Legal Review**: Have policies reviewed by a lawyer before publishing

## Fallback Behavior

The app is configured to:
- Use **in-app screens** if `USE_IN_APP_SCREENS = true` or URLs are not configured
- Use **hosted URLs** if properly configured and `USE_IN_APP_SCREENS = false`
- Show helpful error messages if URLs fail to open

## Troubleshooting

### Links Don't Open

- Check that URLs are correct and accessible in a browser
- Ensure URLs use HTTPS (required for App Store)
- Verify `Linking.canOpenURL()` returns true

### Policies Not Updating

- Clear app cache
- Ensure you're viewing the hosted version, not cached in-app version
- Check that `USE_IN_APP_SCREENS = false`

### App Store Rejection

- Ensure URLs are accessible without login
- Verify URLs are HTTPS
- Check that policies contain all required information
- Make sure "Last Updated" dates are current

## Example: Complete Setup

```typescript
// utils/policyUrls.ts
const POLICY_BASE_URL = 'https://myapp.github.io/policies';
const USE_IN_APP_SCREENS = false;

export const POLICY_URLS = {
  privacy: `${POLICY_BASE_URL}/privacy-policy.html`,
  terms: `${POLICY_BASE_URL}/terms-of-service.html`,
};
```

Then in App Store Connect / Play Console:
- Privacy Policy URL: `https://myapp.github.io/policies/privacy-policy.html`
- Terms of Service URL: `https://myapp.github.io/policies/terms-of-service.html`

## Next Steps

1. ✅ Customize policy content
2. ✅ Choose hosting option
3. ✅ Upload policies
4. ✅ Update `utils/policyUrls.ts`
5. ✅ Test links in app
6. ✅ Add URLs to App Store Connect / Play Console
7. ✅ Submit for review
