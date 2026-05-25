import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/evaluations',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/services/evaluation.service', () => ({
  evaluationService: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          employe: 'Kouassi Jean',
          employe_id: 10,
          evaluateur: 'Admin',
          periode: '2025-2026',
          note: 8.5,
          commentaire: 'Bon travail',
          statut: 'validee',
          annee: '2025-2026',
          date: '2025-10-01',
        },
      ],
      total: 1,
      last_page: 1,
    }),
    getTemplates: vi.fn().mockResolvedValue([
      { id: 1, nom: 'Grille standard', description: 'Modèle de base', criteres: [{ nom: 'Ponctualité', poids: 30 }] },
    ]),
    valider: vi.fn().mockResolvedValue({}),
  },
}));

import EvaluationsPage from '@/app/(app)/admin/evaluations/page';

describe('Admin Evaluations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le nom de l\'employé après chargement', async () => {
    render(<EvaluationsPage />);
    await waitFor(() => {
      expect(screen.getByText('Kouassi Jean')).toBeInTheDocument();
    });
  });

  it('affiche le badge de statut', async () => {
    render(<EvaluationsPage />);
    await waitFor(() => {
      expect(screen.getByText(/validee|Validée/i)).toBeInTheDocument();
    });
  });

  it('passe sur l\'onglet Templates et affiche le nom du template', async () => {
    const user = userEvent.setup();
    render(<EvaluationsPage />);
    await waitFor(() => screen.getByText('Kouassi Jean'));
    const templateTab = screen.getByRole('tab', { name: /templates/i });
    await user.click(templateTab);
    await waitFor(() => {
      expect(screen.getByText('Grille standard')).toBeInTheDocument();
    });
  });
});
