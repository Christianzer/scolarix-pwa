import api from './api';

export type StatutAbonnement = 'actif' | 'suspendu' | 'annule' | 'expire';
export type TypeAbonnement = 'scolarite' | 'renforcement' | 'extra_scolaire' | 'cantine' | 'transport' | 'garderie';

export interface AbonnementAdmin {
  id: number;
  eleve_id: number;
  eleve_nom: string | null;
  classe_nom: string | null;
  matricule: string | null;
  type: TypeAbonnement;
  libelle: string | null;
  montant_mensuel: number;
  statut: StatutAbonnement;
  statut_label: string;
  date_debut: string | null;
  date_fin: string | null;
  notes: string | null;
}

export interface AbonnementMeta {
  current_page: number;
  last_page: number;
  total: number;
}

export interface StoreAbonnementPayload {
  eleve_id: number;
  type: TypeAbonnement;
  libelle?: string | null;
  date_debut: string;
  date_fin?: string | null;
  montant_mensuel: number;
  notes?: string | null;
}

export const abonnementAdminService = {
  async getAll(params?: {
    statut?: StatutAbonnement;
    type?: TypeAbonnement;
    eleve_id?: number;
    page?: number;
  }): Promise<{ data: AbonnementAdmin[]; meta: AbonnementMeta }> {
    const res = await api.get('/admin/abonnements', { params });
    return res.data;
  },

  async create(payload: StoreAbonnementPayload): Promise<AbonnementAdmin> {
    const res = await api.post('/admin/abonnements', payload);
    return res.data.data;
  },

  async suspendre(id: number): Promise<AbonnementAdmin> {
    const res = await api.patch(`/admin/abonnements/${id}/suspendre`);
    return res.data.data;
  },

  async reactiver(id: number): Promise<AbonnementAdmin> {
    const res = await api.patch(`/admin/abonnements/${id}/reactiver`);
    return res.data.data;
  },

  async annuler(id: number): Promise<AbonnementAdmin> {
    const res = await api.patch(`/admin/abonnements/${id}/annuler`);
    return res.data.data;
  },
};
