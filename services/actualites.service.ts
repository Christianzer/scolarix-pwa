import api from './api';

export interface Actualite {
  id: number;
  titre: string;
  contenu: string;
  image: string | null;
  type: 'info' | 'evenement' | 'urgent' | 'resultat';
  date_debut: string | null;
  date_fin: string | null;
  created_at: string;
}

const actualitesService = {
  getActives() {
    return api.get<{ data: Actualite[] }>('/actualites');
  },
};

export default actualitesService;
