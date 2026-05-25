export type StatutPresence = 'present' | 'absent' | 'retard';

export interface EleveAppel {
  eleve_id: number;
  nom_complet: string;
  matricule: string;
  statut: StatutPresence;
}
