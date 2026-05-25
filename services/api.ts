import axios from 'axios';

type Listener = () => void;
const listeners: Record<string, Listener[]> = {};

export const authEvents = {
  on(event: string, cb: Listener) {
    listeners[event] = listeners[event] ?? [];
    listeners[event].push(cb);
  },
  off(event: string, cb: Listener) {
    listeners[event] = (listeners[event] ?? []).filter((l) => l !== cb);
  },
  emit(event: string) {
    (listeners[event] ?? []).forEach((cb) => cb());
  },
};

const TOKEN_KEY = 'auth_token';
const EXPIRY_KEY = 'auth_token_expires_at';

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string, expiryMs = 30 * 24 * 60 * 60 * 1000): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + expiryMs));
    const maxAge = Math.floor(expiryMs / 1000);
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `auth_session=1; path=/; max-age=${maxAge}; SameSite=Strict${secure}`;
  },
  getExpiry: (): number => {
    if (typeof window === 'undefined') return 0;
    const v = localStorage.getItem(EXPIRY_KEY);
    return v ? parseInt(v, 10) : 0;
  },
  remove: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    document.cookie = 'auth_session=; path=/; max-age=0; SameSite=Strict';
  },
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const storedToken = tokenStorage.get();
      if (storedToken) {
        tokenStorage.remove();
        authEvents.emit('logout');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
