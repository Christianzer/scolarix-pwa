import api from './api';

export type CategorieReport =
  | 'abus'
  | 'harcelement'
  | 'depression'
  | 'plainte'
  | 'suggestion'
  | 'autre';

export interface ReportPayload {
  categorie: CategorieReport;
  message: string;
}

export const reportService = {
  async envoyer(payload: ReportPayload): Promise<void> {
    await api.post('/report-anonyme', payload);
  },
};
