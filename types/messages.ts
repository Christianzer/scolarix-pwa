export interface Conversation {
  user_id: number;
  nom: string;
  avatar_url: string | null;
  dernier_message: string;
  dernier_at: string;
  non_lus: number;
}

export interface Message {
  id: number;
  contenu: string;
  type: 'texte' | 'image' | 'fichier';
  fichier_url: string | null;
  fichier_nom: string | null;
  envoyeur: boolean; // true = moi, false = l'autre
  lu: boolean;
  heure: string;
  full_date: string;
}
