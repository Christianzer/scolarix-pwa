import api from './api';

export interface OnboardingStep {
  id: string;
  titre: string;
  description: string;
  done: boolean;
  action: string;
  icone: string;
  valeur?: string;
}

export interface OnboardingProgress {
  percentage: number;
  completed_steps: number;
  total_steps: number;
  steps: OnboardingStep[];
  onboarding_done: boolean;
}

export interface DemoResult {
  message: string;
  eleves: number;
  classes: number;
  enseignants: number;
}

export const onboardingService = {
  async getProgress(): Promise<OnboardingProgress> {
    const res = await api.get('/onboarding/progress');
    return res.data;
  },

  async chargerDemoData(): Promise<DemoResult> {
    const res = await api.post('/admin/onboarding/demo-data');
    return res.data;
  },

  async marquerTermine(): Promise<void> {
    await api.post('/admin/onboarding/marquer-termine');
  },
};
