import api from './api';
import type { NotificationApp } from '@/types/notifications';

export const notificationsService = {
  async getAll(): Promise<NotificationApp[]> {
    const res = await api.get('/notifications');
    return res.data.data ?? res.data;
  },

  async marquerLu(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/lire`);
  },

  async marquerToutLu(): Promise<void> {
    await api.post('/notifications/lire-tout');
  },
};
