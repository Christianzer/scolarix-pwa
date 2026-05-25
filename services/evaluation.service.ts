import api from './api';

export type EvalStatut = 'brouillon' | 'soumise' | 'validee';

export interface CritereGrille {
  nom: string;
  poids: number;
  description?: string;
  note: number | null;
  commentaire?: string;
}

export interface Evaluation {
  id: number;
  employe: string | null;
  employe_id: number;
  evaluateur: string | null;
  periode: string;
  note: number | null;
  commentaire: string | null;
  statut: EvalStatut;
  annee: string | null;
  date: string;
  grille?: CritereGrille[];
}

export interface EvaluationTemplate {
  id: number;
  nom: string;
  description: string | null;
  criteres: Array<{ nom: string; poids: number; description?: string }>;
}

export const evaluationService = {
  // ── Admin ──────────────────────────────────────────────
  async getAll(params?: { statut?: string; employe_id?: number; periode?: string; page?: number }): Promise<{ data: Evaluation[]; total: number; last_page: number }> {
    const res = await api.get('/admin/evaluations', { params });
    return { data: res.data.data ?? [], total: res.data.total ?? 0, last_page: res.data.last_page ?? 1 };
  },

  async show(id: number): Promise<Evaluation> {
    const res = await api.get(`/evaluations/${id}`);
    return res.data.data;
  },

  async create(payload: {
    employe_id: number;
    periode: string;
    commentaire?: string;
    statut?: EvalStatut;
    grille?: CritereGrille[];
  }): Promise<Evaluation> {
    const res = await api.post('/admin/evaluations', payload);
    return res.data.data;
  },

  async update(id: number, payload: Partial<{
    periode: string;
    commentaire: string;
    statut: EvalStatut;
    grille: CritereGrille[];
  }>): Promise<Evaluation> {
    const res = await api.put(`/admin/evaluations/${id}`, payload);
    return res.data.data;
  },

  async valider(id: number): Promise<Evaluation> {
    const res = await api.patch(`/admin/evaluations/${id}/valider`);
    return res.data.data;
  },

  async destroy(id: number): Promise<void> {
    await api.delete(`/admin/evaluations/${id}`);
  },

  // ── Templates ──────────────────────────────────────────
  async getTemplates(): Promise<EvaluationTemplate[]> {
    const res = await api.get('/admin/evaluations/templates/liste');
    return res.data.data ?? [];
  },

  async createTemplate(payload: { nom: string; description?: string; criteres: Array<{ nom: string; poids: number; description?: string }> }): Promise<EvaluationTemplate> {
    const res = await api.post('/admin/evaluations/templates', payload);
    return res.data.data;
  },

  async updateTemplate(id: number, payload: Partial<EvaluationTemplate>): Promise<EvaluationTemplate> {
    const res = await api.put(`/admin/evaluations/templates/${id}`, payload);
    return res.data.data;
  },

  async destroyTemplate(id: number): Promise<void> {
    await api.delete(`/admin/evaluations/templates/${id}`);
  },

  // ── Employé (lecture propres évals) ───────────────────
  async getMesEvaluations(): Promise<Evaluation[]> {
    const res = await api.get('/evaluations/mes-evaluations');
    return res.data.evaluations ?? [];
  },
};
