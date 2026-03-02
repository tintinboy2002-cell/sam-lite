// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDAY_SCz4oKgZU8glDh78NPEbAy6xOfMLA',
  authDomain: 'sam-lite.firebaseapp.com',
  projectId: 'sam-lite',
  storageBucket: 'sam-lite.firebasestorage.app',
  messagingSenderId: '187246424219',
  appId: '1:187246424219:web:e76ac214a97237f17a163e',
  measurementId: 'G-BLB8XB4B50',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };