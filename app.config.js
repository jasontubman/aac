// Expo app configuration
// Load environment variables from .env file if it exists
require('dotenv').config();

const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      // RevenueCat API keys from environment variables
      revenueCatApiKey: {
        ios: process.env.REVENUECAT_API_KEY_IOS || process.env.REVENUECAT_API_KEY || '',
        android: process.env.REVENUECAT_API_KEY_ANDROID || process.env.REVENUECAT_API_KEY || '',
      },
    },
  },
};
