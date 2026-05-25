import api from './api';
import type { EleveAdmin, EleveAdminDetail, PaiementAdmin, PaginationMeta } from '@/types/admin';

export const adminService = {
  async getEleves(params?: {
    page?: number;
    search?: string;
    classe_id?: number;
  }): Promise<{ data: EleveAdmin[]; meta: PaginationMeta }> {
    const res = await api.get('/admin/eleves', { params });
    return res.data;
  },

  async getEleveDetail(id: number): Promise<EleveAdminDetail> {
    const res = await api.get(`/admin/eleves/${id}`);
    return res.data.data;
  },

  async getPaiements(params?: {
    page?: number;
    type?: string;
    statut?: string;
    search?: string;
  }): Promise<{ data: PaiementAdmin[]; meta: PaginationMeta; stats: { total_aujourd_hui: number } }> {
    const res = await api.get('/admin/paiements', { params });
    return res.data;
  },

  async creerPaiement(payload: {
    eleve_id: number;
    type: string;
    montant: number;
    methode: string;
    statut: string;
    periode?: string;
    reference?: string;
  }): Promise<{ id: number; reference: string }> {
    const res = await api.post('/admin/paiements', payload);
    return res.data.data;
  },

  async getPointagesAujourdhui(): Promise<{
    data: Array<{
      id: number; user_id: number; nom_complet: string; role: string;
      avatar_url: string | null; heure_arrivee: string | null;
      heure_depart: string | null; statut: string; duree_formatee: string | null;
    }>;
    stats: { presents: number; retards: number; absents: number; total_staff: number };
  }> {
    const res = await api.get('/admin/pointages/aujourd-hui');
    return res.data;
  },

  async envoyerNotification(payload: {
    titre: string;
    corps: string;
    type: 'info' | 'alerte' | 'rappel' | 'evenement';
    cible: 'tous' | 'eleves' | 'parents' | 'enseignants' | 'classe';
    classe_id?: number;
  }): Promise<{ message: string; destinataires: number }> {
    const res = await api.post('/admin/notifications/envoyer', payload);
    return res.data;
  },

  async getMembres(params?: { page?: number; search?: string; role?: string }): Promise<{
    data: Array<{
      id: number; nom_complet: string; email: string; telephone: string | null;
      role: string; actif: boolean; avatar_url: string | null;
    }>;
    meta: { total: number; current_page: number; last_page: number };
  }> {
    const res = await api.get('/admin/membres', { params });
    return res.data;
  },

  async getMembreDetail(id: number): Promise<{
    id: number; nom_complet: string; email: string; telephone: string | null;
    role: string; actif: boolean; avatar_url: string | null;
    nb_pointages_mois: number;
    dernier_pointage: { date: string; statut: string; heure_arrivee: string | null; heure_depart: string | null } | null;
  }> {
    const res = await api.get(`/admin/membres/${id}`);
    return res.data.data;
  },

  async getClasses(): Promise<Array<{ id: number; nom: string; departement: string | null }>> {
    const res = await api.get('/admin/classes');
    return res.data.data ?? [];
  },
};
