import api from './api';

export type PolitiqueSection = {
  titre: string;
  contenu: string;
};

export type Politique = {
  titre: string;
  version: string;
  derniere_maj: string;
  responsable: string;
  contact_dpo: string;
  sections: PolitiqueSection[];
};

export const rgpdService = {
  async getPolitique(): Promise<Politique> {
    const res = await api.get('/rgpd/politique');
    return res.data;
  },

  async accepterConsentement(): Promise<{ message: string; consent_at: string }> {
    const res = await api.post('/rgpd/consent');
    return res.data;
  },

  async retirerConsentement(): Promise<void> {
    await api.delete('/rgpd/consent');
  },

  async exporterMesDonnees(): Promise<object> {
    const res = await api.get('/rgpd/mes-donnees');
    return res.data;
  },
};
