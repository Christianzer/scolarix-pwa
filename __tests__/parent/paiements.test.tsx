import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/stores/parent.store', () => ({
  useParentStore: vi.fn((sel) =>
    sel({
      paiements: [
        { id: 1, eleve: 'Coulibaly Marie', type: 'Scolarité', montant: 50000, methode: 'Mobile Money', statut: 'valide', reference: 'REF001', periode: 'Trimestre 1', date: '2026-01-15' },
        { id: 2, eleve: 'Coulibaly Marie', type: 'Cantine', montant: 15000, methode: 'Espèces', statut: 'en_attente', reference: null, periode: null, date: '2026-05-01' },
      ],
      totalPaye: 65000,
      isLoadingPaiements: false,
      fetchPaiements: vi.fn(),
    }),
  ),
}));

import ParentPaiementsPage from '@/app/(app)/parent/paiements/page';

describe('Parent Paiements', () => {
  it('affiche la liste des paiements', () => {
    render(<ParentPaiementsPage />);
    expect(screen.getByText('Scolarité')).toBeInTheDocument();
    expect(screen.getByText('Cantine')).toBeInTheDocument();
  });

  it('affiche le total payé formaté', () => {
    render(<ParentPaiementsPage />);
    expect(screen.getByText(/65 000|65000/)).toBeInTheDocument();
  });

  it('affiche le statut des paiements', () => {
    render(<ParentPaiementsPage />);
    expect(screen.getByText(/valid/i)).toBeInTheDocument();
    expect(screen.getByText(/attente/i)).toBeInTheDocument();
  });
});
