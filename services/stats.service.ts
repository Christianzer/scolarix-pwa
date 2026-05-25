import api from './api';

export type TendanceType = 'hausse' | 'baisse' | 'stable' | null;

export type MoyennesPeriodes = {
  trimestre1: number | null;
  trimestre2: number | null;
  trimestre3: number | null;
};

export type MatiereStats = {
  matiere: string;
  matiere_id: number;
  coefficient: number;
  moyennes: MoyennesPeriodes;
  tendance: TendanceType;
};

export type StatsClasse = {
  classe_id: number;
  classe: string;
  nb_eleves: number;
  moyenne_classe: MoyennesPeriodes;
  taux_reussite: number | null;
  taux_presence: number | null;
};

export type StatsEleve = {
  type: 'eleve';
  matieres: MatiereStats[];
  moyenne_generale: MoyennesPeriodes;
  absences: number;
  devoirs_rendus: number;
  devoirs_total: number;
};

export type StatsEnseignant = {
  type: 'enseignant';
  classes: StatsClasse[];
};

export type StatsAdmin = {
  type: 'admin';
  nb_eleves: number;
  nb_enseignants: number;
  taux_presence_moyen: number | null;
  classes: StatsClasse[];
};

export type Stats = StatsEleve | StatsEnseignant | StatsAdmin;

export type AnneeScolaireOption = { id: number; libelle: string; active: boolean };

export const statsService = {
  async getStats(anneeId?: number): Promise<Stats> {
    const params = anneeId ? { annee_scolaire_id: anneeId } : {};
    const res = await api.get('/stats', { params });
    return res.data;
  },

  async getAnnees(): Promise<AnneeScolaireOption[]> {
    const res = await api.get('/annees-scolaires');
    return res.data.data ?? [];
  },
};
