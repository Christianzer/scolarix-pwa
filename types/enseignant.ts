export interface MatiereEnseignant {
  id: number;
  nom: string;
  coefficient: number;
}

export interface ClasseEnseignant {
  id: number;
  nom: string;
  departement: string | null;
  nb_eleves: number;
  matieres: MatiereEnseignant[];
}

export interface EleveClasse {
  id: number;
  matricule: string;
  nom_complet: string;
  avatar_url: string | null;
}
