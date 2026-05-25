import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/cantine',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/services/cantine.service', () => ({
  getStats: vi.fn().mockResolvedValue({
    inscrits: 120, solde_moyen: 15000, soldes_faibles: 8, repas_aujourd_hui: 95, recettes_7j: 285000,
  }),
  getTousSoldes: vi.fn().mockResolvedValue({
    data: [
      { eleve_id: 1, nom: 'Koné Aminata', solde: 25000 },
      { eleve_id: 2, nom: 'Traoré Ibrahima', solde: 2000 },
    ],
    total: 2,
  }),
  recharger: vi.fn().mockResolvedValue({ nouveau_solde: 30000 }),
}));

import CantinePage from '@/app/(app)/admin/cantine/page';

describe('Admin Cantine', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('affiche le nombre d\'inscrits', async () => {
    render(<CantinePage />);
    await waitFor(() => { expect(screen.getByText('120')).toBeInTheDocument(); });
  });

  it('affiche la liste des soldes élèves', async () => {
    render(<CantinePage />);
    await waitFor(() => {
      expect(screen.getByText('Koné Aminata')).toBeInTheDocument();
      expect(screen.getByText('Traoré Ibrahima')).toBeInTheDocument();
    });
  });

  it('affiche le bouton de recharge', async () => {
    render(<CantinePage />);
    await waitFor(() => {
      const btns = screen.getAllByRole('button', { name: /recharger/i });
      expect(btns.length).toBeGreaterThan(0);
    });
  });
});
