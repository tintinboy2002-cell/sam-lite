// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDAY_SCz4oKgZU8glDh78NPEbAy6xOfMLA",
  authDomain: "sam-lite.firebaseapp.com",
  projectId: "sam-lite",
  storageBucket: "sam-lite.firebasestorage.app",
  messagingSenderId: "187246424219",
  appId: "1:187246424219:web:e76ac214a97237f17a163e",
  measurementId: "G-BLB8XB4B50"
});

const messaging = firebase.messaging();

// Handles background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const notif = payload.notification || {};

  // Prevent duplicate notifications
  // Firebase sometimes auto-handles notification payloads
  if (!notif.title && !notif.body) {
    return;
  }

  const notificationTitle = notif.title || "New Notification";
  const notificationOptions = {
    body: notif.body || "",
    icon: "/firebase-logo.png",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});