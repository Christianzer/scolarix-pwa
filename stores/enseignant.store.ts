import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { enseignantService } from '@/services/enseignant.service';
import { zustandStorage } from '@/lib/zustand-storage';
import type { ClasseEnseignant, EleveClasse } from '@/types/enseignant';

interface EnseignantState {
  classes: ClasseEnseignant[];
  elevesByClasse: Record<number, EleveClasse[]>;
  isLoadingClasses: boolean;
  isLoadingEleves: boolean;
  isSaving: boolean;
  fetchClasses: () => Promise<void>;
  fetchElevesClasse: (classeId: number) => Promise<void>;
  saisirNotes: (
    matiereId: number,
    periode: string,
    type: string,
    notes: { eleve_id: number; valeur: number }[]
  ) => Promise<number>;
}

export const useEnseignantStore = create<EnseignantState>()(
  persist(
    (set, get) => ({
      classes: [],
      elevesByClasse: {},
      isLoadingClasses: false,
      isLoadingEleves: false,
      isSaving: false,

      fetchClasses: async () => {
        set({ isLoadingClasses: true });
        try {
          const classes = await enseignantService.getClasses();
          set({ classes });
        } finally {
          set({ isLoadingClasses: false });
        }
      },

      fetchElevesClasse: async (classeId) => {
        set({ isLoadingEleves: true });
        try {
          const { data } = await enseignantService.getElevesClasse(classeId);
          set((state) => ({ elevesByClasse: { ...state.elevesByClasse, [classeId]: data } }));
        } finally {
          set({ isLoadingEleves: false });
        }
      },

      saisirNotes: async (matiereId, periode, type, notes) => {
        set({ isSaving: true });
        try {
          const count = await enseignantService.saisirNotesBulk({
            matiere_id: matiereId,
            periode,
            type,
            notes: notes.map((n) => ({ eleve_id: n.eleve_id, valeur: n.valeur })),
          });
          return count;
        } finally {
          set({ isSaving: false });
        }
      },
    }),
    {
      name: 'enseignant-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        classes: state.classes,
        elevesByClasse: state.elevesByClasse,
      }),
    }
  )
);
