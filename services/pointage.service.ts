import api from './api';
import type { AujourdhuiResponse, Pointage, PointerResponse } from '../types/pointage';

const pointageService = {
  pointer(latitude: number, longitude: number) {
    return api.post<PointerResponse>('/pointages/pointer', { latitude, longitude });
  },

  getHistorique() {
    return api.get<Pointage[]>('/pointages/mon-historique');
  },

  getAujourdhui() {
    return api.get<AujourdhuiResponse>('/pointages/aujourd-hui');
  },
};

export default pointageService;
