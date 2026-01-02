// // vapidKey: "BHqdkpwqEH9B9Rnw_lsvJz9cfuNyo-c8wPXLLexm6X9E0gryGLxztXXvGfqazZL7frP2D6GL9B1MO9JObNiYrRE",
// import { addToast } from "@heroui/react";
// import { messaging, getToken } from "./firebase";

// export const requestDeviceToken = async () => {
//   if (!messaging) return null;

//   try {
//     const permission = await Notification.requestPermission();

//     if (permission !== "granted") {
//       addToast({
//         title: "Permisson Blocked",
//         description: "Alow notifications to receive messages from firebase",
//         color: "danger",
//       });
//       return null;
//     }

//     const currentToken = await getToken(messaging, {
//       vapidKey:
//         "BHqdkpwqEH9B9Rnw_lsvJz9cfuNyo-c8wPXLLexm6X9E0gryGLxztXXvGfqazZL7frP2D6GL9B1MO9JObNiYrRE",
//     });

//     if (currentToken) {
//       localStorage.setItem("devToken", currentToken);
//       return currentToken;
//     } else {
//       console.warn("No registration token available.");
//       return null;
//     }
//   } catch (err) {
//     console.error("Error getting FCM token", err);
//     return null;
//   }
// };

import { getMessagingInstance, getToken } from "./firebase";

export const requestDeviceToken = async () => {
  console.log("🔥 requestDeviceToken() called");
  try {
    // ✅ checking permissions here
    console.log("🔥 Step 1: Checking notification permission...");
    const permission = await Notification.requestPermission();
    console.log("🔥 Notification permission:", permission);

    if (permission !== "granted") {
      console.warn("🔥 Notification permission not granted:", permission);
      return null;
    }

    // ✅ Wait for messaging to be initialized and supported
    console.log("🔥 Step 2: Getting messaging instance...");
    const messaging = await getMessagingInstance();
    console.log("🔥 Messaging instance:", messaging ? "✅ Got instance" : "❌ Failed");

    if (!messaging) {
      console.warn("🔥 FCM is not supported on this browser.");
      return null;
    }

    // ✅ Register service worker
    console.log("🔥 Step 3: Registering service worker...");
    let registration;
    try {
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("🔥 Service worker registered:", registration ? "✅ Success" : "❌ Failed");
    } catch (swError) {
      console.error("🔥 Service worker registration error:", swError);
      console.error("🔥 Service worker error details:", swError.message);
      // Try to get existing registration
      registration = await navigator.serviceWorker.getRegistration();
      console.log("🔥 Existing service worker registration:", registration ? "✅ Found" : "❌ Not found");
    }

    // ✅ Get the FCM token
    console.log("🔥 Step 4: Getting FCM token...");
    const currentToken = await getToken(messaging, {
      vapidKey:
        "BHqdkpwqEH9B9Rnw_lsvJz9cfuNyo-c8wPXLLexm6X9E0gryGLxztXXvGfqazZL7frP2D6GL9B1MO9JObNiYrRE",
      serviceWorkerRegistration: registration,
    });

    console.log("🔥 FCM token received:", currentToken ? "✅ Success" : "❌ Failed");

    if (currentToken) {
      console.log("🔥 Token value (first 30 chars):", currentToken.substring(0, 30) + "...");
      localStorage.setItem("devToken", currentToken);
      console.log("🔥 Token saved to localStorage");
      return currentToken;
    } else {
      console.warn("🔥 No registration token available.");
      console.warn("🔥 Possible reasons:");
      console.warn("   - Service worker not properly registered");
      console.warn("   - VAPID key mismatch");
      console.warn("   - Firebase project configuration issue");
      return null;
    }
  } catch (err) {
    console.error("🔥 Error getting FCM token:", err);
    console.error("🔥 Error message:", err?.message);
    console.error("🔥 Error stack:", err?.stack);
    return null;
  }
};
