import { create } from 'zustand';
import { tokenStorage, authEvents } from '@/services/api';
import authService from '@/services/auth.service';
import { registerPushToken } from '@/lib/notifications';
import { disconnectPusher } from '@/lib/pusher';
import type { User } from '@/types/auth';
import { useEleveStore } from './eleve.store';
import { useEnseignantStore } from './enseignant.store';
import { useParentStore } from './parent.store';
import { useAdminStore } from './admin.store';
import { useDevoirsStore } from './devoirs.store';
import { useElearningStore } from './elearning.store';
import { useMessagesStore } from './messages.store';
import { usePointageStore } from './pointage.store';
import { useSondageStore } from './sondage.store';
import { useAnneeScolaireStore } from './annee-scolaire.store';

interface AuthState {
  user: User | null;
  token: string | null;
  isReady: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  restoreSession: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  loginMatricule: (matricule: string) => Promise<void>;
  loginWithToken: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  activerBiometrie: () => Promise<void>;
  desactiverBiometrie: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isReady: false,
    biometricAvailable: false,
    biometricEnabled: false,

    restoreSession: async () => {
      if (typeof window !== 'undefined') {
        const biometricEnabled = localStorage.getItem('biometric_enabled') === 'true';
        set({ biometricEnabled });
      }

      const token = tokenStorage.get();
      if (!token) {
        set({ isReady: true });
        return;
      }
      try {
        const expiry = tokenStorage.getExpiry();
        const msLeft = expiry - Date.now();

        // Expired token — clear immediately without network calls
        if (expiry && msLeft <= 0) {
          tokenStorage.remove();
          set({ user: null, token: null, isReady: true });
          return;
        }

        const shouldRefresh = !expiry || msLeft < 24 * 60 * 60 * 1000;

        if (shouldRefresh) {
          try {
            const { data } = await authService.refresh();
            tokenStorage.set(data.token);
            set({ user: data.user, token: data.token, isReady: true });
            registerPushToken().catch(() => {});
          } catch {
            const { data } = await authService.me();
            set({ user: data.user, token, isReady: true });
          }
        } else {
          const { data } = await authService.me();
          set({ user: data.user, token, isReady: true });
        }
      } catch {
        tokenStorage.remove();
        set({ user: null, token: null, isReady: true });
      }
    },

    login: async (identifier, password) => {
      const { data } = await authService.login(identifier, password);
      tokenStorage.set(data.token);
      set({ user: data.user, token: data.token });
      registerPushToken().catch(() => {});
    },

    loginMatricule: async (matricule) => {
      const { data } = await authService.loginMatricule(matricule);
      tokenStorage.set(data.token);
      set({ user: data.user, token: data.token });
      registerPushToken().catch(() => {});
    },

    loginWithToken: async (token, user) => {
      if (!token) throw new Error('loginWithToken: token is required');
      tokenStorage.set(token);
      set({ user, token });
      registerPushToken().catch(() => {});
    },

    logout: async () => {
      try { await authService.logout(); } catch {}
      tokenStorage.remove();
      disconnectPusher().catch(() => {});

      useEleveStore.setState({
        notes: [],
        cours: [],
        classe: null,
        absences: [],
        isLoadingNotes: false,
        isLoadingCours: false,
        isLoadingAbsences: false,
      });
      useEnseignantStore.setState({
        classes: [],
        elevesByClasse: {},
        isLoadingClasses: false,
        isLoadingEleves: false,
        isSaving: false,
      });
      useParentStore.setState({
        enfants: [],
        enfantSelectionne: null,
        paiements: [],
        totalPaye: 0,
        isLoadingEnfants: false,
        isLoadingDetail: false,
        isLoadingPaiements: false,
        isJustifiant: false,
        isReclamant: false,
      });
      useAdminStore.setState({
        eleves: [],
        eleveDetail: null,
        paiements: [],
        eleveMeta: null,
        paiementMeta: null,
        totalAujourdhui: 0,
        isLoadingEleves: false,
        isLoadingDetail: false,
        isLoadingPaiements: false,
      });
      useDevoirsStore.setState({
        devoirs: [],
        isLoading: false,
        isSoumettant: false,
        error: null,
      });
      useElearningStore.setState({
        cours: [],
        coursMeta: null,
        coursDetail: null,
        isLoading: false,
        isLoadingDetail: false,
      });
      useMessagesStore.setState({
        conversations: [],
        messages: {},
        convMeta: {},
        isLoading: false,
        isLoadingMore: false,
        isSending: false,
        error: null,
      });
      usePointageStore.getState().reset();
      useSondageStore.setState({
        sondages: [],
        sondageDetail: null,
        isLoading: false,
        isLoadingDetail: false,
        isSending: false,
      });
      useAnneeScolaireStore.setState({ annee: null, isLoading: false });

      set({ user: null, token: null });
    },

    activerBiometrie: async () => {
      // WebAuthn registration not yet implemented — store flag only
      localStorage.setItem('biometric_enabled', 'true');
      set({ biometricEnabled: true });
    },

    desactiverBiometrie: async () => {
      localStorage.removeItem('biometric_enabled');
      set({ biometricEnabled: false });
    },
}));

// Register ONCE, outside factory — avoids accumulation on hot-reload
authEvents.on('logout', () => useAuthStore.setState({ user: null, token: null }));
