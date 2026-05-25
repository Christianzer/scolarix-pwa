import api from './api';
import type { AnneeScolaire } from '../types/annee-scolaire';

const anneeScolaireService = {
  async getActive(): Promise<AnneeScolaire> {
    const response = await api.get<AnneeScolaire>('/annee-scolaire/active');
    return response.data;
  },
};

export default anneeScolaireService;
