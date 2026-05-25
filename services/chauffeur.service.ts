import api from './api';
import type { Bus, EleveBusItem } from './transport.service';

export const chauffeurService = {
  async getBus(): Promise<Bus | null> {
    const res = await api.get('/transport/bus', { params: { actif: 1 } });
    const buses: Bus[] = Array.isArray(res.data) ? res.data : [];
    return buses[0] ?? null;
  },

  async getEleves(busId: number): Promise<EleveBusItem[]> {
    const res = await api.get(`/transport/bus/${busId}/eleves`);
    return res.data.eleves ?? [];
  },

  async pointerEleve(busId: number, eleveId: number, sens: 'montee' | 'descente'): Promise<void> {
    await api.post(`/transport/bus/${busId}/pointer`, { eleve_id: eleveId, sens });
  },
};
