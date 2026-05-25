import api from './api';
import type { Enfant, EnfantDetail, Paiement } from '@/types/parent';

export const parentService = {
  async getEnfants(): Promise<Enfant[]> {
    const res = await api.get('/parent/enfants');
    return res.data.data ?? [];
  },

  async getEnfantDetail(id: number): Promise<EnfantDetail> {
    const res = await api.get(`/parent/enfants/${id}`);
    return res.data.data;
  },

  async getPaiements(): Promise<{ data: Paiement[]; total_paye: number }> {
    const res = await api.get('/parent/paiements');
    return res.data;
  },

  async justifierAbsence(absenceId: number, justification: string): Promise<void> {
    await api.post(`/parent/absences/${absenceId}/justifier`, { justification });
  },

  async reclamarNote(noteId: number, motif: string): Promise<void> {
    await api.post(`/parent/notes/${noteId}/reclamer`, { motif });
  },
};
