import api from './api';

export interface Salle {
  id: number;
  nom: string;
  type: string | null;
  capacite: number | null;
  description: string | null;
  actif: boolean;
}

export interface SallePayload {
  nom: string;
  type?: string | null;
  capacite?: number | null;
  description?: string | null;
  actif?: boolean;
}

export interface CreneauReserve {
  id: number;
  heure_debut: string;
  heure_fin: string;
  statut: string;
  motif: string | null;
}

export interface DisponibilitesResult {
  salle_id: number;
  salle_nom: string;
  date: string;
  reservations: CreneauReserve[];
  disponible: boolean;
}

export const salleService = {
  async getAll(params?: { type?: string; actif?: boolean }): Promise<Salle[]> {
    const res = await api.get('/salles', { params });
    return res.data.data ?? [];
  },

  async create(payload: SallePayload): Promise<Salle> {
    const res = await api.post('/admin/salles', payload);
    return res.data.data;
  },

  async update(id: number, payload: SallePayload): Promise<Salle> {
    const res = await api.put(`/admin/salles/${id}`, payload);
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/salles/${id}`);
  },

  async getDisponibilites(id: number, date: string): Promise<DisponibilitesResult> {
    const res = await api.get(`/salles/${id}/disponibilites`, { params: { date } });
    return res.data.data;
  },
};
