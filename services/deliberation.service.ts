import api from './api';
import type {
  Deliberation,
  DeliberationDetail,
  Decision,
  Periode,
} from '@/types/deliberation';

export const deliberationService = {
  async getAll(params?: { classe_id?: number; periode?: Periode }): Promise<Deliberation[]> {
    const res = await api.get('/admin/deliberations', { params });
    return res.data.data ?? [];
  },

  async getById(id: number): Promise<DeliberationDetail> {
    const res = await api.get(`/admin/deliberations/${id}`);
    return res.data.data;
  },

  async create(payload: { classe_id: number; periode: Periode }): Promise<{ id: number }> {
    const res = await api.post('/admin/deliberations', payload);
    return res.data.data;
  },

  async valider(id: number): Promise<void> {
    await api.post(`/admin/deliberations/${id}/valider`);
  },

  async updateResultat(
    deliberationId: number,
    resultatId: number,
    payload: { decision?: Decision | null; commentaire?: string | null },
  ): Promise<void> {
    await api.patch(`/admin/deliberations/${deliberationId}/resultats/${resultatId}`, payload);
  },
};
