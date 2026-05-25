export type Periode = 'trimestre1' | 'trimestre2' | 'trimestre3';
export type StatutDeliberation = 'en_cours' | 'validee';
export type Mention = 'excellent' | 'tres_bien' | 'bien' | 'assez_bien' | 'passable' | 'insuffisant';
export type Decision = 'admis' | 'redoublant' | 'passage_conditionnel' | 'exclu';

export interface DeliberationResultat {
  id: number;
  eleve_id: number;
  matricule: string;
  nom_complet: string;
  moyenne_generale: number | null;
  rang: number | null;
  mention: Mention | null;
  mention_label: string;
  decision: Decision | null;
  decision_label: string;
  commentaire: string | null;
}

export interface DeliberationStats {
  nb_eleves: number;
  moyenne_classe: number | null;
  nb_admis: number;
  nb_redoublants: number;
}

export interface DeliberationDetail {
  id: number;
  classe_id: number;
  classe: string;
  departement: string | null;
  periode: Periode;
  periode_label: string;
  statut: StatutDeliberation;
  validee_par: string | null;
  validee_le: string | null;
  resultats: DeliberationResultat[];
  stats: DeliberationStats;
}

export interface Deliberation {
  id: number;
  classe_id: number;
  classe: string;
  departement: string | null;
  periode: Periode;
  periode_label: string;
  statut: StatutDeliberation;
  nb_eleves: number;
  validee_par: string | null;
  validee_le: string | null;
  created_at: string;
}
