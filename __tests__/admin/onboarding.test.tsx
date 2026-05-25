import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/onboarding',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockProgress } = vi.hoisted(() => ({
  mockProgress: {
    percentage: 40,
    completed_steps: 2,
    total_steps: 5,
    onboarding_done: false,
    steps: [
      { id: 'profil', titre: 'Configurer le profil', description: "Renseignez le profil de l'école", done: true, action: '/admin/profil', icone: 'school' },
      { id: 'tarifs', titre: 'Configurer les tarifs', description: 'Définissez les tarifs scolaires', done: true, action: '/admin/tarifs', icone: 'money' },
      { id: 'eleves', titre: 'Ajouter des élèves', description: 'Créez les profils élèves', done: false, action: '/admin/eleves', icone: 'users' },
    ],
  },
}));

vi.mock('@/services/onboarding.service', () => ({
  onboardingService: {
    getProgress: vi.fn().mockResolvedValue(mockProgress),
    chargerDemoData: vi.fn().mockResolvedValue({ message: 'OK', eleves: 30, classes: 3, enseignants: 5 }),
    marquerTermine: vi.fn().mockResolvedValue(undefined),
  },
}));

import OnboardingPage from '@/app/(app)/admin/onboarding/page';

describe('Admin Onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le pourcentage de progression', async () => {
    render(<OnboardingPage />);
    await waitFor(() => {
      expect(screen.getByText('40%')).toBeInTheDocument();
    });
  });

  it('affiche les étapes avec leur statut', async () => {
    render(<OnboardingPage />);
    await waitFor(() => {
      expect(screen.getByText('Configurer le profil')).toBeInTheDocument();
      expect(screen.getByText('Ajouter des élèves')).toBeInTheDocument();
    });
  });

  it('affiche le bouton Charger données de démo', async () => {
    render(<OnboardingPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /données de démo/i })).toBeInTheDocument();
    });
  });
});
