import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockJustifier } = vi.hoisted(() => ({
  mockJustifier: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 1, nom_complet: 'Coulibaly Jean', prenom: 'Jean' } }),
  ),
}));
vi.mock('@/stores/parent.store', () => ({
  useParentStore: vi.fn((sel) =>
    sel({
      enfants: [{ id: 1, nom_complet: 'Coulibaly Marie', matricule: 'E001', avatar_url: null, classe: '3ème A', departement: null, nb_absences: 2, lien: 'Père' }],
      enfantSelectionne: {
        id: 1, nom_complet: 'Coulibaly Marie', matricule: 'E001', classe: '3ème A',
        notes: [{ matiere_id: 1, matiere: 'Maths', coefficient: 3, periodes: [{ periode: 'trimestre1', notes: [], moyenne: 13.5 }] }],
        absences: [{ id: 10, date: '2026-05-10', type: 'absence', justifiee: false, justification: null, matiere: 'Français' }],
        cours: [],
      },
      isLoadingEnfants: false,
      isLoadingDetail: false,
      isJustifiant: false,
      fetchEnfants: vi.fn(),
      fetchEnfantDetail: vi.fn(),
      justifierAbsence: mockJustifier,
      deselectionnerEnfant: vi.fn(),
    }),
  ),
}));

import ParentAccueilPage from '@/app/(app)/parent/accueil/page';
import ParentEnfantDetailPage from '@/app/(app)/parent/enfant/[id]/page';

describe('Parent Accueil & Enfant Detail', () => {
  it('affiche la liste des enfants', () => {
    render(<ParentAccueilPage />);
    expect(screen.getByText('Coulibaly Marie')).toBeInTheDocument();
  });

  it('affiche les notes de l\'enfant', async () => {
    render(<ParentEnfantDetailPage />);
    await waitFor(() => expect(screen.getByText('Maths')).toBeInTheDocument());
    expect(screen.getByText(/13\.5/)).toBeInTheDocument();
  });

  it('justifie une absence', async () => {
    render(<ParentEnfantDetailPage />);
    // Switch to absences tab
    fireEvent.click(screen.getByRole('button', { name: /absences/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /justifier/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /justifier/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() => expect(mockJustifier).toHaveBeenCalledWith(10, ''));
  });
});
