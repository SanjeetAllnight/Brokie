# Environment Variables

Brokie requires a specific set of environment variables to connect to Firebase and enable push notifications. 

Create a `.env` file in the `frontend/` directory based on `.env.example`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"

# VAPID Key for Web Push Notifications
VITE_FIREBASE_VAPID_KEY="your-vapid-key"
```

## How to get these values:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create or select your project.
3. Add a Web App to your project to get the standard Firebase Configuration (`VITE_FIREBASE_*`).
4. To get the `VAPID_KEY`, go to **Project Settings** -> **Cloud Messaging** -> **Web configuration** and generate a new key pair.
