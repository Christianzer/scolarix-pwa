import api from './api';
import type { Devoir } from '@/types/devoirs';

export const devoirsService = {
  async getAll(): Promise<Devoir[]> {
    const res = await api.get('/devoirs');
    return res.data.data ?? res.data ?? [];
  },

  /** Soumet le devoir avec un contenu texte optionnel */
  async soumettre(id: number, contenu?: string): Promise<void> {
    await api.post(`/devoirs/${id}/fait`, contenu ? { contenu, contenu_type: 'texte' } : {});
  },

  /** Soumet le devoir avec une image ou un fichier */
  async soumettrePhoto(_id: number, _uri: string, _nom: string, _mime: string): Promise<void> {
    // On web, callers must pass a real File or Blob from <input type="file">
    // RN-style { uri, name, type } objects are not supported on web
    throw new Error('Photo upload requires a File object on web. Use <input type="file"> to get a File.');
  },
};
