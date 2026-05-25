import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { parentService } from '@/services/parent.service';
import { zustandStorage } from '@/lib/zustand-storage';
import type { Enfant, EnfantDetail, Paiement } from '@/types/parent';

interface ParentState {
  enfants: Enfant[];
  enfantSelectionne: EnfantDetail | null;
  paiements: Paiement[];
  totalPaye: number;
  isLoadingEnfants: boolean;
  isLoadingDetail: boolean;
  isLoadingPaiements: boolean;
  isJustifiant: boolean;
  isReclamant: boolean;
  fetchEnfants: () => Promise<void>;
  fetchEnfantDetail: (id: number) => Promise<void>;
  fetchPaiements: () => Promise<void>;
  justifierAbsence: (absenceId: number, justification: string) => Promise<boolean>;
  reclamarNote: (noteId: number, motif: string) => Promise<boolean>;
  deselectionnerEnfant: () => void;
}

export const useParentStore = create<ParentState>()(
  persist(
    (set) => ({
      enfants: [],
      enfantSelectionne: null,
      paiements: [],
      totalPaye: 0,
      isLoadingEnfants: false,
      isLoadingDetail: false,
      isLoadingPaiements: false,
      isJustifiant: false,
      isReclamant: false,

      fetchEnfants: async () => {
        set({ isLoadingEnfants: true });
        try {
          const enfants = await parentService.getEnfants();
          set({ enfants });
        } finally {
          set({ isLoadingEnfants: false });
        }
      },

      fetchEnfantDetail: async (id) => {
        set({ isLoadingDetail: true });
        try {
          const detail = await parentService.getEnfantDetail(id);
          set({ enfantSelectionne: detail });
        } finally {
          set({ isLoadingDetail: false });
        }
      },

      fetchPaiements: async () => {
        set({ isLoadingPaiements: true });
        try {
          const { data, total_paye } = await parentService.getPaiements();
          set({ paiements: data, totalPaye: total_paye });
        } finally {
          set({ isLoadingPaiements: false });
        }
      },

      deselectionnerEnfant: () => set({ enfantSelectionne: null }),

      reclamarNote: async (noteId: number, motif: string): Promise<boolean> => {
        set({ isReclamant: true });
        try {
          await parentService.reclamarNote(noteId, motif);
          return true;
        } catch {
          return false;
        } finally {
          set({ isReclamant: false });
        }
      },

      justifierAbsence: async (absenceId: number, justification: string): Promise<boolean> => {
        set({ isJustifiant: true });
        try {
          await parentService.justifierAbsence(absenceId, justification);
          set((state) => {
            if (!state.enfantSelectionne) return state;
            return {
              enfantSelectionne: {
                ...state.enfantSelectionne,
                absences: state.enfantSelectionne.absences.map((a) =>
                  a.id === absenceId ? { ...a, justifiee: true, justification } : a
                ),
              },
            };
          });
          return true;
        } catch {
          return false;
        } finally {
          set({ isJustifiant: false });
        }
      },
    }),
    {
      name: 'parent-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        enfants: state.enfants,
        paiements: state.paiements,
        totalPaye: state.totalPaye,
      }),
    }
  )
);
