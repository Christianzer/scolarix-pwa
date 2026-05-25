import api from './api';
import type { StatutPresence } from '@/types/absences';

export interface AppelPayload {
  classe_id: number;
  date: string; // YYYY-MM-DD
  presences: { eleve_id: number; statut: StatutPresence }[];
}

export const absencesService = {
  async sauvegarderAppel(payload: AppelPayload): Promise<void> {
    await api.post('/appel', payload);
  },

  async getAppelDuJour(classeId: number): Promise<{ eleve_id: number; statut: StatutPresence }[]> {
    const res = await api.get(`/appel/${classeId}/aujourd-hui`);
    return res.data.data ?? [];
  },
};
