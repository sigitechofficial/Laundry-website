# Quick Apple Sign-In Setup Guide

## ⚠️ Current Issue
Apple Sign-In is **enabled** in Firebase but **not fully configured**. You need to add 4 pieces of information in Firebase Console.

---

## 📋 What You Need

To complete Apple Sign-In setup, you need:

1. ✅ **Apple Developer Account** ($99/year) - **Required**
2. ✅ **Service ID** (created in Apple Developer Portal)
3. ✅ **Team ID** (from your Apple Developer account)
4. ✅ **Key ID** (from a downloaded key file)
5. ✅ **Private Key** (contents of the `.p8` file)

---

## 🚀 Step-by-Step Setup

### Step 1: Get Your Apple Team ID

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Sign in with your Apple Developer account
3. Click on your **account name** (top right corner)
4. Your **Team ID** is displayed (looks like: `ABC123DEF4`)
5. **Copy and save this** - you'll need it in Step 4

---

### Step 2: Create a Service ID

1. In Apple Developer Portal, go to **Certificates, Identifiers & Profiles**
2. Click **Identifiers** in the left sidebar
3. Click the **+** button (top left)
4. Select **Services IDs** → Click **Continue**
5. Fill in:
   - **Description**: `Laundry App Web Sign In`
   - **Identifier**: `com.sigisolutions.laundryapp` (or your own unique identifier)
6. Click **Continue** → **Register**
7. Click on the newly created Service ID
8. Check the box for **Sign In with Apple**
9. Click **Configure** next to "Sign In with Apple"
10. Configure:
    - **Primary App ID**: Select your app (or create one if needed)
    - **Domains and Subdomains**: 
      - Add: `prodlaundry.sigisolutions.net` (your production domain)
      - Add: `localhost` (for development)
    - **Return URLs**: Add these URLs:
      ```
      https://prodlaundry.sigisolutions.net
      https://laundry-app-bf43c.firebaseapp.com/__/auth/handler
      ```
11. Click **Save** → **Continue** → **Save**
12. **Copy the Service ID** (e.g., `com.sigisolutions.laundryapp`) - you'll need it in Step 4

---

### Step 3: Create and Download a Key

1. In Apple Developer Portal, go to **Keys** (under "Certificates, Identifiers & Profiles")
2. Click the **+** button (top left)
3. Enter a **Key Name**: `Firebase Apple Sign In Key`
4. Check the box for **Sign In with Apple**
5. Click **Configure** next to "Sign In with Apple"
6. Select your **Primary App ID**
7. Click **Save** → **Continue** → **Register**
8. **⚠️ IMPORTANT**: 
   - **Download the key file** (`.p8` file) - **You can only download this once!**
   - **Note the Key ID** displayed (e.g., `ABC123DEF4`)
   - Save both the Key ID and the `.p8` file securely

---

### Step 4: Configure Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **laundry-app-bf43c**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Apple**
5. Toggle **"Enable"** to **ON** (if not already)
6. Fill in the required fields:

   **Services ID**: 
   - Paste the Service ID from Step 2 (e.g., `com.sigisolutions.laundryapp`)

   **Apple Team ID**: 
   - Paste the Team ID from Step 1 (e.g., `ABC123DEF4`)

   **Key ID**: 
   - Paste the Key ID from Step 3 (e.g., `ABC123DEF4`)

   **Private Key**: 
   - Open the downloaded `.p8` file in a text editor (Notepad, VS Code, etc.)
   - Copy the **entire contents** of the file (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
   - Paste it into the Private Key field

7. Click **Save**

---

## ✅ Verification

After completing Step 4:

1. Wait 1-2 minutes for Firebase to process the changes
2. Try Apple Sign-In again
3. The error should be resolved!

---

## 🆘 Troubleshooting

### Error: "Invalid Service ID"
- Double-check the Service ID matches exactly what you created in Apple Developer Portal
- Ensure the Service ID has "Sign In with Apple" enabled

### Error: "Invalid Team ID"
- Verify you copied the Team ID correctly from Apple Developer Portal
- Team ID is case-sensitive

### Error: "Invalid Key ID"
- Ensure the Key ID matches the one displayed when you created the key
- Key ID is case-sensitive

### Error: "Invalid Private Key"
- Make sure you copied the **entire** contents of the `.p8` file
- Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Don't add any extra spaces or line breaks

### Still Getting Errors?
- Clear browser cache and try again
- Wait 2-3 minutes after saving in Firebase Console
- Test on Safari browser (Apple Sign-In works best on Safari)
- Check browser console for detailed error messages

---

## 💡 Alternative: Temporarily Disable Apple Sign-In

If you don't have an Apple Developer account yet and want to continue development:

1. Go to Firebase Console → **Authentication** → **Sign-in method**
2. Click on **Apple**
3. Toggle **"Enable"** to **OFF**
4. Click **Save**

Users can still use **Google** and **Facebook** sign-in while you set up Apple later.

---

## 📝 Summary Checklist

- [ ] Apple Developer Account active ($99/year)
- [ ] Team ID copied from Apple Developer Portal
- [ ] Service ID created and configured
- [ ] Key created and downloaded (.p8 file)
- [ ] Key ID noted
- [ ] All 4 fields filled in Firebase Console:
  - [ ] Services ID
  - [ ] Apple Team ID
  - [ ] Key ID
  - [ ] Private Key
- [ ] Saved in Firebase Console
- [ ] Tested Apple Sign-In

---

**Need Help?** Check the detailed guide: `FIREBASE_APPLE_AUTH_SETUP.md`

