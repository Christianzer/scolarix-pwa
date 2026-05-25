import { create } from 'zustand';
import pointageService from '../services/pointage.service';
import type { Pointage } from '../types/pointage';

interface PointageState {
  hasPassed: boolean;
  setHasPassed: (v: boolean) => void;
  pointageJour: Pointage | null;
  historique: Pointage[];
  isLoading: boolean;
  error: string | null;
  fetchAujourdhui: () => Promise<void>;
  fetchHistorique: () => Promise<void>;
  pointer: (latitude: number, longitude: number) => Promise<{ action?: string; message: string }>;
  reset: () => void;
}

export const usePointageStore = create<PointageState>((set) => ({
  hasPassed: false,
  setHasPassed: (v) => set({ hasPassed: v }),
  pointageJour: null,
  historique: [],
  isLoading: false,
  error: null,

  fetchAujourdhui: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await pointageService.getAujourdhui();
      const pointage = response.data.pointage;
      // Si déjà pointé aujourd'hui, marquer hasPassed automatiquement
      set({ pointageJour: pointage, isLoading: false, hasPassed: !!pointage?.heure_arrivee });
    } catch {
      set({ isLoading: false, error: 'Impossible de charger le pointage du jour.' });
    }
  },

  fetchHistorique: async () => {
    try {
      const response = await pointageService.getHistorique();
      set({ historique: response.data });
    } catch {
      // silently fail pour l'historique
    }
  },

  pointer: async (latitude, longitude) => {
    set({ isLoading: true, error: null });
    try {
      const response = await pointageService.pointer(latitude, longitude);
      const pointage = response.data.pointage;
      // Dès qu'un pointage d'arrivée est enregistré, débloquer les pages protégées
      set({ pointageJour: pointage, isLoading: false, hasPassed: !!pointage?.heure_arrivee });
      return { action: response.data.action, message: response.data.message };
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      const message = apiErr?.response?.data?.message ?? 'Erreur lors du pointage.';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  reset: () => {
    set({ pointageJour: null, historique: [], error: null, hasPassed: false });
  },
}));
