export interface EleveAdmin {
  id: number;
  matricule: string;
  nom_complet: string;
  avatar_url: string | null;
  classe: string | null;
  classe_id: number | null;
  departement: string | null;
  actif: boolean;
}

export interface ParentAdmin {
  id: number;
  nom_complet: string;
  telephone: string | null;
  lien: string | null;
  contact_principal: boolean;
}

export interface EleveAdminDetail {
  id: number;
  user_id: number;
  matricule: string;
  nom_complet: string;
  email: string | null;
  telephone: string | null;
  avatar_url: string | null;
  classe: string | null;
  departement: string | null;
  actif: boolean;
  date_naissance: string | null;
  nb_absences: number;
  total_paiements: number;
  impayes_pending: number;
  parents: ParentAdmin[];
}

export interface PaiementAdmin {
  id: number;
  eleve: string | null;
  type: string;
  montant: number;
  methode: string;
  statut: string;
  reference: string | null;
  periode: string | null;
  date: string;
}

export interface PaginationMeta {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}
