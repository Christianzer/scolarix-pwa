import api from './api';
import type { RendezVous, RendezVousMeta, StatutRdv } from '@/types/rendez-vous';

export interface RdvPayload {
  destinataire: string;
  message: string;
  disponibilite: string;
}

export interface ConfirmerPayload {
  date_proposee: string; // YYYY-MM-DD
  heure: string;         // HH:MM
  lieu?: string;
  note?: string;
}

export interface ReporterPayload {
  date_proposee: string;
  heure: string;
  note?: string;
}

const rdvService = {
  async getMes(): Promise<RendezVous[]> {
    const res = await api.get('/mes-rdv');
    return res.data.data ?? [];
  },

  async getAll(params?: { statut?: StatutRdv; page?: number }): Promise<{
    data: RendezVous[];
    meta: RendezVousMeta;
  }> {
    const res = await api.get('/admin/rendez-vous', { params });
    return res.data;
  },

  async getById(id: number): Promise<RendezVous> {
    const res = await api.get(`/admin/rendez-vous/${id}`);
    return res.data.data;
  },

  async demander(payload: RdvPayload): Promise<void> {
    await api.post('/rdv', payload);
  },

  async confirmer(id: number, payload: ConfirmerPayload): Promise<RendezVous> {
    const res = await api.patch(`/admin/rendez-vous/${id}/confirmer`, payload);
    return res.data.data;
  },

  async annuler(id: number): Promise<RendezVous> {
    const res = await api.patch(`/admin/rendez-vous/${id}/annuler`);
    return res.data.data;
  },

  async reporter(id: number, payload: ReporterPayload): Promise<RendezVous> {
    const res = await api.patch(`/admin/rendez-vous/${id}/reporter`, payload);
    return res.data.data;
  },
};

export { rdvService };
