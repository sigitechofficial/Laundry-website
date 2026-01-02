# Firebase Apple Authentication Setup Guide

This guide will walk you through setting up Apple Sign In in Firebase. The error `auth/operation-not-allowed` means Apple Sign In is not enabled in Firebase Console.

## Prerequisites

- An active **Apple Developer Account** ($99/year) - **Required for production**
- Access to [Firebase Console](https://console.firebase.google.com/)
- Access to [Apple Developer Portal](https://developer.apple.com/)

---

## Quick Setup (Firebase Console Only)

**For Development/Testing**, you can enable Apple Sign In in Firebase without full Apple Developer setup:

### Step 1: Enable Apple in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **laundry-app-bf43c**
3. Navigate to **Authentication** → **Sign-in method**
4. Find **Apple** in the list of providers
5. Click on **Apple**
6. Toggle **"Enable"** to **ON**
7. Click **"Save"**

**Note**: For production, you'll need to complete the full setup below with Apple Developer credentials.

---

## Full Setup (Production - Requires Apple Developer Account)

### Step 1: Get Your Apple Team ID

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Sign in with your Apple Developer account
3. Click on your account name (top right)
4. Your **Team ID** is displayed (e.g., `ABC123DEF4`)
5. **Copy and save this** - you'll need it later

### Step 2: Create a Service ID

1. In Apple Developer Portal, go to **Certificates, Identifiers & Profiles**
2. Click **Identifiers** in the left sidebar
3. Click the **+** button (top left)
4. Select **Services IDs** → Click **Continue**
5. Fill in:
   - **Description**: `Laundry App Web Sign In` (or any description)
   - **Identifier**: `com.yourcompany.laundryapp` (must be unique, reverse domain format)
6. Click **Continue** → **Register**
7. Click on the newly created Service ID
8. Check the box for **Sign In with Apple**
9. Click **Configure** next to "Sign In with Apple"
10. Configure:
    - **Primary App ID**: Select your app (or create one if needed)
    - **Domains and Subdomains**: Add your domain (e.g., `yourdomain.com`)
    - **Return URLs**: Add:
      - `https://yourdomain.com` (your website URL)
      - `https://laundry-app-bf43c.firebaseapp.com/__/auth/handler` (Firebase redirect URI)
11. Click **Save** → **Continue** → **Save**

### Step 3: Create a Key for Sign In with Apple

1. In Apple Developer Portal, go to **Keys** (under "Certificates, Identifiers & Profiles")
2. Click the **+** button (top left)
3. Enter a **Key Name**: `Firebase Apple Sign In Key`
4. Check the box for **Sign In with Apple**
5. Click **Configure** next to "Sign In with Apple"
6. Select your **Primary App ID**
7. Click **Save** → **Continue** → **Register**
8. **IMPORTANT**: Download the key file (`.p8` file) - **You can only download this once!**
9. **Note the Key ID** displayed (e.g., `ABC123DEF4`)

### Step 4: Configure Apple in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **laundry-app-bf43c**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Apple**
5. Toggle **"Enable"** to **ON**
6. Fill in the required fields:
   - **Services ID**: The identifier you created (e.g., `com.yourcompany.laundryapp`)
   - **Apple Team ID**: Your Team ID from Step 1
   - **Key ID**: The Key ID from Step 3
   - **Private Key**: Open the downloaded `.p8` file in a text editor and copy its entire contents
7. Click **Save**

### Step 5: Add Apple App Site Association File (Optional for Web)

For better integration, create this file in your `public` folder:

**File**: `public/.well-known/apple-app-site-association`

**Content** (replace with your values):
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "YOUR_TEAM_ID.com.yourcompany.laundryapp",
        "paths": ["*"]
      }
    ]
  }
}
```

**Important Notes**:
- Replace `YOUR_TEAM_ID` with your Apple Team ID
- Replace `com.yourcompany.laundryapp` with your Service ID
- This file must be served with `Content-Type: application/json`
- Must be accessible at `https://yourdomain.com/.well-known/apple-app-site-association`

---

## Testing Apple Sign In

### Development Testing

1. **Enable Apple in Firebase** (Step 1 of Quick Setup above)
2. Test on **Safari browser** (Apple Sign In works best on Safari)
3. Click "Continue with Apple" button
4. Apple Sign In popup should appear

### Important Notes for Testing

- **Apple Sign In works best on Safari** - may have limitations on Chrome/Firefox
- **Requires HTTPS** in production (localhost works for development)
- **Email may not be provided** on subsequent logins - Apple may hide email for privacy
- **Name may not be provided** - Apple allows users to hide their name

---

## Troubleshooting

### Error: `auth/operation-not-allowed`
- **Solution**: Enable Apple Sign In in Firebase Console (Step 1 of Quick Setup)

### Error: `auth/invalid-credential`
- **Solution**: Check that Service ID, Team ID, Key ID, and Private Key are correct in Firebase

### Error: `auth/popup-blocked`
- **Solution**: Allow popups in your browser settings

### Apple Sign In popup doesn't appear
- **Solution**: 
  - Test on Safari browser
  - Check browser console for errors
  - Ensure Apple is enabled in Firebase Console

### Email is not provided by Apple
- **Solution**: This is normal behavior - Apple may hide email. Your code should handle this case (already implemented in your `handleAppleLogin` function)

---

## Summary Checklist

- [ ] Apple Sign In enabled in Firebase Console
- [ ] (For Production) Apple Developer Account active
- [ ] (For Production) Service ID created and configured
- [ ] (For Production) Key created and downloaded
- [ ] (For Production) Firebase configured with Service ID, Team ID, Key ID, and Private Key
- [ ] Tested on Safari browser
- [ ] Code handles missing email/name from Apple

---

## Current Status

✅ **Code Implementation**: Complete  
✅ **Firebase Provider Setup**: Complete (in code)  
⚠️ **Firebase Console Configuration**: **Needs to be done** (this is why you're getting the error)

**Next Step**: Go to Firebase Console and enable Apple Sign In (Step 1 of Quick Setup above).

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Project**: Laundry Website

