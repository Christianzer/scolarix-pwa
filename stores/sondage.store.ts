import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { sondageService } from '@/services/sondage.service';
import { zustandStorage } from '@/lib/zustand-storage';
import type { SondageResume, SondageDetail, ReponseSondage } from '@/types/sondage';

interface SondageStore {
  sondages: SondageResume[];
  sondageDetail: SondageDetail | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  isSending: boolean;
  fetchSondages: () => Promise<void>;
  fetchSondageDetail: (id: number) => Promise<void>;
  repondre: (id: number, reponses: ReponseSondage[]) => Promise<boolean>;
  clearDetail: () => void;
}

export const useSondageStore = create<SondageStore>()(
  persist(
    (set) => ({
  sondages: [],
  sondageDetail: null,
  isLoading: false,
  isLoadingDetail: false,
  isSending: false,

  fetchSondages: async () => {
    set({ isLoading: true });
    try {
      const result = await sondageService.getSondages();
      set({ sondages: result.data });
    } catch {
      // silently fail — la liste persiste depuis le cache zustand
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSondageDetail: async (id) => {
    set({ isLoadingDetail: true, sondageDetail: null });
    try {
      const detail = await sondageService.getSondage(id);
      set({ sondageDetail: detail });
    } catch {
      // silently fail — l'écran affiche l'état loading/vide
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  repondre: async (id, reponses) => {
    set({ isSending: true });
    try {
      await sondageService.repondre(id, reponses);
      // Marquer comme déjà répondu localement
      set((state) => ({
        sondages: state.sondages.map((s) =>
          s.id === id ? { ...s, deja_repondu: true } : s
        ),
      }));
      return true;
    } catch {
      return false;
    } finally {
      set({ isSending: false });
    }
  },

  clearDetail: () => set({ sondageDetail: null }),
    }),
    {
      name: 'sondage-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ sondages: state.sondages }),
    }
  )
);
