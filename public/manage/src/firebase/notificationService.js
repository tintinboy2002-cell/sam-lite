// src/notificationService.js
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase"; // your firebase.js file
 
const VAPID_KEY = "BPzOMxZWyo8I18MBlr_aI16fIQZYfXA_WThK-W5pac6VUKzDd14V67v69GtQ-fv1zfhZ0B9CcPmtvjF6UB3GLW0";
 
export const requestForToken = async () => {
  try {
    // Avoid duplicate SW registration
    let registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");

    if (!registration) {
      registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      // console.log("✅ FCM Token retrieved:", token);
      return token;
    } else {
      console.warn("⚠️ No token received. Permission might be denied.");
      return null;
    }
  } catch (error) {
    console.error("🔥 Error getting FCM token:", error);
    return null;
  }
};
 
// Handle foreground messages for in-app notifications
let isMessageListenerAttached = false;

export const listenForMessages = (callback) => {
  if (isMessageListenerAttached) return; // prevent multiple listeners
  isMessageListenerAttached = true;

  onMessage(messaging, (payload) => {
    callback(payload);
  });
};
