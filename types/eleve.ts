export interface NoteDetail {
  id: number;
  valeur: number;
  bareme: number;
  type: string;
  commentaire: string | null;
}

export interface PeriodeNotes {
  periode: 'trimestre1' | 'trimestre2' | 'trimestre3';
  notes: NoteDetail[];
  moyenne: number | null;
}

export interface NoteMatiere {
  matiere_id: number;
  matiere: string;
  coefficient: number;
  periodes: PeriodeNotes[];
}

export interface CoursJour {
  id: number;
  jour: string;
  heure_debut: string;
  heure_fin: string;
  salle: string | null;
  matiere: string;
  enseignant: string | null;
}

export interface AbsenceEleve {
  id: number;
  date: string;
  type: 'absence' | 'retard';
  justifiee: boolean;
  justification: string | null;
  matiere: string | null;
}
