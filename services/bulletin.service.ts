import api from './api';

export type Periode = 'trimestre1' | 'trimestre2' | 'trimestre3';

export interface PublicationResult {
  message: string;
  verification_token: string;
  hash: string;
}

export const bulletinService = {
  /** Pour l'élève connecté (auto-résolution côté serveur) */
  async getMeSignedLink(periode: Periode): Promise<string> {
    const res = await api.get<{ url: string }>('/bulletin/me/link', { params: { periode } });
    return res.data.url;
  },

  /** Pour un élève donné (parent/admin) */
  async getSignedLink(eleveId: number, periode: Periode): Promise<string> {
    const res = await api.get<{ url: string }>(`/bulletin/${eleveId}/link`, { params: { periode } });
    return res.data.url;
  },

  /** Publication officielle d'un bulletin (admin) — génère, archive, notifie les parents */
  async publier(eleveId: number, periode: Periode): Promise<PublicationResult> {
    const res = await api.post<PublicationResult>(`/admin/bulletins/${eleveId}/publier`, { periode });
    return res.data;
  },
};
