export interface Pointage {
  id: number;
  date: string;
  heure_arrivee: string | null;
  heure_depart: string | null;
  statut: 'present' | 'absent' | 'retard' | 'conge';
  commentaire: string | null;
  duree_minutes: number | null;
  duree_formatee: string;
}

export interface PointerResponse {
  message: string;
  action?: 'arrivee' | 'depart';
  pointage: Pointage;
}

export interface AujourdhuiResponse {
  pointage: Pointage | null;
}
