import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/salles',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/services/salle.service', () => ({
  salleService: {
    getAll: vi.fn().mockResolvedValue([
      { id: 1, nom: 'Salle A', type: 'Classe', capacite: 40, description: null, actif: true },
      { id: 2, nom: 'Labo Informatique', type: 'Laboratoire', capacite: 25, description: null, actif: false },
    ]),
    create: vi.fn().mockResolvedValue({ id: 3, nom: 'Salle B', type: null, capacite: null, description: null, actif: true }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

import SallesPage from '@/app/(app)/admin/salles/page';

describe('Admin Salles', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('affiche la liste des salles', async () => {
    render(<SallesPage />);
    await waitFor(() => {
      expect(screen.getByText('Salle A')).toBeInTheDocument();
      expect(screen.getByText('Labo Informatique')).toBeInTheDocument();
    });
  });

  it('affiche le bouton Ajouter salle', async () => {
    render(<SallesPage />);
    await waitFor(() => { expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument(); });
  });

  it('affiche le type et la capacité', async () => {
    render(<SallesPage />);
    await waitFor(() => {
      expect(screen.getByText(/classe/i)).toBeInTheDocument();
      expect(screen.getByText(/40/i)).toBeInTheDocument();
    });
  });
});
