import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { eleveService } from '@/services/eleve.service';
import { zustandStorage } from '@/lib/zustand-storage';
import type { NoteMatiere, CoursJour, AbsenceEleve } from '@/types/eleve';

interface EleveState {
  notes: NoteMatiere[];
  cours: CoursJour[];
  classe: string | null;
  absences: AbsenceEleve[];
  isLoadingNotes: boolean;
  isLoadingCours: boolean;
  isLoadingAbsences: boolean;
  fetchNotes: () => Promise<void>;
  fetchCours: () => Promise<void>;
  fetchAbsences: () => Promise<void>;
}

export const useEleveStore = create<EleveState>()(
  persist(
    (set) => ({
      notes: [],
      cours: [],
      classe: null,
      absences: [],
      isLoadingNotes: false,
      isLoadingCours: false,
      isLoadingAbsences: false,

      fetchNotes: async () => {
        set({ isLoadingNotes: true });
        try {
          const notes = await eleveService.getNotes();
          set({ notes });
        } finally {
          set({ isLoadingNotes: false });
        }
      },

      fetchCours: async () => {
        set({ isLoadingCours: true });
        try {
          const { data, classe } = await eleveService.getCours();
          set({ cours: data, classe });
        } finally {
          set({ isLoadingCours: false });
        }
      },

      fetchAbsences: async () => {
        set({ isLoadingAbsences: true });
        try {
          const absences = await eleveService.getAbsences();
          set({ absences });
        } finally {
          set({ isLoadingAbsences: false });
        }
      },
    }),
    {
      name: 'eleve-store',
      storage: createJSONStorage(() => zustandStorage),
      // On ne persiste que les données, pas les états de chargement
      partialize: (state) => ({
        notes: state.notes,
        cours: state.cours,
        classe: state.classe,
        absences: state.absences,
      }),
    }
  )
);
