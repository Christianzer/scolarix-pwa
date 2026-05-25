import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { adminService } from '@/services/admin.service';
import { zustandStorage } from '@/lib/zustand-storage';
import type { EleveAdmin, EleveAdminDetail, PaiementAdmin, PaginationMeta } from '@/types/admin';

interface AdminState {
  eleves: EleveAdmin[];
  eleveDetail: EleveAdminDetail | null;
  paiements: PaiementAdmin[];
  eleveMeta: PaginationMeta | null;
  paiementMeta: PaginationMeta | null;
  totalAujourdhui: number;
  isLoadingEleves: boolean;
  isLoadingDetail: boolean;
  isLoadingPaiements: boolean;
  fetchEleves: (params?: { page?: number; search?: string; classe_id?: number }) => Promise<void>;
  fetchEleveDetail: (id: number) => Promise<void>;
  fetchPaiements: (params?: { page?: number; type?: string; statut?: string; search?: string }) => Promise<void>;
  clearDetail: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      eleves: [],
      eleveDetail: null,
      paiements: [],
      eleveMeta: null,
      paiementMeta: null,
      totalAujourdhui: 0,
      isLoadingEleves: false,
      isLoadingDetail: false,
      isLoadingPaiements: false,

      fetchEleves: async (params) => {
        set({ isLoadingEleves: true });
        try {
          const { data, meta } = await adminService.getEleves(params);
          set({ eleves: data, eleveMeta: meta });
        } finally {
          set({ isLoadingEleves: false });
        }
      },

      fetchEleveDetail: async (id) => {
        set({ isLoadingDetail: true });
        try {
          const detail = await adminService.getEleveDetail(id);
          set({ eleveDetail: detail });
        } finally {
          set({ isLoadingDetail: false });
        }
      },

      fetchPaiements: async (params) => {
        set({ isLoadingPaiements: true });
        try {
          const { data, meta, stats } = await adminService.getPaiements(params);
          set({ paiements: data, paiementMeta: meta, totalAujourdhui: stats.total_aujourd_hui });
        } finally {
          set({ isLoadingPaiements: false });
        }
      },

      clearDetail: () => set({ eleveDetail: null }),
    }),
    {
      name: 'admin-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        eleves: state.eleves,
        paiements: state.paiements,
        eleveMeta: state.eleveMeta,
        paiementMeta: state.paiementMeta,
        totalAujourdhui: state.totalAujourdhui,
      }),
    }
  )
);
