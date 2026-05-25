import api from './api';

export interface RelanceConfig {
  id: number;
  jours_retard: number;
  actif: boolean;
  canal_email: boolean;
  canal_sms: boolean;
  canal_push: boolean;
  canal_whatsapp: boolean;
}

export interface RelanceHistorique {
  id: number;
  eleve: string | null;
  classe: string | null;
  paiement_id: number;
  type: string | null;
  montant: number | null;
  jours_retard: number;
  canal: string;
  destinataire: string | null;
  statut: 'envoye' | 'echec';
  envoye_le: string;
}

export interface RelanceStats {
  total_impayes: number;
  montant_total: number;
  relances_30j: number;
  par_palier: {
    moins_7j: number;
    '7_a_15j': number;
    '15_a_30j': number;
    '30_a_60j': number;
    '60_a_90j': number;
    plus_90j: number;
  };
}

export const relanceService = {
  async getConfig(): Promise<RelanceConfig[]> {
    const res = await api.get('/admin/relances/config');
    return res.data.data ?? [];
  },

  async updateConfig(id: number, payload: Partial<RelanceConfig>): Promise<RelanceConfig> {
    const res = await api.put(`/admin/relances/config/${id}`, payload);
    return res.data.data;
  },

  async storeConfig(payload: Omit<RelanceConfig, 'id'>): Promise<RelanceConfig> {
    const res = await api.post('/admin/relances/config', payload);
    return res.data.data;
  },

  async destroyConfig(id: number): Promise<void> {
    await api.delete(`/admin/relances/config/${id}`);
  },

  async getHistorique(params?: { eleve_id?: number; canal?: string; statut?: string; page?: number }): Promise<{ data: RelanceHistorique[]; total: number; last_page: number }> {
    const res = await api.get('/admin/relances/historique', { params });
    return { data: res.data.data ?? [], total: res.data.total ?? 0, last_page: res.data.last_page ?? 1 };
  },

  async getStats(): Promise<RelanceStats> {
    const res = await api.get('/admin/relances/statistiques');
    return res.data;
  },

  async envoyerMaintenant(paiementId: number, joursRetard: number): Promise<{ message: string; envoyes: number }> {
    const res = await api.post('/admin/relances/envoyer-maintenant', {
      paiement_id: paiementId,
      jours_retard: joursRetard,
    });
    return res.data;
  },
};
