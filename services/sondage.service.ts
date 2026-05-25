import api from './api';
import type { SondageResume, SondageDetail, ReponseSondage } from '@/types/sondage';

export const sondageService = {
  async getSondages(): Promise<{ data: SondageResume[] }> {
    const response = await api.get('/sondages');
    return response.data;
  },

  async getSondage(id: number): Promise<SondageDetail> {
    const response = await api.get(`/sondages/${id}`);
    return response.data;
  },

  async repondre(id: number, reponses: ReponseSondage[]): Promise<{ message: string }> {
    const response = await api.post(`/sondages/${id}/repondre`, { reponses });
    return response.data;
  },
};
