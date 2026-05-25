export interface User {
  id: number;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  telephone: string | null;
  telephone_whatsapp: string | null;
  role: 'eleve' | 'parent' | 'enseignant' | 'administration' | 'admin1' | 'super_admin' | 'chauffeur';
  role_label: string;
  actif: boolean;
  avatar_url: string | null;
  email_verified_at: string | null;
}
