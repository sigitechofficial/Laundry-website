# Apple Sign-In Troubleshooting Guide

## Issue: `auth/operation-not-allowed` Error (Even When Enabled)

If Apple Sign-In is enabled in Firebase Console but you're still getting this error, follow these steps:

---

## Step 1: Verify Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **laundry-app-bf43c**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Apple**
5. Check if these fields are filled:
   - ✅ **Services ID** (required for production)
   - ✅ **Apple Team ID** (required for production)
   - ✅ **Key ID** (required for production)
   - ✅ **Private Key** (required for production)

**If any of these are missing**, you need to complete the full Apple Developer setup (see `FIREBASE_APPLE_AUTH_SETUP.md`).

---

## Step 2: For Development/Testing (Quick Fix)

If you're just testing and don't have Apple Developer credentials:

1. **Enable Apple** in Firebase Console (you've done this ✅)
2. **Test on Safari browser** (Apple Sign-In works best on Safari)
3. **Clear browser cache** and try again
4. **Check browser console** for detailed error messages

**Note**: For development without full Apple Developer setup, you may still get errors. Apple Sign-In typically requires full configuration for reliable operation.

---

## Step 3: Browser Compatibility

Apple Sign-In has limited browser support:

- ✅ **Safari** - Best support
- ⚠️ **Chrome** - Limited support, may not work
- ⚠️ **Firefox** - Limited support, may not work
- ⚠️ **Edge** - Limited support, may not work

**Solution**: Test on **Safari browser** first.

---

## Step 4: Check HTTPS

Apple Sign-In requires HTTPS in production:

- ✅ **localhost** - Works for development
- ✅ **HTTPS domain** - Required for production
- ❌ **HTTP domain** - Will not work

---

## Step 5: Clear Cache and Retry

1. **Clear browser cache**:
   - Chrome: `Ctrl+Shift+Delete` → Clear cached images and files
   - Safari: `Cmd+Option+E` (or Safari → Clear History)
2. **Hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. **Try again**

---

## Step 6: Check Firebase Project Settings

1. Go to Firebase Console → **Project Settings**
2. Check **General** tab
3. Verify your **Web App** configuration matches your code
4. Check if there are any **API restrictions** or **domain restrictions**

---

## Step 7: Verify Code Configuration

Check that your Firebase config in `utilities/firebase.js` matches your Firebase Console:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDdZLCsf0CQN_DIkE0mAOmRv9_pvlRq2qg",
  authDomain: "laundry-app-bf43c.firebaseapp.com",
  projectId: "laundry-app-bf43c",
  // ... rest of config
};
```

---

## Step 8: Check Browser Console

1. Open browser **Developer Tools** (`F12`)
2. Go to **Console** tab
3. Try Apple Sign-In again
4. Look for detailed error messages
5. Share the full error message for further debugging

---

## Common Solutions

### Solution 1: Complete Apple Developer Setup
If you're planning to use Apple Sign-In in production, you **must** complete the full setup:
- Create Service ID in Apple Developer Portal
- Create and download Key file (.p8)
- Configure all credentials in Firebase Console

See `FIREBASE_APPLE_AUTH_SETUP.md` for detailed steps.

### Solution 2: Use Safari Browser
Apple Sign-In works best on Safari. Try testing on Safari first.

### Solution 3: Check Firebase Console Status
Sometimes Firebase Console shows "Enabled" but the configuration is incomplete. Double-check all required fields are filled.

### Solution 4: Wait and Retry
Sometimes Firebase takes a few minutes to propagate changes. Wait 2-3 minutes after enabling and try again.

---

## Still Not Working?

If none of the above solutions work:

1. **Check the exact error code** in browser console
2. **Verify you're testing on Safari** (or a supported browser)
3. **Ensure you have an active Apple Developer account** (for production)
4. **Check Firebase Console** for any additional error messages
5. **Review the full error stack trace** in browser console

---

## Quick Checklist

- [ ] Apple Sign-In enabled in Firebase Console
- [ ] Testing on Safari browser
- [ ] Browser cache cleared
- [ ] HTTPS enabled (for production)
- [ ] Firebase config matches Console
- [ ] No browser console errors
- [ ] (For Production) Apple Developer credentials configured

---

**Last Updated**: 2026-01-02  
**Project**: Laundry Website

