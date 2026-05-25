importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Firebase config will be injected by the app at registration time
// For now, messaging is initialized when the app calls messaging.getToken()
// which triggers service worker registration with the correct config

firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || '',
  authDomain: self.FIREBASE_AUTH_DOMAIN || '',
  projectId: self.FIREBASE_PROJECT_ID || '',
  storageBucket: self.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: self.FIREBASE_APP_ID || '',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title = 'Scolarix', body = '' } = payload.notification ?? {};
  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
  });
});
