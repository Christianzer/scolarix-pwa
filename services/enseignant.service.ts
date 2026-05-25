import api from './api';
import type { ClasseEnseignant, EleveClasse } from '@/types/enseignant';

export const enseignantService = {
  async getClasses(): Promise<ClasseEnseignant[]> {
    const res = await api.get('/enseignant/classes');
    return res.data.data ?? [];
  },

  async getElevesClasse(classeId: number): Promise<{ data: EleveClasse[]; classe: string }> {
    const res = await api.get(`/enseignant/classes/${classeId}/eleves`);
    return res.data;
  },

  async saisirNote(payload: {
    eleve_id: number;
    matiere_id: number;
    valeur: number;
    bareme?: number;
    periode: string;
    type: string;
    commentaire?: string;
  }): Promise<void> {
    await api.post('/enseignant/notes', payload);
  },

  async saisirNotesBulk(payload: {
    matiere_id: number;
    periode: string;
    type: string;
    bareme?: number;
    notes: { eleve_id: number; valeur: number; commentaire?: string }[];
  }): Promise<number> {
    const res = await api.post('/enseignant/notes/bulk', payload);
    return res.data.count ?? 0;
  },

  async creerDevoir(payload: {
    titre: string;
    description?: string;
    matiere_id: number;
    classe_id: number;
    date_limite: string;
  }): Promise<void> {
    await api.post('/devoirs', payload);
  },

  async publierCours(payload: {
    titre: string;
    description?: string;
    contenu?: string;
    video_url?: string;
    matiere_id: number;
    classe_id?: number;
  }): Promise<void> {
    await api.post('/elearning', payload);
  },

  async getNotesClasse(classeId: number, params: { matiere_id: number; periode: string }): Promise<{ notes: { id: number; eleve_id: number; valeur: number }[] }> {
    const res = await api.get(`/enseignant/classes/${classeId}/notes`, { params });
    return res.data;
  },

  async updateNote(noteId: number, payload: { valeur: number; bareme: number; periode: string; type: string; matiere_id: number }): Promise<void> {
    await api.put(`/enseignant/notes/${noteId}`, payload);
  },

  async getSoumissions(devoirId: number): Promise<import('@/types/devoirs').DevoirSoumission[]> {
    const res = await api.get(`/devoirs/${devoirId}/soumissions`);
    return res.data.data ?? res.data ?? [];
  },
};
