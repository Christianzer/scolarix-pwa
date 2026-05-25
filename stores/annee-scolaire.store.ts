import { create } from 'zustand';
import anneeScolaireService from '../services/annee-scolaire.service';
import type { AnneeScolaire } from '../types/annee-scolaire';

interface AnneeScolaireState {
  annee: AnneeScolaire | null;
  isLoading: boolean;
  fetchAnnee: () => Promise<void>;
}

export const useAnneeScolaireStore = create<AnneeScolaireState>((set) => ({
  annee: null,
  isLoading: false,

  fetchAnnee: async () => {
    set({ isLoading: true });
    try {
      const annee = await anneeScolaireService.getActive();
      set({ annee, isLoading: false });
    } catch {
      set({ annee: null, isLoading: false });
    }
  },
}));
