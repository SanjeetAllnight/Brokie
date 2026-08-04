import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.brokie.app',
  appName: 'Brokie',
  webDir: 'dist',
  // Use https scheme so Firebase Auth cookies and service workers behave
  // identically to the web version.
  server: {
    androidScheme: 'https',
  },
  android: {
    // Allow the app to be backed up — user data lives in Firestore, not device
    allowMixedContent: false,
    // Capture console.log in Android logcat for debugging
    loggingBehavior: 'debug',
    // Required for Firebase push notifications
    includePlugins: [
      '@capacitor/core',
    ],
  },
  plugins: {
    // Push Notifications — native channel config
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    // Local notifications fallback
    LocalNotifications: {
      smallIcon: 'ic_stat_brokie',
      iconColor: '#4B3B7C',
    },
    // Make network requests via Capacitor HTTP bridge (avoids CORS in WebView)
    CapacitorHttp: {
      enabled: true,
    },
    // Status bar style
    StatusBar: {
      style: 'Light',
      backgroundColor: '#4B3B7C',
    },
    // Splash screen — shown while the WebView loads
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#100B1E',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
