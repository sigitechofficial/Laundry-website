

// This is required for Firebase Messaging to work in the background
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Initialize Firebase inside the Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyApYXQsPo4aMFo3tEsOg1enAo707Bxq5pQ",
  authDomain: "justdrycleansltd.firebaseapp.com",
  projectId: "justdrycleansltd",
  storageBucket: "justdrycleansltd.firebasestorage.app",
  messagingSenderId: "475975874912",
  appId: "1:475975874912:web:de3b0055f6467d0762c605",
  measurementId: "G-1RC12F3PH2",
});

// Get messaging instance
const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage(function (payload) {

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png", // Optional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
