import api from './api';
import type { NoteMatiere, CoursJour, AbsenceEleve } from '@/types/eleve';

export const eleveService = {
  async getNotes(): Promise<NoteMatiere[]> {
    const res = await api.get('/eleve/notes');
    return res.data.data ?? [];
  },

  async getCours(): Promise<{ data: CoursJour[]; classe: string }> {
    const res = await api.get('/eleve/cours');
    return res.data;
  },

  async getAbsences(): Promise<AbsenceEleve[]> {
    const res = await api.get('/eleve/absences');
    return res.data.data ?? [];
  },
};
