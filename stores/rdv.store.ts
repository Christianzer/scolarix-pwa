import { create } from 'zustand';
import { rdvService } from '@/services/rdv.service';
import type { RendezVous, StatutRdv } from '@/types/rendez-vous';
import type { ConfirmerPayload, ReporterPayload } from '@/services/rdv.service';

interface RdvState {
  items: RendezVous[];
  total: number;
  isLoading: boolean;
  isActing: boolean;
  fetchAll: (params?: { statut?: StatutRdv }) => Promise<void>;
  confirmer: (id: number, payload: ConfirmerPayload) => Promise<void>;
  annuler: (id: number) => Promise<void>;
  reporter: (id: number, payload: ReporterPayload) => Promise<void>;
}

export const useRdvStore = create<RdvState>()((set, get) => ({
  items: [],
  total: 0,
  isLoading: false,
  isActing: false,

  fetchAll: async (params) => {
    set({ isLoading: true });
    try {
      const res = await rdvService.getAll(params);
      set({ items: res.data, total: res.meta.total });
    } finally {
      set({ isLoading: false });
    }
  },

  confirmer: async (id, payload) => {
    set({ isActing: true });
    try {
      const updated = await rdvService.confirmer(id, payload);
      set((s) => ({
        items: s.items.map((r) => (r.id === id ? updated : r)),
      }));
    } finally {
      set({ isActing: false });
    }
  },

  annuler: async (id) => {
    set({ isActing: true });
    try {
      const updated = await rdvService.annuler(id);
      set((s) => ({
        items: s.items.map((r) => (r.id === id ? updated : r)),
      }));
    } finally {
      set({ isActing: false });
    }
  },

  reporter: async (id, payload) => {
    set({ isActing: true });
    try {
      const updated = await rdvService.reporter(id, payload);
      set((s) => ({
        items: s.items.map((r) => (r.id === id ? updated : r)),
      }));
    } finally {
      set({ isActing: false });
    }
  },
}));
