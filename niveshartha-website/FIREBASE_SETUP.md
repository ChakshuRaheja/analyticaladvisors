# Firebase Setup Guide

To properly configure Firebase authentication in this project, follow these steps:

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics if desired (optional)

## 2. Register Your Web App

1. In your Firebase project dashboard, click the web icon (</>) to add a web app
2. Give your app a nickname (e.g., "Niveshartha Web")
3. Register the app

## 3. Enable Authentication Methods

1. In the Firebase console, go to "Authentication" in the left sidebar
2. Click "Get started" or "Sign-in method" tab
3. Enable the authentication methods you want to use:
   - Email/Password
   - Google
   - Any other providers you need

## 4. Get Your Firebase Configuration

1. In the Firebase console, go to Project Settings (gear icon near the top of the left sidebar)
2. Scroll down to the "Your apps" section
3. Under the web app you registered, click the config icon (</>) to see your Firebase configuration

## 5. Update Environment Variables

1. Copy the Firebase configuration values to your `.env` file:

```
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here
```

## 6. Restart Your Development Server

After updating the environment variables, restart your development server:

```
npm run dev
```

## Troubleshooting

### API Key Not Valid Error

If you see "Firebase: Error (auth/api-key-not-valid)" when trying to authenticate:

1. Verify that you've copied the correct API key from Firebase console
2. Make sure the API key is properly set in the `.env` file
3. Ensure the environment variables are accessible in your code
4. Check that your Firebase project is properly set up and the API key hasn't been revoked

### CORS Issues

If you encounter CORS errors:

1. Ensure your domain is added to the authorized domains list in Firebase Authentication settings

### Pop-up Blocked

If the Google sign-in popup is blocked:

1. Allow popups for your site in your browser settings
2. Make sure the sign-in popup is triggered by a user action (like a button click) 