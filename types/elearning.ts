export interface CoursResume {
  id: number;
  titre: string;
  description: string | null;
  video_url: string | null;
  fichier_url: string | null;
  enseignant: string | null;
  matiere: string | null;
  classe: string | null;
  publie_le: string | null;
  completion_percentage: number;
  complete: boolean;
  complete_le: string | null;
}

export interface CoursDetail extends CoursResume {
  contenu: string | null;
}

export interface ElearningMeta {
  total: number;
  current_page: number;
  last_page: number;
}

export interface QuizOption {
  id: number;
  texte: string;
}

export interface QuizQuestion {
  id: number;
  texte: string;
  type: 'qcm' | 'vrai_faux' | 'texte_libre';
  points: number;
  options: QuizOption[];
}

export interface Quiz {
  id: number;
  titre: string;
  instructions: string | null;
  questions: QuizQuestion[];
}

export interface SoumissionQuiz {
  score: number;
  total_points: number;
  soumis_le: string;
}
