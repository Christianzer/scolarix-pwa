import api from './api';

export interface SalleVisio {
  room: string;
  url: string;
  titre: string;
}

export const creerSalle = (
  titre: string,
  contexte?: 'cours' | 'rendez-vous' | 'reunion',
  contexteId?: number
): Promise<SalleVisio> =>
  api.post('/visio/creer', { titre, contexte, contexte_id: contexteId }).then(r => r.data);

export const rejoindre = async (url: string): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('Impossible d\'ouvrir le lien Jitsi.');
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};
