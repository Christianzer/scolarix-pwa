import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { elearningService } from '@/services/elearning.service';
import { zustandStorage } from '@/lib/zustand-storage';
import type { CoursResume, CoursDetail, ElearningMeta } from '@/types/elearning';

interface ElearningStore {
  cours: CoursResume[];
  coursMeta: ElearningMeta | null;
  coursDetail: CoursDetail | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  fetchCours: (params?: { page?: number }) => Promise<void>;
  fetchCoursDetail: (id: number) => Promise<void>;
  marquerComplete: (id: number) => Promise<void>;
  clearDetail: () => void;
}

export const useElearningStore = create<ElearningStore>()(
  persist(
    (set, get) => ({
  cours: [],
  coursMeta: null,
  coursDetail: null,
  isLoading: false,
  isLoadingDetail: false,

  fetchCours: async (params) => {
    set({ isLoading: true });
    try {
      const result = await elearningService.getCours(params);
      const page = params?.page ?? 1;
      set((state) => ({
        cours: page > 1 ? [...state.cours, ...result.data] : result.data,
        coursMeta: result.meta,
      }));
    } catch {
      // silently fail — la liste persiste depuis le cache zustand
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCoursDetail: async (id) => {
    set({ isLoadingDetail: true, coursDetail: null });
    try {
      const detail = await elearningService.getCour(id);
      set({ coursDetail: detail });
    } catch {
      // silently fail — l'écran affiche l'état loading/vide
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  marquerComplete: async (id) => {
    try {
      await elearningService.marquerComplete(id);
      // Mettre à jour localement
      set((state) => ({
        cours: state.cours.map((c) =>
          c.id === id ? { ...c, complete: true } : c
        ),
        coursDetail: state.coursDetail?.id === id
          ? { ...state.coursDetail, complete: true }
          : state.coursDetail,
      }));
    } catch {
      // best-effort : la progression est persistée côté serveur
    }
  },

  clearDetail: () => set({ coursDetail: null }),
    }),
    {
      name: 'elearning-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        cours: state.cours,
        coursMeta: state.coursMeta,
      }),
    }
  )
);
