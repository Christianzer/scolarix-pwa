import api from './api';
import type { CoursResume, CoursDetail, ElearningMeta } from '@/types/elearning';

/** React Native FormData accepte { uri, name, type } — cast intentionnel (même pattern que devoirs) */
type RNFile = { uri: string; name: string; type: string };

export const elearningService = {
  async getCours(params?: { page?: number; classe_id?: number; matiere_id?: number }): Promise<{
    data: CoursResume[];
    meta: ElearningMeta;
  }> {
    const response = await api.get('/elearning', { params });
    return response.data;
  },

  async getCour(id: number): Promise<CoursDetail> {
    const response = await api.get(`/elearning/${id}`);
    return response.data;
  },

  async publierCours(payload: {
    titre: string;
    description?: string;
    contenu?: string;
    video_url?: string;
    matiere_id: number;
    classe_id?: number;
    fichier?: { uri: string; name: string; type: string };
  }): Promise<void> {
    const form = new FormData();
    form.append('titre', payload.titre);
    if (payload.description) form.append('description', payload.description);
    if (payload.contenu) form.append('contenu', payload.contenu);
    if (payload.video_url) form.append('video_url', payload.video_url);
    form.append('matiere_id', String(payload.matiere_id));
    if (payload.classe_id) form.append('classe_id', String(payload.classe_id));
    if (payload.fichier) {
      form.append('fichier', payload.fichier as unknown as Blob);
    }
    await api.post('/elearning', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async marquerComplete(id: number): Promise<void> {
    await api.post(`/elearning/${id}/complete`);
  },
};
