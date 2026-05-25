import api from './api';

export type MethodePaiement = 'mtn' | 'orange_money' | 'moov' | 'wave';
export type TypePaiement = 'scolarite' | 'cantine' | 'transport' | 'renforcement' | 'extra_scolaire' | 'autre';

export type InitierPaiementParams = {
  eleve_id: number;
  type: TypePaiement;
  montant: number;
  periode: string;
  methode: MethodePaiement;
  telephone: string;
};

export type InitierPaiementResult = {
  paiement_id: number;
  reference: string;
  montant: number;
  methode: MethodePaiement;
  operateur: string;
  expire_dans: string;
  message: string;
};

export type ConfirmerPaiementResult = {
  paiement_id: number;
  reference: string;
  statut: 'valide';
  montant: number;
  methode: string;
  message: string;
};

export type StatutPaiement = {
  paiement_id: number;
  reference: string;
  statut: 'en_attente' | 'valide' | 'echec' | 'rembourse';
  montant: number;
  methode: string;
  created_at: string;
};

export const paiementMobileService = {
  async initier(params: InitierPaiementParams): Promise<InitierPaiementResult> {
    const res = await api.post('/paiements/initier', params);
    return res.data;
  },

  async confirmer(paiementId: number, code: string): Promise<ConfirmerPaiementResult> {
    const res = await api.post(`/paiements/${paiementId}/confirmer`, { code });
    return res.data;
  },

  async getStatut(paiementId: number): Promise<StatutPaiement> {
    const res = await api.get(`/paiements/${paiementId}/statut`);
    return res.data;
  },
};
