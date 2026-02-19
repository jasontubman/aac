// Expo app configuration
// This file can be used for dynamic configuration
// For now, app.json contains the static configuration

module.exports = {
  expo: {
    // Configuration is in app.json
    // This file can be used for environment-specific configs
    extra: {
      // Add environment variables here if needed
      revenueCatApiKey: process.env.REVENUECAT_API_KEY || '',
    },
  },
};
