import { firebaseApp } from './firebase';
import { tokenStorage } from '@/services/api';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export async function registerPushToken(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const { getMessaging, getToken } = await import('firebase/messaging');
    const messaging = getMessaging(firebaseApp);
    const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!fcmToken) return;

    const authToken = tokenStorage.get();
    if (!authToken) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    await fetch(`${API_URL}/auth/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: fcmToken }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('[Scolarix]', e);
    // non-blocking
  }
}

export function onForegroundMessage(handler: (payload: unknown) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  let cancelled = false;
  let unsubscribe: (() => void) | undefined;

  import('firebase/messaging').then(({ getMessaging, onMessage }) => {
    if (cancelled) return; // cleanup was called before import resolved
    const messaging = getMessaging(firebaseApp);
    unsubscribe = onMessage(messaging, handler);
  }).catch((e) => {
    if (process.env.NODE_ENV !== 'production') console.warn('[Scolarix]', e);
  });

  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}
