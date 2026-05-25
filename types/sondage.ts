export interface SondageResume {
  id: number;
  titre: string;
  description: string | null;
  cible: string;
  nb_questions: number;
  expire_le: string | null;
  deja_repondu: boolean;
}

export interface OptionSondage {
  id: number;
  texte: string;
}

export interface QuestionSondage {
  id: number;
  texte: string;
  type: 'texte_libre' | 'choix_unique' | 'choix_multiple';
  options: OptionSondage[];
}

export interface SondageDetail {
  id: number;
  titre: string;
  description: string | null;
  expire_le: string | null;
  questions: QuestionSondage[];
}

export interface ReponseSondage {
  question_id: number;
  option_id?: number | null;
  texte_libre?: string | null;
}
