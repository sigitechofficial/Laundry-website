# Firebase Google Authentication Setup Guide

This guide will walk you through setting up Google Authentication in Firebase and getting all the necessary configuration keys.

## Prerequisites

- A Google account
- Access to [Firebase Console](https://console.firebase.google.com/)
- Access to [Google Cloud Console](https://console.cloud.google.com/)

---

## Step 1: Create or Select Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"** (or select an existing project)
3. Enter your project name (e.g., "laundry-app-bf43c")
4. Follow the setup wizard:
   - Disable Google Analytics (optional) or enable it if needed
   - Click **"Create Project"**
5. Wait for the project to be created

---

## Step 2: Enable Google Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get Started"** if you haven't set up Authentication yet
3. Click on the **"Sign-in method"** tab
4. Find **"Google"** in the list of providers
5. Click on **"Google"**
6. Toggle **"Enable"** to ON
7. Enter a **Project support email** (your email address)
8. Click **"Save"**

**Note**: Firebase will automatically configure Google OAuth for you. You don't need to manually create OAuth credentials in Google Cloud Console for basic setup.

---

## Step 3: Get Firebase Configuration Keys

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to the **"Your apps"** section
4. If you don't have a web app yet:
   - Click the **web icon** (`</>`)
   - Register your app with a nickname (e.g., "Laundry Website")
   - Click **"Register app"**
5. You'll see your Firebase configuration object. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDdZLCsf0CQN_DIkE0mAOmRv9_pvlRq2qg",
  authDomain: "laundry-app-bf43c.firebaseapp.com",
  projectId: "laundry-app-bf43c",
  storageBucket: "laundry-app-bf43c.appspot.com",
  messagingSenderId: "880600214434",
  appId: "1:880600214434:web:1c36e828fbcb66ff5ee0fb",
  measurementId: "G-PXSBBGRXRF" // Optional, only if Analytics is enabled
};
```

6. **Copy these values** - you'll need them for your Firebase configuration file

---

## Step 4: Configure Authorized Domains (Important!)

1. Still in **Project settings** → **Authentication**
2. Scroll to **"Authorized domains"** section
3. Add your domains:
   - `localhost` (already added by default for development)
   - Your production domain (e.g., `yourdomain.com`)
   - Your staging domain if applicable
4. Click **"Add domain"** for each new domain

**Note**: Firebase automatically allows `localhost` for development. For production, you must add your actual domain.

---

## Step 5: Configure OAuth Consent Screen (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Select your Firebase project** from the project dropdown at the top
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Choose **"External"** user type (unless you have a Google Workspace account)
5. Click **"Create"**
6. Fill in the required information:
   - **App name**: Your app name (e.g., "Just Dry Cleaners")
   - **User support email**: Your email
   - **Developer contact information**: Your email
7. Click **"Save and Continue"**
8. On the **Scopes** page, click **"Save and Continue"** (no changes needed)
9. On the **Test users** page (if in testing mode):
   - Add test user emails if needed
   - Click **"Save and Continue"**
10. Review and click **"Back to Dashboard"**

---

## Step 6: Configure OAuth 2.0 Client ID (Google Cloud Console)

1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. You should see an **OAuth 2.0 Client ID** already created by Firebase
3. If not, click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
4. Click on the existing OAuth 2.0 Client ID to edit it
5. Under **"Authorized JavaScript origins"**, add:
   - `http://localhost:3000` (or your dev port)
   - `http://localhost:5173` (if using Vite)
   - `https://yourdomain.com` (your production domain)
6. Under **"Authorized redirect URIs"**, add:
   - `http://localhost:3000` (or your dev port)
   - `http://localhost:5173` (if using Vite)
   - `https://yourdomain.com` (your production domain)
   - Firebase automatically adds: `https://your-project-id.firebaseapp.com/__/auth/handler`
7. Click **"Save"**

---

## Step 7: Update Your Firebase Configuration File

Your Firebase configuration is already set up in `utilities/firebase.js`. Verify it matches your Firebase project:

```javascript
// utilities/firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // From Step 3
  authDomain: "YOUR_AUTH_DOMAIN",   // From Step 3
  projectId: "YOUR_PROJECT_ID",      // From Step 3
  storageBucket: "YOUR_STORAGE",     // From Step 3
  messagingSenderId: "YOUR_SENDER",  // From Step 3
  appId: "YOUR_APP_ID",              // From Step 3
  measurementId: "YOUR_MEASUREMENT"  // Optional, from Step 3
};
```

**Current Configuration** (already in your project):
- ✅ Your Firebase config is already set up in `utilities/firebase.js`
- ✅ Google provider is already configured
- ✅ The configuration values are already present

---

## Step 8: Test Google Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your sign-in page: `http://localhost:3000/sign-in` (or your dev URL)

3. Click **"Continue with Google"**

4. You should see a Google sign-in popup

5. Sign in with your Google account

6. The authentication should complete and redirect you

---

## Troubleshooting

### Issue: "Popup blocked" or "Popup closed by user"
**Solution**: 
- Check browser popup blocker settings
- Ensure you're clicking the button directly (not programmatically)

### Issue: "auth/unauthorized-domain"
**Solution**: 
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your domain (localhost is already there for development)

### Issue: "auth/configuration-not-found"
**Solution**: 
- Verify your Firebase config in `utilities/firebase.js` matches your Firebase project
- Ensure Google Authentication is enabled in Firebase Console

### Issue: "redirect_uri_mismatch"
**Solution**: 
- Go to Google Cloud Console → Credentials → OAuth 2.0 Client ID
- Add your exact redirect URI to "Authorized redirect URIs"
- Include both `http://localhost:PORT` and `https://yourdomain.com`

### Issue: OAuth consent screen shows "unverified app"
**Solution**: 
- This is normal for development/testing
- For production, you'll need to verify your app with Google
- Users can still sign in, but will see a warning screen

---

## Required Keys Summary

Here's what you need from Firebase:

| Key | Where to Find | Example |
|-----|---------------|---------|
| `apiKey` | Firebase Console → Project Settings → Your apps | `AIzaSyDdZLCsf0CQN_DIkE0mAOmRv9_pvlRq2qg` |
| `authDomain` | Firebase Console → Project Settings → Your apps | `laundry-app-bf43c.firebaseapp.com` |
| `projectId` | Firebase Console → Project Settings → General | `laundry-app-bf43c` |
| `storageBucket` | Firebase Console → Project Settings → Your apps | `laundry-app-bf43c.appspot.com` |
| `messagingSenderId` | Firebase Console → Project Settings → Your apps | `880600214434` |
| `appId` | Firebase Console → Project Settings → Your apps | `1:880600214434:web:1c36e828fbcb66ff5ee0fb` |
| `measurementId` | Firebase Console → Project Settings → Your apps (optional) | `G-PXSBBGRXRF` |

---

## Security Notes

1. **API Keys are Public**: Firebase API keys are safe to expose in client-side code. They're restricted by domain and other security rules.

2. **Never Commit Secrets**: While API keys are public, never commit:
   - Service account keys
   - Private keys
   - OAuth client secrets (if manually created)

3. **Domain Restrictions**: Always configure authorized domains in Firebase Console

4. **HTTPS in Production**: OAuth requires HTTPS in production (localhost is exception)

---

## Next Steps

✅ Google Authentication is now set up!

You can now:
- Test the "Continue with Google" button on your sign-in page
- Users can sign in with their Google accounts
- The system will automatically handle registration/login flow

For additional providers:
- See `SOCIAL_AUTH_IMPLEMENTATION_GUIDE.md` for Facebook and Apple setup

---

## Quick Reference Links

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**Last Updated**: 2024  
**Project**: Laundry Website  
**Framework**: Next.js + Firebase Authentication


