const QUEUE_KEY = '@scolarix_offline_queue';
const CACHE_PREFIX = '@scolarix_cache_';

export interface OfflineAction {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data: Record<string, unknown>;
  createdAt: string;
}

// ─── Vérifier la connectivité ─────────────────────────────────────────────────

export const isOnline = (): boolean => {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
};

// ─── File d'attente hors-ligne ────────────────────────────────────────────────

export const ajouterAction = async (action: Omit<OfflineAction, 'id' | 'createdAt'>): Promise<void> => {
  if (typeof window === 'undefined') return;
  const queue = await getQueue();
  queue.push({ ...action, id: Date.now().toString(), createdAt: new Date().toISOString() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const getQueue = async (): Promise<OfflineAction[]> => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const supprimerAction = async (id: string): Promise<void> => {
  if (typeof window === 'undefined') return;
  const queue = await getQueue();
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.filter(a => a.id !== id)));
};

export const viderQueue = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(QUEUE_KEY);
  }
};

// ─── Synchronisation ─────────────────────────────────────────────────────────

export const synchroniser = async (apiFn: (action: OfflineAction) => Promise<void>): Promise<{ synced: number; failed: number }> => {
  const online = isOnline();
  if (!online) { return { synced: 0, failed: 0 }; }

  const queue = await getQueue();
  let synced = 0;
  let failed = 0;

  for (const action of queue) {
    try {
      await apiFn(action);
      await supprimerAction(action.id);
      synced++;
    } catch {
      failed++;
    }
  }

  return { synced, failed };
};

// ─── Cache données ────────────────────────────────────────────────────────────

export const cacheSet = async (key: string, data: unknown, ttlMs = 5 * 60 * 1000): Promise<void> => {
  if (typeof window === 'undefined') return;
  const entry = { data, expiresAt: Date.now() + ttlMs };
  localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CACHE_PREFIX + key);
  if (!raw) { return null; }
  const entry = JSON.parse(raw);
  if (Date.now() > entry.expiresAt) {
    localStorage.removeItem(CACHE_PREFIX + key);
    return null;
  }
  return entry.data as T;
};

export const cacheClear = async (key: string): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_PREFIX + key);
  }
};
