import { create } from 'zustand';
import { deliberationService } from '@/services/deliberation.service';
import type {
  Deliberation,
  DeliberationDetail,
  Decision,
  Periode,
} from '@/types/deliberation';

interface DeliberationState {
  deliberations: Deliberation[];
  detail: DeliberationDetail | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  isCreating: boolean;
  isValidating: boolean;
  fetchAll: (params?: { classe_id?: number; periode?: Periode }) => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  create: (payload: { classe_id: number; periode: Periode }) => Promise<number>;
  valider: (id: number) => Promise<void>;
  updateResultat: (
    deliberationId: number,
    resultatId: number,
    payload: { decision?: Decision | null; commentaire?: string | null },
  ) => Promise<void>;
  clearDetail: () => void;
}

export const useDeliberationStore = create<DeliberationState>()((set, get) => ({
  deliberations: [],
  detail: null,
  isLoading: false,
  isLoadingDetail: false,
  isCreating: false,
  isValidating: false,

  fetchAll: async (params) => {
    set({ isLoading: true });
    try {
      const data = await deliberationService.getAll(params);
      set({ deliberations: data });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchById: async (id) => {
    set({ isLoadingDetail: true });
    try {
      const data = await deliberationService.getById(id);
      set({ detail: data });
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  create: async (payload) => {
    set({ isCreating: true });
    try {
      const data = await deliberationService.create(payload);
      // Rafraîchir la liste après création
      await get().fetchAll();
      return data.id;
    } finally {
      set({ isCreating: false });
    }
  },

  valider: async (id) => {
    set({ isValidating: true });
    try {
      await deliberationService.valider(id);
      // Mettre à jour le détail et la liste en parallèle
      await Promise.all([get().fetchById(id), get().fetchAll()]);
    } finally {
      set({ isValidating: false });
    }
  },

  updateResultat: async (deliberationId, resultatId, payload) => {
    await deliberationService.updateResultat(deliberationId, resultatId, payload);
    // Mettre à jour localement le résultat dans le détail courant
    set((state) => {
      if (!state.detail || state.detail.id !== deliberationId) return state;
      return {
        detail: {
          ...state.detail,
          resultats: state.detail.resultats.map((r) =>
            r.id === resultatId ? { ...r, ...payload } : r,
          ),
        },
      };
    });
  },

  clearDetail: () => set({ detail: null }),
}));
