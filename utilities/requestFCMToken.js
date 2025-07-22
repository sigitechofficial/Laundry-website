// vapidKey: "BHqdkpwqEH9B9Rnw_lsvJz9cfuNyo-c8wPXLLexm6X9E0gryGLxztXXvGfqazZL7frP2D6GL9B1MO9JObNiYrRE",
import { addToast } from "@heroui/react";
import { messaging, getToken } from "./firebase";

export const requestDeviceToken = async () => {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      addToast({
        title: "Permisson Blocked",
        description: "Alow notifications to receive messages from firebase",
        color: "danger",
      });
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey:
        "BHqdkpwqEH9B9Rnw_lsvJz9cfuNyo-c8wPXLLexm6X9E0gryGLxztXXvGfqazZL7frP2D6GL9B1MO9JObNiYrRE",
    });

    if (currentToken) {
      localStorage.setItem("devToken", currentToken);
      return currentToken;
    } else {
      console.warn("No registration token available.");
      return null;
    }
  } catch (err) {
    console.error("Error getting FCM token", err);
    return null;
  }
};
