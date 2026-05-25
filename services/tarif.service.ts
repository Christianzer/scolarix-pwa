import api from './api';

export interface TarifScolarite {
  id: number;
  classe_id: number;
  classe_nom: string | null;
  statut_affectation: 'tous' | 'affecte' | 'non_affecte';
  versement_numero: number;
  date_echeance: string | null;
  mois_label: string | null;
  montant: number;
}

export interface TarifOptionnel {
  id: number;
  code: string;
  label: string;
  description: string | null;
  montant_mensuel: number;
}

export interface FraisAnnexes {
  id?: number;
  annee_scolaire_id?: number;
  assurance_scolaire: number;
  carnet_correspondance: number;
  carte_acces: number;
  tablier: number;
  tenues_sport: number;
  total: number;
}

export const tarifService = {
  // ── Tarifs scolarité ──────────────────────────────────────────────
  async getScolarite(classeId?: number): Promise<TarifScolarite[]> {
    const res = await api.get('/tarifs-scolarite', { params: classeId ? { classe_id: classeId } : {} });
    return res.data.data ?? [];
  },

  async createScolarite(payload: {
    classe_id: number;
    statut_affectation: string;
    versement_numero: number;
    montant: number;
    date_echeance?: string | null;
  }): Promise<TarifScolarite> {
    const res = await api.post('/admin/tarifs-scolarite', payload);
    return res.data.data;
  },

  async updateScolarite(id: number, payload: { montant: number; date_echeance?: string | null }): Promise<void> {
    await api.put(`/admin/tarifs-scolarite/${id}`, payload);
  },

  async deleteScolarite(id: number): Promise<void> {
    await api.delete(`/admin/tarifs-scolarite/${id}`);
  },

  // ── Tarifs optionnels ─────────────────────────────────────────────
  async getOptionnels(): Promise<TarifOptionnel[]> {
    const res = await api.get('/tarifs-optionnels');
    return res.data.data ?? [];
  },

  async createOptionnel(payload: { label: string; montant_mensuel: number; description?: string | null }): Promise<TarifOptionnel> {
    const res = await api.post('/admin/tarifs-optionnels', payload);
    return res.data.data;
  },

  async updateOptionnel(id: number, payload: { label: string; montant_mensuel: number; description?: string | null }): Promise<void> {
    await api.put(`/admin/tarifs-optionnels/${id}`, payload);
  },

  async deleteOptionnel(id: number): Promise<void> {
    await api.delete(`/admin/tarifs-optionnels/${id}`);
  },

  // ── Frais annexes ─────────────────────────────────────────────────
  async getFraisAnnexes(): Promise<FraisAnnexes> {
    const res = await api.get('/frais-annexes');
    return res.data.data;
  },

  async updateFraisAnnexes(payload: Omit<FraisAnnexes, 'id' | 'annee_scolaire_id' | 'total'>): Promise<FraisAnnexes> {
    const res = await api.put('/admin/frais-annexes/config', payload);
    return res.data.data;
  },
};
