import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

const mockFetchPaiements = vi.fn();

vi.mock('@/stores/admin.store', () => ({
  useAdminStore: vi.fn((sel) => sel({
    paiements: [{
      id: 1, eleve: 'Koffi Paul', type: 'scolarite', montant: 50000,
      methode: 'especes', statut: 'valide', reference: 'REF001', periode: 'T1',
      date: '2026-05-01T10:00:00Z',
    }],
    paiementMeta: { total: 1, current_page: 1, last_page: 1, per_page: 20 },
    totalAujourdhui: 75000,
    isLoadingPaiements: false,
    fetchPaiements: mockFetchPaiements,
  })),
}));

import PaiementsPage from '@/app/(app)/admin/paiements/page';

describe('Admin Paiements', () => {
  it('affiche la liste des paiements', () => {
    render(<PaiementsPage />);
    expect(screen.getByText('Koffi Paul')).toBeDefined();
  });

  it('appelle fetchPaiements avec statut lors du clic filtre', () => {
    render(<PaiementsPage />);
    fireEvent.click(screen.getByText('Validés'));
    expect(mockFetchPaiements).toHaveBeenCalledWith(expect.objectContaining({ statut: 'valide' }));
  });
});
