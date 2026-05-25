/**
 * lib/pusher.ts — Messagerie temps réel via Firebase Realtime Database.
 * Remplace Pusher/Reverb — les exports conservent la même signature pour compatibilité.
 *
 * Structure RTDB :
 *   chats/signals/{recipientId}          → signal nouveau message privé
 *   chats/typing/{recipientId}/{senderId} → indicateur "en train d'écrire"
 *   chats/groupes/{groupeId}             → signal nouveau message groupe
 */
import { firebaseApp } from './firebase';
import {
  getDatabase,
  ref,
  onValue,
  onChildAdded,
  onChildChanged,
  set,
  remove,
  type Unsubscribe,
} from 'firebase/database';

function getDb() {
  return getDatabase(firebaseApp);
}

/**
 * Écoute les nouveaux messages et le signal "en train d'écrire" pour l'utilisateur courant.
 * Le paramètre bearerToken est conservé pour compatibilité mais n'est plus utilisé.
 */
export async function subscriberMessages(
  myUserId: number,
  _bearerToken: string,
  onMessage: (data: Record<string, unknown>) => void,
  onTyping?: (data: Record<string, unknown>) => void,
): Promise<() => void> {
  try {
    const db = getDb();
    const listenTs = Date.now();
    const unsubs: Unsubscribe[] = [];

    // Signal nouveau message — on ignore le snapshot initial (chargement au montage)
    let firstSignal = true;
    const signalRef = ref(db, `chats/signals/${myUserId}`);
    unsubs.push(
      onValue(signalRef, (snap) => {
        if (firstSignal) { firstSignal = false; return; }
        const data = snap.val() as Record<string, unknown> | null;
        if (data) onMessage(data);
      }),
    );

    // Indicateur "en train d'écrire" — filtre les signaux antérieurs à l'écoute
    if (onTyping) {
      const typingRef = ref(db, `chats/typing/${myUserId}`);
      const handleTyping = (snap: { val: () => unknown; key: string | null }) => {
        const val = snap.val() as { ts: number } | null;
        if (val?.ts && val.ts > listenTs) {
          onTyping({ expediteur_id: parseInt(snap.key ?? '0', 10) });
        }
      };
      unsubs.push(onChildAdded(typingRef, handleTyping));
      unsubs.push(onChildChanged(typingRef, handleTyping));
    }

    return () => unsubs.forEach((u) => u());
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('[Scolarix]', e);
    return () => {};
  }
}

/**
 * Envoie un signal "en train d'écrire" directement dans Firebase (aucun roundtrip API).
 * Le signal est automatiquement supprimé après 3,5 secondes.
 */
export async function sendTypingSignal(recipientId: number, senderId: number): Promise<void> {
  try {
    const db = getDb();
    const typingRef = ref(db, `chats/typing/${recipientId}/${senderId}`);
    await set(typingRef, { ts: Date.now() });
    setTimeout(() => remove(typingRef).catch(() => {}), 3500);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('[Scolarix]', e);
    // ignore — non bloquant
  }
}

/**
 * Écoute les nouveaux messages d'un groupe.
 * Le paramètre bearerToken est conservé pour compatibilité mais n'est plus utilisé.
 */
export async function subscriberGroupeMessages(
  groupeId: number,
  _bearerToken: string,
  onMessage: (data: Record<string, unknown>) => void,
): Promise<() => void> {
  try {
    const db = getDb();
    let first = true;
    const groupRef = ref(db, `chats/groupes/${groupeId}`);
    const unsub = onValue(groupRef, (snap) => {
      if (first) { first = false; return; }
      const data = snap.val() as Record<string, unknown> | null;
      if (data) onMessage(data);
    });
    return unsub;
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('[Scolarix]', e);
    return () => {};
  }
}

/**
 * Kept for API compatibility with auth.store — no-op since Firebase Web SDK manages reconnection automatically
 */
export async function disconnectPusher(): Promise<void> {
  // Rien à faire : Firebase Web SDK n'a pas de déconnexion explicite.
}
