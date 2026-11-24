# Firebase VAPID Key Setup Guide

This guide will help you resolve the VAPID key issue and get Firebase Cloud Messaging (FCM) working.

## Problem

The `dvToken` (device token) is empty because the VAPID key might be incorrect or missing in Firebase Console.

## Solution: Get VAPID Key from Firebase Console

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **justdrycleansltd**

### Step 2: Navigate to Cloud Messaging

1. In the left sidebar, click on **⚙️ Project settings** (gear icon)
2. Go to the **Cloud Messaging** tab
3. Scroll down to **Web configuration** section

### Step 3: Generate or Copy VAPID Key

**Option A: If VAPID key already exists:**
1. Look for **Web Push certificates** section
2. Find the **Key pair** field
3. Click **Copy** next to the key
4. The key will look like: `BFohnl1Bjomlc23ckMV-X79dFQS-asckaSFyGFxPnGsTjzQeZXdgBAhiTZysp181XDGZ6vEnsNgbN7eVPoBXtYI`

**Option B: If VAPID key doesn't exist:**
1. Click **Generate key pair** button
2. A new key pair will be generated
3. Copy the key immediately (you can only see it once)
4. Save it securely

### Step 4: Update VAPID Key in Code

1. Open `utilities/requestFCMToken.js`
2. Find the line with `vapidKey:`
3. Replace the existing key with your new key:

```javascript
const currentToken = await getToken(messaging, {
  vapidKey: "YOUR_NEW_VAPID_KEY_HERE",
  serviceWorkerRegistration: registration,
});
```

### Step 5: Verify Service Worker File

Make sure `public/firebase-messaging-sw.js` exists and has the correct Firebase config.

---

## Alternative: Enable Cloud Messaging API

If Cloud Messaging is not enabled:

### Step 1: Enable Cloud Messaging API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project: **justdrycleansltd**
3. Navigate to **APIs & Services** → **Library**
4. Search for **Firebase Cloud Messaging API**
5. Click on it and click **Enable**

### Step 2: Configure Cloud Messaging

1. Go back to Firebase Console
2. Navigate to **Project settings** → **Cloud Messaging**
3. Make sure **Cloud Messaging API (Legacy)** is enabled
4. Generate VAPID key if not already done

---

## Verify Service Worker File

Check that `public/firebase-messaging-sw.js` exists and contains:

```javascript
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyApYXQsPo4aMFo3tEsOg1enAo707Bxq5pQ",
  authDomain: "justdrycleansltd.firebaseapp.com",
  projectId: "justdrycleansltd",
  storageBucket: "justdrycleansltd.firebasestorage.app",
  messagingSenderId: "475975874912",
  appId: "1:475975874912:web:de3b0055f6467d0762c605",
});

const messaging = firebase.messaging();
```

---

## Testing

After updating the VAPID key:

1. Clear browser cache and localStorage
2. Restart your development server
3. Try logging in again
4. Check browser console for:
   - `🔥 FCM token received: ✅ Success`
   - `🔥 Token value (first 30 chars): ...`

---

## Common Issues

### Issue 1: "No registration token available"
- **Solution**: Check if VAPID key matches Firebase Console
- **Solution**: Verify service worker is registered correctly

### Issue 2: "Service worker registration error"
- **Solution**: Make sure `firebase-messaging-sw.js` exists in `public/` folder
- **Solution**: Check browser console for service worker errors

### Issue 3: "Notification permission denied"
- **Solution**: User needs to allow notifications in browser settings
- **Solution**: Clear site data and try again

### Issue 4: "FCM is not supported on this browser"
- **Solution**: Use a modern browser (Chrome, Firefox, Edge)
- **Solution**: Make sure you're on HTTPS (or localhost for development)

---

## Quick Checklist

- [ ] VAPID key copied from Firebase Console
- [ ] VAPID key updated in `utilities/requestFCMToken.js`
- [ ] Cloud Messaging API enabled in Google Cloud Console
- [ ] Service worker file exists at `public/firebase-messaging-sw.js`
- [ ] Service worker has correct Firebase config
- [ ] Browser notifications permission granted
- [ ] Testing on HTTPS or localhost

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Project**: Laundry Website

