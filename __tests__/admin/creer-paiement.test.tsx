import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/creer-paiement',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockFetchEleves } = vi.hoisted(() => ({
  mockFetchEleves: vi.fn(),
}));

vi.mock('@/stores/admin.store', () => ({
  useAdminStore: vi.fn((sel) =>
    sel({
      eleves: [
        { id: 1, matricule: 'E001', nom_complet: 'Koné Aminata', classe: '3ème A', classe_id: 5, actif: true, avatar_url: null, departement: null },
      ],
      isLoadingEleves: false,
      fetchEleves: mockFetchEleves,
    }),
  ),
}));

vi.mock('@/services/admin.service', () => ({
  adminService: {
    creerPaiement: vi.fn().mockResolvedValue({ id: 99, reference: 'PAY-99' }),
  },
}));

import CreerPaiementPage from '@/app/(app)/admin/creer-paiement/page';

describe('Admin Créer paiement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('affiche le champ de recherche d\'élève', () => {
    render(<CreerPaiementPage />);
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
  });

  it('appelle fetchEleves après debounce de 300ms', async () => {
    vi.useRealTimers();
    const { fireEvent } = await import('@testing-library/react');
    render(<CreerPaiementPage />);
    const input = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(input, { target: { value: 'Koné' } });
    await waitFor(() => {
      expect(mockFetchEleves).toHaveBeenCalledWith({ search: 'Koné', page: 1 });
    }, { timeout: 1000 });
  }, 3000);

  it('affiche les chips de type de paiement', () => {
    render(<CreerPaiementPage />);
    expect(screen.getByRole('button', { name: /scolarité/i })).toBeInTheDocument();
  });
});
