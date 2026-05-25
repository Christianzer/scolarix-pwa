import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth.store';
import { tokenStorage } from '@/services/api';

vi.mock('@/services/auth.service', () => ({
  default: {
    login: vi.fn(),
    me: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  },
}));
vi.mock('@/lib/notifications', () => ({ registerPushToken: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/pusher', () => ({ disconnectPusher: vi.fn().mockResolvedValue(undefined) }));

// Mock all other stores to avoid import errors
vi.mock('@/stores/eleve.store', () => ({ useEleveStore: { setState: vi.fn() } }));
vi.mock('@/stores/enseignant.store', () => ({ useEnseignantStore: { setState: vi.fn() } }));
vi.mock('@/stores/parent.store', () => ({ useParentStore: { setState: vi.fn() } }));
vi.mock('@/stores/admin.store', () => ({ useAdminStore: { setState: vi.fn() } }));
vi.mock('@/stores/devoirs.store', () => ({ useDevoirsStore: { setState: vi.fn() } }));
vi.mock('@/stores/elearning.store', () => ({ useElearningStore: { setState: vi.fn() } }));
vi.mock('@/stores/messages.store', () => ({ useMessagesStore: { setState: vi.fn() } }));
vi.mock('@/stores/pointage.store', () => ({ usePointageStore: { getState: vi.fn(() => ({ reset: vi.fn() })) } }));
vi.mock('@/stores/sondage.store', () => ({ useSondageStore: { setState: vi.fn() } }));
vi.mock('@/stores/annee-scolaire.store', () => ({ useAnneeScolaireStore: { setState: vi.fn() } }));

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, token: null, isReady: false });
    vi.clearAllMocks();
  });

  it('initial state is correct', () => {
    const { user, token, isReady } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(isReady).toBe(false);
  });

  it('login stores token in localStorage and updates store state', async () => {
    const authService = (await import('@/services/auth.service')).default;
    vi.mocked(authService.login).mockResolvedValue({
      data: {
        token: 'jwt-123',
        user: {
          id: 1, nom: 'Dupont', prenom: 'Jean', nom_complet: 'Jean Dupont',
          email: 'jean@test.com', telephone: null, telephone_whatsapp: null,
          role: 'enseignant' as const, role_label: 'Enseignant', actif: true,
          avatar_url: null, email_verified_at: null,
        },
      },
    } as never);

    await useAuthStore.getState().login('jean@test.com', 'password');

    expect(useAuthStore.getState().user?.nom).toBe('Dupont');
    expect(useAuthStore.getState().token).toBe('jwt-123');
    expect(tokenStorage.get()).toBe('jwt-123');
  });

  it('logout clears store and localStorage', async () => {
    tokenStorage.set('jwt-123');
    useAuthStore.setState({ user: { id: 1 } as never, token: 'jwt-123' });
    const authService = (await import('@/services/auth.service')).default;
    vi.mocked(authService.logout).mockResolvedValue({} as never);

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(tokenStorage.get()).toBeNull();
  });

  it('restoreSession sets isReady=true with no token', async () => {
    await useAuthStore.getState().restoreSession();
    expect(useAuthStore.getState().isReady).toBe(true);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('restoreSession with valid token calls /me and sets user', async () => {
    tokenStorage.set('valid-token');
    const authService = (await import('@/services/auth.service')).default;
    vi.mocked(authService.me).mockResolvedValue({
      data: {
        user: {
          id: 2, nom: 'Martin', prenom: 'Sophie', nom_complet: 'Sophie Martin',
          email: 'sophie@test.com', telephone: null, telephone_whatsapp: null,
          role: 'admin1' as const, role_label: 'Admin', actif: true,
          avatar_url: null, email_verified_at: null,
        },
      },
    } as never);

    // Set expiry far in future so no refresh is needed
    // tokenStorage.set already sets expiry 30 days out
    await useAuthStore.getState().restoreSession();

    expect(useAuthStore.getState().user?.nom).toBe('Martin');
    expect(useAuthStore.getState().isReady).toBe(true);
    expect(authService.me).toHaveBeenCalled();
  });
});
