export type StatutRdv = 'en_attente' | 'confirme' | 'reporte' | 'annule' | 'effectue';

export interface RdvUser {
  id: number;
  nom: string;
  prenom: string;
  role?: string;
}

export interface RendezVous {
  id: number;
  statut: StatutRdv;
  statut_label: string;
  motif: string;
  note: string | null;
  date_proposee: string | null;
  heure: string | null;
  lieu: string | null;
  created_at: string;
  demandeur: RdvUser | null;
  destinataire: RdvUser | null;
}

export interface RendezVousMeta {
  current_page: number;
  last_page: number;
  total: number;
}
