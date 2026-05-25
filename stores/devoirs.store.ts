import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devoirsService } from '@/services/devoirs.service';
import { zustandStorage } from '@/lib/zustand-storage';
import type { Devoir } from '@/types/devoirs';

function planifierRappelsDevoirs(_devoirs: Devoir[]): void {
  // TODO: implement with Service Worker
}

interface DevoirsState {
  devoirs: Devoir[];
  isLoading: boolean;
  isSoumettant: boolean;
  error: string | null;
  fetchDevoirs: () => Promise<void>;
  soumettre: (id: number, contenu?: string) => Promise<boolean>;
  soumettrePhoto: (id: number, uri: string, nom: string, mime: string) => Promise<boolean>;
}

export const useDevoirsStore = create<DevoirsState>()(
  persist(
    (set) => ({
  devoirs: [],
  isLoading: false,
  isSoumettant: false,
  error: null,

  fetchDevoirs: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await devoirsService.getAll();
      set({ devoirs: data });
      // Planifier les rappels locaux pour les devoirs non encore rendus
      planifierRappelsDevoirs(data);
    } catch {
      set({ error: 'Impossible de charger les devoirs.' });
    } finally {
      set({ isLoading: false });
    }
  },

  soumettre: async (id: number, contenu?: string): Promise<boolean> => {
    set({ isSoumettant: true });
    try {
      await devoirsService.soumettre(id, contenu);
      set((state) => ({
        devoirs: state.devoirs.map((d) =>
          d.id === id ? { ...d, fait: true } : d
        ),
      }));
      return true;
    } catch {
      return false;
    } finally {
      set({ isSoumettant: false });
    }
  },

  soumettrePhoto: async (id: number, uri: string, nom: string, mime: string): Promise<boolean> => {
    set({ isSoumettant: true });
    try {
      await devoirsService.soumettrePhoto(id, uri, nom, mime);
      set((state) => ({
        devoirs: state.devoirs.map((d) =>
          d.id === id ? { ...d, fait: true } : d
        ),
      }));
      return true;
    } catch {
      return false;
    } finally {
      set({ isSoumettant: false });
    }
  },
    }),
    {
      name: 'devoirs-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ devoirs: state.devoirs }),
    }
  )
);
