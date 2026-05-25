export interface Devoir {
  id: number;
  matiere: string;
  titre: string;
  description: string | null;
  date_limite: string; // date formatée, ex: "15 mars 2026"
  date_limite_iso?: string; // format ISO YYYY-MM-DD pour calcul de date relative
  fait: boolean;
  contenu_soumis?: string | null;
  enseignant: string | null;
  classe: string | null;
}

export interface DevoirSoumission {
  id: number;
  eleve_id: number;
  nom_complet: string;
  matricule: string;
  contenu_soumis: string | null;
  soumis_le: string | null;
  fait: boolean;
}
