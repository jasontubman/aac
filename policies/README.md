# Policy Documents

This directory contains the Privacy Policy and Terms of Service documents for Simple AAC.

## Files

- `privacy-policy.html` - Privacy Policy document
- `terms-of-service.html` - Terms of Service document
- `HOSTING_GUIDE.md` - Guide for hosting these documents

## Quick Start

1. **Customize the policies:**
   - Edit `privacy-policy.html` and `terms-of-service.html`
   - Replace placeholder text (email addresses, jurisdiction, etc.)
   - Update "Last Updated" dates

2. **Host the policies:**
   - See `HOSTING_GUIDE.md` for detailed instructions
   - Options: GitHub Pages, Netlify, or your own domain

3. **Update the app:**
   - Edit `utils/policyUrls.ts`
   - Set `POLICY_BASE_URL` to your hosted URL
   - Set `USE_IN_APP_SCREENS = false`

4. **Add to App Stores:**
   - Add the policy URLs to App Store Connect / Play Console

## Important Notes

- ⚠️ **Customize before hosting**: Replace all placeholder text
- ⚠️ **Legal review**: Have policies reviewed by a lawyer
- ⚠️ **HTTPS required**: App stores require HTTPS URLs
- ⚠️ **No authentication**: Policies must be publicly accessible

## App Store Requirements

Both Apple and Google require:
- ✅ Privacy Policy URL (required)
- ✅ Terms of Service URL (recommended)
- ✅ Publicly accessible (no login required)
- ✅ HTTPS (not HTTP)
