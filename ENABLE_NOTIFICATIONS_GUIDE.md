# How to Enable Notifications in Your Browser

## The Problem

Your browser has **denied notification permissions** for this website. This prevents Firebase from getting the device token (`dvToken`).

## Solution: Enable Notifications

### For Chrome/Edge:

1. **Click the lock icon** (🔒) or **info icon** (ℹ️) in the address bar (left side)
2. Find **"Notifications"** in the dropdown
3. Change it from **"Block"** to **"Allow"**
4. **Refresh the page**

**OR**

1. Go to **Settings** → **Privacy and security** → **Site settings**
2. Click **"Notifications"**
3. Find your website in the **"Not allowed"** section
4. Click on it and change to **"Allow"**
5. **Refresh the page**

### For Firefox:

1. **Click the lock icon** (🔒) in the address bar
2. Click **"More Information"**
3. Go to **"Permissions"** tab
4. Find **"Notifications"**
5. Change from **"Block"** to **"Allow"**
6. **Refresh the page**

### For Safari:

1. Go to **Safari** → **Preferences** → **Websites**
2. Click **"Notifications"** in the left sidebar
3. Find your website
4. Change from **"Deny"** to **"Allow"**
5. **Refresh the page**

---

## Quick Method (All Browsers):

1. **Clear site data:**

   - Press `F12` to open Developer Tools
   - Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
   - Click **"Clear site data"** or **"Clear storage"**
   - Check all boxes and click **"Clear"**

2. **Refresh the page**

3. When the browser asks for notification permission, click **"Allow"**

---

## After Enabling Notifications:

1. **Refresh the page**
2. Try logging in again
3. Check the console - you should see:
   - `🔥 Notification permission: granted` ✅
   - `🔥 FCM token received: ✅ Success` ✅

---

## If You Can't Enable Notifications:

The login will still work, but the `dvToken` will be empty. The backend should handle this gracefully.

---

**Note**: Some browsers require HTTPS for notifications to work. If you're on `localhost`, it should work. For production, make sure you're using HTTPS.
