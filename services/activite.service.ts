import api from './api';

export interface Activite {
  id: number;
  code: string;
  nom: string;
  montant_mensuel: number;
  actif: boolean;
  nb_inscrits?: number;
  date_inscription?: string;
}

export const activiteService = {
  async getAll(): Promise<Activite[]> {
    const res = await api.get('/activites');
    return res.data.data ?? [];
  },

  async getMesActivites(): Promise<Activite[]> {
    const res = await api.get('/activites/mes-activites');
    return res.data.data ?? [];
  },

  // eleveId optionnel — si omis, le backend utilise l'élève connecté
  async inscrire(activiteId: number, eleveId?: number): Promise<void> {
    await api.post(`/activites/${activiteId}/inscrire`, eleveId ? { eleve_id: eleveId } : {});
  },

  async desinscrire(activiteId: number, eleveId?: number): Promise<void> {
    await api.delete(`/activites/${activiteId}/desinscrire`, eleveId ? { data: { eleve_id: eleveId } } : undefined);
  },

  async create(payload: { nom: string; montant_mensuel: number; actif?: boolean }): Promise<Activite> {
    const res = await api.post('/admin/activites', payload);
    return res.data.data;
  },

  async update(id: number, payload: { nom: string; montant_mensuel: number; actif?: boolean }): Promise<Activite> {
    const res = await api.put(`/admin/activites/${id}`, payload);
    return res.data.data;
  },
};
