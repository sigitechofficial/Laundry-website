# Social Authentication Implementation Guide
## Google, Apple, and Facebook Authentication - Complete Implementation

This guide provides a step-by-step implementation of Google, Apple, and Facebook authentication using Firebase Authentication in a React application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Installation](#installation)
4. [Firebase Configuration](#firebase-configuration)
5. [Google Authentication](#google-authentication)
6. [Facebook Authentication](#facebook-authentication)
7. [Apple Authentication](#apple-authentication)
8. [Account Merging](#account-merging)
9. [Backend Integration](#backend-integration)
10. [Complete Code Examples](#complete-code-examples)

---

## Prerequisites

Before starting, ensure you have:

1. **Firebase Account**: Create a project at [Firebase Console](https://console.firebase.google.com/)
2. **Google Cloud Console**: For Google OAuth credentials
3. **Facebook Developer Account**: For Facebook App credentials
4. **Apple Developer Account**: For Apple Sign In (required for production)
5. **Backend API**: Your backend should have endpoints for:
   - Email checking: `POST /frontsite/emailChecker`
   - Social registration: `POST /frontsite/register`
   - OTP verification: `POST /frontsite/verifyOTP`
   - Resend OTP: `POST /frontsite/resendotp`

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "fomino-sigi")
4. Follow the setup wizard

### Step 2: Enable Authentication Providers

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Google**: Click "Enable", add support email
   - **Facebook**: Click "Enable", add App ID and App Secret
   - **Apple**: Click "Enable", configure (requires Apple Developer account)

### Step 3: Get Firebase Configuration

1. Go to **Project Settings** → **General**
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app and copy the configuration object

---

## Installation

### Step 1: Install Firebase SDK

```bash
npm install firebase
```

### Step 2: Verify Installation

Check your `package.json` to ensure Firebase is installed:

```json
{
  "dependencies": {
    "firebase": "^10.8.0"
  }
}
```

---

## Firebase Configuration

### Step 1: Create Firebase Configuration File

Create `src/firebase/Firebase.js`:

```javascript
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID", // Optional
};

const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp;
```

**Important**: Replace all placeholder values with your actual Firebase configuration values.

---

## Google Authentication

### Step 1: Configure Google OAuth in Firebase

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click on **Google**
3. Enable it and add your support email
4. Save the configuration

### Step 2: Configure Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Create OAuth 2.0 Client ID (if not exists)
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
6. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)

### Step 3: Implement Google Sign In Function

```javascript
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import firebaseApp from "../firebase/Firebase";

const signInWithGoogleFunc = async () => {
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();

  try {
    // Step 1: Sign in with Google popup
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Step 2: Check if email exists in your backend
    const emailCheckResponse = await fetch(`${BASE_URL}frontsite/emailChecker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
      }),
    });

    const emailCheckData = await emailCheckResponse.json();

    // Step 3: Handle response
    if (emailCheckData?.status === "1") {
      // User exists - register/login
      const registerResponse = await fetch(`${BASE_URL}frontsite/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: extractUsernameFromEmail(user.email),
          firstName: "",
          lastName: "",
          email: user.email,
          password: "",
          countryCode: "PK", // Your default country code
          phoneNum: "",
          referalCode: "",
          signedFrom: "google",
        }),
      });

      const registerData = await registerResponse.json();

      if (registerData?.status === "1") {
        // Save tokens and user data
        localStorage.setItem("accessToken", registerData.data.accessToken);
        localStorage.setItem("userId", registerData.data.userId);
        localStorage.setItem("userEmail", registerData.data.email);
        localStorage.setItem("userNumber", registerData.data.phoneNum);
        localStorage.setItem(
          "userName",
          `${registerData.data.firstName} ${registerData.data.lastName}`
        );

        // Navigate to home or refresh
        window.location.reload();
      }
    } else if (emailCheckData?.status === "2") {
      // User doesn't exist - show signup form with pre-filled data
      // Set signup modal state with user data
      setSignUpData({
        userName: extractUsernameFromEmail(user.email),
        firstName: separateNames(user.displayName)?.firstName || "",
        lastName: separateNames(user.displayName)?.lastName || "",
        email: user.email,
        password: "",
        countryCode: "PK",
        phoneNum: "",
        referalCode: "",
        signedFrom: "google",
      });
      // Open signup modal
    }
  } catch (error) {
    // Handle account merge if email exists with different provider
    if (error.code === "auth/account-exists-with-different-credential") {
      await handleAccountMerge(error, auth);
    } else {
      console.error("Google sign-in error:", error);
    }
  }
};

// Helper function to extract username from email
const extractUsernameFromEmail = (email) =>
  (email.match(/^[a-zA-Z0-9._%+-]+/) || [])[0];

// Helper function to separate first and last name
function separateNames(fullName) {
  if (!fullName) return { firstName: "", lastName: "" };
  const namesArray = fullName.split(" ");
  const firstName = namesArray[0];
  const lastName = namesArray.slice(1).join(" ");
  return {
    firstName: firstName,
    lastName: lastName,
  };
}
```

### Step 4: Add Google Sign In Button

```jsx
<button onClick={signInWithGoogleFunc}>
  <FcGoogle size={20} />
  Continue with Google
</button>
```

---

## Facebook Authentication

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" app type
4. Fill in app details and create app

### Step 2: Configure Facebook App

1. In Facebook App Dashboard, go to **Settings** → **Basic**
2. Add **App Domains**: `yourdomain.com`
3. Add **Privacy Policy URL**
4. Add **Website** platform
5. Add **Site URL**: `https://yourdomain.com`
6. Save changes

### Step 3: Get Facebook App Credentials

1. In Facebook App Dashboard, go to **Settings** → **Basic**
2. Copy **App ID** and **App Secret**
3. Keep these secure - never expose App Secret in frontend code

### Step 4: Configure Facebook in Firebase

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click on **Facebook**
3. Enable it
4. Paste **App ID** and **App Secret** from Facebook
5. Copy the **OAuth redirect URI** from Firebase
6. In Facebook App Dashboard → **Settings** → **Basic** → **Facebook Login** → **Settings**
7. Add the OAuth redirect URI to **Valid OAuth Redirect URIs**
8. Save in both places

### Step 5: Implement Facebook Sign In Function

```javascript
import { getAuth, signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import firebaseApp from "../firebase/Firebase";

const signInWithFacebookFunc = async () => {
  const auth = getAuth(firebaseApp);
  const provider = new FacebookAuthProvider();

  try {
    // Step 1: Sign in with Facebook popup
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Step 2: Check if email exists in your backend
    const emailCheckResponse = await fetch(`${BASE_URL}frontsite/emailChecker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
      }),
    });

    const emailCheckData = await emailCheckResponse.json();

    // Step 3: Handle response
    if (emailCheckData?.status === "1") {
      // User exists - register/login
      const registerResponse = await fetch(`${BASE_URL}frontsite/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: extractUsernameFromEmail(user.email),
          firstName: "",
          lastName: "",
          email: user.email,
          password: "",
          countryCode: "PK",
          phoneNum: "",
          referalCode: "",
          signedFrom: "facebook",
        }),
      });

      const registerData = await registerResponse.json();

      if (registerData?.status === "1") {
        // Save tokens and user data
        localStorage.setItem("accessToken", registerData.data.accessToken);
        localStorage.setItem("userId", registerData.data.userId);
        localStorage.setItem("userEmail", registerData.data.email);
        localStorage.setItem("userNumber", registerData.data.phoneNum);
        localStorage.setItem(
          "userName",
          `${registerData.data.firstName} ${registerData.data.lastName}`
        );

        // Navigate to home or refresh
        window.location.reload();
      }
    } else if (emailCheckData?.status === "2") {
      // User doesn't exist - show signup form
      setSignUpData({
        userName: extractUsernameFromEmail(user.email),
        firstName: separateNames(user.displayName)?.firstName || "",
        lastName: separateNames(user.displayName)?.lastName || "",
        email: user.email,
        password: "",
        countryCode: "PK",
        phoneNum: "",
        referalCode: "",
        signedFrom: "facebook",
      });
      // Open signup modal
    }
  } catch (error) {
    // Handle account merge if email exists with different provider
    if (error.code === "auth/account-exists-with-different-credential") {
      await handleAccountMerge(error, auth);
    } else {
      console.error("Facebook sign-in error:", error);
    }
  }
};
```

### Step 6: Add Facebook Sign In Button

```jsx
<button onClick={signInWithFacebookFunc}>
  <FaFacebook size={20} color="#1877F2" />
  Continue with Facebook
</button>
```

---

## Apple Authentication

### Step 1: Apple Developer Account Setup

1. You need an active Apple Developer account ($99/year)
2. Go to [Apple Developer Portal](https://developer.apple.com/)

### Step 2: Create Service ID

1. In Apple Developer Portal, go to **Certificates, Identifiers & Profiles**
2. Click **Identifiers** → **+** button
3. Select **Services IDs** → **Continue**
4. Enter description and identifier (e.g., `com.yourcompany.yourapp`)
5. Enable **Sign In with Apple**
6. Configure domains and redirect URLs:
   - **Domains**: `yourdomain.com`
   - **Return URLs**: `https://yourdomain.com` (and Firebase redirect URI)
7. Save and continue

### Step 3: Create Key for Sign In with Apple

1. In Apple Developer Portal, go to **Keys**
2. Click **+** button
3. Enter key name
4. Enable **Sign In with Apple**
5. Configure for your App ID
6. Continue and register
7. **Download the key file** (`.p8`) - you can only download once!
8. Note the **Key ID**

### Step 4: Configure Apple in Firebase

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click on **Apple**
3. Enable it
4. Enter:
   - **Services ID**: The identifier you created
   - **Apple Team ID**: Found in Apple Developer account
   - **Key ID**: From the key you created
   - **Private Key**: Content of the `.p8` file
5. Save configuration

### Step 5: Add Apple App Site Association File

Create `public/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "YOUR_TEAM_ID.com.yourcompany.yourapp",
        "paths": ["*"]
      }
    ]
  }
}
```

**Important**: 
- Replace `YOUR_TEAM_ID` with your Apple Team ID
- Replace `com.yourcompany.yourapp` with your app bundle ID
- This file must be served with `Content-Type: application/json`
- Must be accessible at `https://yourdomain.com/.well-known/apple-app-site-association`

### Step 6: Implement Apple Sign In Function

```javascript
import { getAuth, signInWithPopup, OAuthProvider } from "firebase/auth";
import firebaseApp from "../firebase/Firebase";

const signInWithAppleFunc = async () => {
  const auth = getAuth(firebaseApp);
  const provider = new OAuthProvider("apple.com");

  try {
    // Step 1: Sign in with Apple popup
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Note: Apple may not provide email on subsequent logins
    // You need to handle this case

    // Step 2: Check if email exists in your backend
    const emailCheckResponse = await fetch(`${BASE_URL}frontsite/emailChecker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
      }),
    });

    const emailCheckData = await emailCheckResponse.json();

    // Step 3: Handle response
    if (emailCheckData?.status === "1") {
      // User exists - register/login
      const registerResponse = await fetch(`${BASE_URL}frontsite/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: "",
          firstName: "",
          lastName: "",
          email: user.email,
          password: "",
          countryCode: "PK",
          phoneNum: "",
          referalCode: "",
          signedFrom: "apple",
        }),
      });

      const registerData = await registerResponse.json();

      if (registerData?.status === "1") {
        // Save tokens and user data
        localStorage.setItem("accessToken", registerData.data.accessToken);
        localStorage.setItem("userId", registerData.data.userId);
        localStorage.setItem("userEmail", registerData.data.email);
        localStorage.setItem("userNumber", registerData.data.phoneNum);
        localStorage.setItem(
          "userName",
          `${registerData.data.firstName} ${registerData.data.lastName}`
        );

        // Navigate to home or refresh
        window.location.reload();
      }
    } else if (emailCheckData?.status === "2") {
      // User doesn't exist - show signup form
      setSignUpData({
        userName: "",
        firstName: "",
        lastName: "",
        email: user.email || "",
        password: "",
        countryCode: "PK",
        phoneNum: "",
        referalCode: "",
        signedFrom: "apple",
      });
      // Open signup modal
    }
  } catch (error) {
    // Handle account merge if email exists with different provider
    if (error.code === "auth/account-exists-with-different-credential") {
      await handleAccountMerge(error, auth);
    } else {
      console.error("Apple sign-in error:", error);
    }
  }
};
```

### Step 7: Add Apple Sign In Button

```jsx
<button onClick={signInWithAppleFunc}>
  <BsApple size={20} />
  Continue with Apple
</button>
```

**Note**: Apple requires specific button styling. Refer to [Apple's Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple).

---

## Account Merging

When a user tries to sign in with a provider but their email is already associated with a different provider, you need to merge accounts.

### Step 1: Implement Account Merge Handler

```javascript
import {
  getAuth,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import firebaseApp from "../firebase/Firebase";

const handleAccountMerge = async (error, auth) => {
  if (error.code === "auth/account-exists-with-different-credential") {
    // Get the pending credential
    const pendingCred = OAuthProvider.credentialFromError(error);
    const email = error.customData.email;

    try {
      // Find which provider the email is already associated with
      const existingMethods = await fetchSignInMethodsForEmail(auth, email);
      let existingProvider = "";

      if (existingMethods.includes("google.com")) {
        existingProvider = "Google";
      } else if (existingMethods.includes("facebook.com")) {
        existingProvider = "Facebook";
      } else if (existingMethods.includes("apple.com")) {
        existingProvider = "Apple";
      } else {
        existingProvider = existingMethods[0];
      }

      // Show OTP verification modal to user
      // Store pending credential and provider info
      setPendingCred(pendingCred);
      setEmail(email);
      setExistingProvider(existingProvider);
      setShowMergeModal(true);
    } catch (mergeError) {
      console.error("Account merge error:", mergeError);
    }
  }
};
```

### Step 2: Implement Merge Accounts Function

```javascript
const mergeAccounts = async (otp) => {
  try {
    // Step 1: Verify OTP with backend
    const otpResponse = await fetch(`${BASE_URL}frontsite/verifyOTP`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        OTP: otp,
      }),
    });

    const otpData = await otpResponse.json();

    if (otpData?.status === "1") {
      // Step 2: Sign in with existing provider
      let existingProviderInstance;
      if (existingProvider === "Google") {
        existingProviderInstance = new GoogleAuthProvider();
      } else if (existingProvider === "Facebook") {
        existingProviderInstance = new FacebookAuthProvider();
      } else if (existingProvider === "Apple") {
        existingProviderInstance = new OAuthProvider("apple.com");
      }

      const existingResult = await signInWithPopup(auth, existingProviderInstance);
      const existingUser = existingResult.user;

      // Step 3: Link the new credential to existing account
      await linkWithCredential(existingUser, pendingCred);

      // Step 4: Save user data
      localStorage.setItem("accessToken", existingUser.accessToken);
      localStorage.setItem("userId", otpData.data.userId);
      localStorage.setItem("userEmail", existingUser.email);
      localStorage.setItem("userNumber", otpData.data.phoneNum);
      localStorage.setItem("userName", existingUser.displayName || "");

      // Success
      success_toaster("Accounts merged successfully.");
      window.location.reload();
    } else {
      error_toaster("Incorrect OTP");
    }
  } catch (mergeError) {
    error_toaster("Error during account merging");
    console.error("Merge error:", mergeError);
  }
};
```

### Step 3: Resend OTP for Account Merge

```javascript
const resendMergeOTP = async () => {
  try {
    const response = await fetch(`${BASE_URL}frontsite/resendotp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    const data = await response.json();
    if (data?.status === "1") {
      success_toaster("OTP sent successfully");
    }
  } catch (error) {
    error_toaster("Failed to resend OTP");
  }
};
```

---

## Backend Integration

### Required Backend Endpoints

Your backend must implement these endpoints:

#### 1. Email Checker
**Endpoint**: `POST /frontsite/emailChecker`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "status": "1", // "1" = user exists, "2" = new user
  "message": "User found",
  "data": {
    "userId": "123",
    "email": "user@example.com"
  }
}
```

#### 2. Social Registration
**Endpoint**: `POST /frontsite/register`

**Request Body**:
```json
{
  "userName": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "", // Empty for social auth
  "countryCode": "PK",
  "phoneNum": "",
  "referalCode": "",
  "signedFrom": "google" // "google", "facebook", or "apple"
}
```

**Response**:
```json
{
  "status": "1", // "1" = success, "2" = user exists, "3" = created
  "message": "Registration successful",
  "data": {
    "accessToken": "jwt_token_here",
    "userId": "123",
    "email": "user@example.com",
    "phoneNum": "",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### 3. OTP Verification (for account merging)
**Endpoint**: `POST /frontsite/verifyOTP`

**Request Body**:
```json
{
  "email": "user@example.com",
  "OTP": "123456"
}
```

**Response**:
```json
{
  "status": "1", // "1" = valid, "0" = invalid
  "message": "OTP verified",
  "data": {
    "userId": "123",
    "phoneNum": ""
  }
}
```

#### 4. Resend OTP
**Endpoint**: `POST /frontsite/resendotp`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "status": "1",
  "message": "OTP sent successfully"
}
```

---

## Complete Code Examples

### Complete Component Example

```javascript
import React, { useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, fetchSignInMethodsForEmail, linkWithCredential } from "firebase/auth";
import firebaseApp from "../firebase/Firebase";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { BsApple } from "react-icons/bs";

const SocialAuthComponent = () => {
  const [loader, setLoader] = useState(false);
  const [email, setEmail] = useState("");
  const [existingProvider, setExistingProvider] = useState("");
  const [pendingCred, setPendingCred] = useState(null);
  const [mergeOtp, setMergeOtp] = useState("");
  const [showMergeModal, setShowMergeModal] = useState(false);

  const auth = getAuth(firebaseApp);
  const BASE_URL = "https://your-api-url.com/";

  // Helper functions
  const extractUsernameFromEmail = (email) =>
    (email.match(/^[a-zA-Z0-9._%+-]+/) || [])[0];

  function separateNames(fullName) {
    if (!fullName) return { firstName: "", lastName: "" };
    const namesArray = fullName.split(" ");
    const firstName = namesArray[0];
    const lastName = namesArray.slice(1).join(" ");
    return { firstName, lastName };
  }

  // Account merge handler
  const handleAccountMerge = async (error, auth) => {
    if (error.code === "auth/account-exists-with-different-credential") {
      const pendingCred = OAuthProvider.credentialFromError(error);
      const email = error.customData.email;

      try {
        const existingMethods = await fetchSignInMethodsForEmail(auth, email);
        let existingProvider = "";

        if (existingMethods.includes("google.com")) {
          existingProvider = "Google";
        } else if (existingMethods.includes("facebook.com")) {
          existingProvider = "Facebook";
        } else if (existingMethods.includes("apple.com")) {
          existingProvider = "Apple";
        } else {
          existingProvider = existingMethods[0];
        }

        setPendingCred(pendingCred);
        setEmail(email);
        setExistingProvider(existingProvider);
        setShowMergeModal(true);
      } catch (mergeError) {
        console.error("Merge error:", mergeError);
      }
    }
  };

  // Google Sign In
  const signInWithGoogleFunc = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setLoader(true);

      const res = await fetch(`${BASE_URL}frontsite/emailChecker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const emailCheckData = await res.json();

      if (emailCheckData?.status === "1") {
        const resp = await fetch(`${BASE_URL}frontsite/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: extractUsernameFromEmail(user.email),
            firstName: "",
            lastName: "",
            email: user.email,
            password: "",
            countryCode: "PK",
            phoneNum: "",
            referalCode: "",
            signedFrom: "google",
          }),
        });

        const registerData = await resp.json();

        if (registerData?.status === "1") {
          localStorage.setItem("accessToken", registerData.data.accessToken);
          localStorage.setItem("userId", registerData.data.userId);
          localStorage.setItem("userEmail", registerData.data.email);
          localStorage.setItem("userNumber", registerData.data.phoneNum);
          localStorage.setItem(
            "userName",
            `${registerData.data.firstName} ${registerData.data.lastName}`
          );
          window.location.reload();
        }
      }
      setLoader(false);
    } catch (error) {
      await handleAccountMerge(error, auth);
      setLoader(false);
    }
  };

  // Facebook Sign In
  const signInWithFacebookFunc = async () => {
    const provider = new FacebookAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setLoader(true);

      const res = await fetch(`${BASE_URL}frontsite/emailChecker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const emailCheckData = await res.json();

      if (emailCheckData?.status === "1") {
        const resp = await fetch(`${BASE_URL}frontsite/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: "",
            firstName: "",
            lastName: "",
            email: user.email,
            password: "",
            countryCode: "PK",
            phoneNum: "",
            referalCode: "",
            signedFrom: "facebook",
          }),
        });

        const registerData = await resp.json();

        if (registerData?.status === "1") {
          localStorage.setItem("accessToken", registerData.data.accessToken);
          localStorage.setItem("userId", registerData.data.userId);
          localStorage.setItem("userEmail", registerData.data.email);
          localStorage.setItem("userNumber", registerData.data.phoneNum);
          localStorage.setItem(
            "userName",
            `${registerData.data.firstName} ${registerData.data.lastName}`
          );
          window.location.reload();
        }
      }
      setLoader(false);
    } catch (error) {
      await handleAccountMerge(error, auth);
      setLoader(false);
    }
  };

  // Apple Sign In
  const signInWithAppleFunc = async () => {
    const provider = new OAuthProvider("apple.com");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setLoader(true);

      const res = await fetch(`${BASE_URL}frontsite/emailChecker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const emailCheckData = await res.json();

      if (emailCheckData?.status === "1") {
        const resp = await fetch(`${BASE_URL}frontsite/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: "",
            firstName: "",
            lastName: "",
            email: user.email,
            password: "",
            countryCode: "PK",
            phoneNum: "",
            referalCode: "",
            signedFrom: "apple",
          }),
        });

        const registerData = await resp.json();

        if (registerData?.status === "1") {
          localStorage.setItem("accessToken", registerData.data.accessToken);
          localStorage.setItem("userId", registerData.data.userId);
          localStorage.setItem("userEmail", registerData.data.email);
          localStorage.setItem("userNumber", registerData.data.phoneNum);
          localStorage.setItem(
            "userName",
            `${registerData.data.firstName} ${registerData.data.lastName}`
          );
          window.location.reload();
        }
      }
      setLoader(false);
    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        await handleAccountMerge(error, auth);
      }
      setLoader(false);
    }
  };

  // Merge accounts
  const mergeAccounts = async () => {
    try {
      const otpResponse = await fetch(`${BASE_URL}frontsite/verifyOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, OTP: mergeOtp }),
      });

      const otpData = await otpResponse.json();

      if (otpData?.status === "1") {
        let existingProviderInstance;
        if (existingProvider === "Google") {
          existingProviderInstance = new GoogleAuthProvider();
        } else if (existingProvider === "Facebook") {
          existingProviderInstance = new FacebookAuthProvider();
        } else if (existingProvider === "Apple") {
          existingProviderInstance = new OAuthProvider("apple.com");
        }

        const existingResult = await signInWithPopup(auth, existingProviderInstance);
        const existingUser = existingResult.user;

        await linkWithCredential(existingUser, pendingCred);

        localStorage.setItem("accessToken", existingUser.accessToken);
        localStorage.setItem("userId", otpData.data.userId);
        localStorage.setItem("userEmail", existingUser.email);
        localStorage.setItem("userNumber", otpData.data.phoneNum);
        localStorage.setItem("userName", existingUser.displayName || "");

        setShowMergeModal(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Merge error:", error);
    }
  };

  return (
    <div>
      <button onClick={signInWithGoogleFunc} disabled={loader}>
        <FcGoogle size={20} />
        Continue with Google
      </button>

      <button onClick={signInWithFacebookFunc} disabled={loader}>
        <FaFacebook size={20} color="#1877F2" />
        Continue with Facebook
      </button>

      <button onClick={signInWithAppleFunc} disabled={loader}>
        <BsApple size={20} />
        Continue with Apple
      </button>

      {showMergeModal && (
        <div>
          <h3>Account Merge Required</h3>
          <p>This email is already registered with {existingProvider}</p>
          <input
            type="text"
            placeholder="Enter OTP"
            value={mergeOtp}
            onChange={(e) => setMergeOtp(e.target.value)}
          />
          <button onClick={mergeAccounts}>Verify & Merge</button>
        </div>
      )}
    </div>
  );
};

export default SocialAuthComponent;
```

---

## Important Notes

### Security Considerations

1. **Never expose Firebase API keys in public repositories** - Use environment variables
2. **Never expose Facebook App Secret** - Keep it only in Firebase Console
3. **Use HTTPS in production** - Required for OAuth redirects
4. **Validate tokens on backend** - Don't trust frontend tokens alone
5. **Implement rate limiting** - Prevent abuse of OTP endpoints

### Common Issues and Solutions

1. **"auth/account-exists-with-different-credential"**
   - Solution: Implement account merging flow

2. **Apple Sign In not working**
   - Check: Apple Developer account is active
   - Check: Service ID is configured correctly
   - Check: `.well-known/apple-app-site-association` is accessible

3. **Facebook redirect URI mismatch**
   - Solution: Ensure redirect URI in Facebook matches Firebase exactly

4. **Google OAuth popup blocked**
   - Solution: Ensure popup blockers are disabled
   - Solution: Use `signInWithRedirect` as fallback

### Testing Checklist

- [ ] Google sign in works
- [ ] Facebook sign in works
- [ ] Apple sign in works (requires Apple device or simulator)
- [ ] Account merging works when email exists with different provider
- [ ] OTP verification works for account merging
- [ ] Error handling works for all scenarios
- [ ] User data is saved correctly in localStorage
- [ ] Backend receives correct `signedFrom` parameter

---

## Summary

This guide covers:

1. ✅ Firebase setup and configuration
2. ✅ Google OAuth implementation
3. ✅ Facebook OAuth implementation
4. ✅ Apple Sign In implementation
5. ✅ Account merging flow
6. ✅ Backend integration requirements
7. ✅ Complete code examples
8. ✅ Security considerations
9. ✅ Troubleshooting tips

Follow each step carefully, and you'll have a complete social authentication system working in your application.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Framework**: React + Firebase Authentication

