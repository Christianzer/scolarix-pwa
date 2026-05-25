import type { NoteMatiere, CoursJour, AbsenceEleve } from './eleve';

export interface Enfant {
  id: number;
  matricule: string;
  nom_complet: string;
  avatar_url: string | null;
  classe: string | null;
  departement: string | null;
  nb_absences: number;
  lien: string | null;
}

export interface EnfantDetail {
  id: number;
  nom_complet: string;
  matricule: string;
  classe: string | null;
  classe_id?: number;
  notes: NoteMatiere[];
  absences: AbsenceEleve[];
  cours: CoursJour[];
}

export interface Paiement {
  id: number;
  eleve: string | null;
  type: string;
  montant: number;
  methode: string;
  statut: 'en_attente' | 'valide' | 'echec' | 'rembourse';
  reference: string | null;
  periode: string | null;
  date: string;
}
