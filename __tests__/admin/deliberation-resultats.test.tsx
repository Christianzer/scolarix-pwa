import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useSearchParams: () => ({ get: (key: string) => (key === 'id' ? '1' : null) }),
  usePathname: () => '/admin/deliberation-resultats',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockDetail = {
  id: 1,
  classe_id: 5,
  classe: '3ème A',
  departement: null,
  periode: 'trimestre1',
  periode_label: 'Trimestre 1',
  statut: 'en_cours',
  validee_par: null,
  validee_le: null,
  resultats: [
    {
      id: 10, eleve_id: 100, matricule: 'E001', nom_complet: 'Koné Aminata',
      moyenne_generale: 14.5, rang: 1, mention: 'bien', mention_label: 'Bien',
      decision: null, decision_label: '—', commentaire: null,
    },
  ],
  stats: { nb_eleves: 32, moyenne_classe: 12.3, nb_admis: 25, nb_redoublants: 4 },
};

const { mockFetchById, mockValider, mockUpdateResultat, mockClearDetail } = vi.hoisted(() => ({
  mockFetchById: vi.fn(),
  mockValider: vi.fn().mockResolvedValue(undefined),
  mockUpdateResultat: vi.fn().mockResolvedValue(undefined),
  mockClearDetail: vi.fn(),
}));

vi.mock('@/stores/deliberation.store', () => ({
  useDeliberationStore: vi.fn((sel) =>
    sel({
      detail: mockDetail,
      isLoadingDetail: false,
      isValidating: false,
      fetchById: mockFetchById,
      valider: mockValider,
      updateResultat: mockUpdateResultat,
      clearDetail: mockClearDetail,
    }),
  ),
}));

import DeliberationResultatsPage from '@/app/(app)/admin/deliberation-resultats/page';

describe('Admin Délibération-résultats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche les stats de la délibération', async () => {
    render(<DeliberationResultatsPage />);
    await waitFor(() => {
      expect(screen.getByText('32')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  it('affiche le nom de l\'élève', async () => {
    render(<DeliberationResultatsPage />);
    await waitFor(() => {
      expect(screen.getByText('Koné Aminata')).toBeInTheDocument();
    });
  });

  it('affiche le bouton Valider quand statut est en_cours', async () => {
    render(<DeliberationResultatsPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /valider/i })).toBeInTheDocument();
    });
  });
});
