/* V4 G6 — Firebase Messaging Service Worker.
 * Recoit les push notifications FCM en arriere-plan et les affiche.
 * Doit etre servi depuis la racine `/firebase-messaging-sw.js` pour
 * que FCM puisse l'enregistrer comme scope /.
 *
 * Les credentials Firebase sont injectes via firebase.initializeApp
 * avec les valeurs publiques (pas de secret — juste identification
 * du projet cote client).
 */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Ces valeurs sont publiques (Firebase config). La securite vient du FCM_SERVER_KEY cote NestJS.
firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || '',
  authDomain: self.FIREBASE_AUTH_DOMAIN || '',
  projectId: self.FIREBASE_PROJECT_ID || '',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: self.FIREBASE_APP_ID || '',
});

const messaging = firebase.messaging();

// Mode silencieux global — pousse depuis le client via postMessage.
// Le SW stocke endsAt pour decider si une push background doit etre affichee.
// Permet de muter les push browser meme app fermee.
// Compat backward : accepte aussi FOCUS_MODE_UPDATE (ancien nom).
let silentMode = { endsAt: null };

self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;
  if (event.data.type === 'FOCUS_MODE_UPDATE' || event.data.type === 'SILENT_MODE_UPDATE') {
    silentMode = { endsAt: event.data.endsAt || null };
  }
});

function isSilentActive() {
  if (!silentMode.endsAt) return false;
  if (silentMode.endsAt === 'indefinite') return true;
  return new Date(silentMode.endsAt).getTime() > Date.now();
}

function isCriticalPush(payload) {
  // Erreurs critiques avec marqueur metier (definir cote backend dans data.priority).
  // Par defaut, seules `priority: 'critical'` ou `priority: 'high'` passent en focus mode.
  const priority = payload.data?.priority;
  return priority === 'critical' || priority === 'high';
}

messaging.onBackgroundMessage((payload) => {
  // Mode silencieux : skip les push non-critiques.
  if (isSilentActive() && !isCriticalPush(payload)) {
    return;
  }
  const title = payload.notification?.title || 'Juris-Connect';
  const options = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon-192.png',
    badge: '/icon-72.png',
    data: payload.data || {},
    tag: payload.notification?.tag || 'juris-power',
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    }),
  );
});
