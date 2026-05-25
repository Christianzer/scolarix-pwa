import api from './api';

export interface CantineMenu {
  id: number;
  date: string;
  type_repas: 'dejeuner' | 'gouter';
  plat_principal: string;
  accompagnement?: string;
  dessert?: string;
  prix: number;
}

export interface CantineSolde {
  eleve_id: number;
  nom: string;
  solde: number;
}

export interface CantineTransaction {
  id: number;
  montant: number;
  type: 'recharge' | 'repas' | 'remboursement';
  date: string;
  note?: string;
}

export interface CantineStats {
  inscrits: number;
  solde_moyen: number;
  soldes_faibles: number;
  repas_aujourd_hui: number;
  recettes_7j: number;
}

export const getMenus = (params?: { date?: string; date_debut?: string; date_fin?: string }): Promise<CantineMenu[]> =>
  api.get('/cantine/menus', { params }).then(r => r.data);

export const getSolde = (eleveId: number): Promise<CantineSolde> =>
  api.get(`/cantine/solde/${eleveId}`).then(r => r.data);

export const getHistorique = (eleveId: number): Promise<{ data: CantineTransaction[] }> =>
  api.get(`/cantine/historique/${eleveId}`).then(r => r.data);

export const getStats = (): Promise<CantineStats> =>
  api.get('/admin/cantine/statistiques').then(r => r.data);

export const getTousSoldes = (page = 1): Promise<{ data: any[]; total: number }> =>
  api.get('/admin/cantine/soldes', { params: { page } }).then(r => r.data);

export const recharger = (eleveId: number, montant: number, note?: string): Promise<{ nouveau_solde: number }> =>
  api.post(`/admin/cantine/recharger/${eleveId}`, { montant, note }).then(r => r.data);

export const consommer = (eleveId: number, date?: string, typeRepas?: string): Promise<{ nouveau_solde: number; montant: number }> =>
  api.post(`/admin/cantine/consommer/${eleveId}`, { date, type_repas: typeRepas }).then(r => r.data);

export const inscrire = (eleveIds: number[]): Promise<void> =>
  api.post('/admin/cantine/inscrire', { eleve_ids: eleveIds });
