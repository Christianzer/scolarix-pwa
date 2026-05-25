import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/rendez-vous',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockFetchAll } = vi.hoisted(() => ({ mockFetchAll: vi.fn() }));

vi.mock('@/stores/rdv.store', () => ({
  useRdvStore: vi.fn((sel) => sel({
    items: [
      {
        id: 1, statut: 'en_attente', statut_label: 'En attente',
        motif: 'Discussion résultats', note: null,
        date_proposee: null, heure: null, lieu: null, created_at: '2025-11-01',
        demandeur: { id: 10, nom: 'Koné', prenom: 'Aminata', role: 'parent' },
        destinataire: { id: 5, nom: 'Admin', prenom: 'School', role: 'admin1' },
      },
      {
        id: 2, statut: 'confirme', statut_label: 'Confirmé',
        motif: 'Bilan scolaire', note: null,
        date_proposee: '2025-11-15', heure: '10:00', lieu: 'Bureau direc.', created_at: '2025-11-02',
        demandeur: { id: 11, nom: 'Traoré', prenom: 'Ibrahima', role: 'parent' },
        destinataire: { id: 5, nom: 'Admin', prenom: 'School', role: 'admin1' },
      },
    ],
    isLoading: false,
    isActing: false,
    fetchAll: mockFetchAll,
    confirmer: vi.fn(), annuler: vi.fn(), reporter: vi.fn(),
  })),
}));

import RendezVousPage from '@/app/(app)/admin/rendez-vous/page';

describe('Admin Rendez-vous', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('affiche la liste des RDV', async () => {
    render(<RendezVousPage />);
    await waitFor(() => {
      expect(screen.getByText(/Discussion résultats/)).toBeInTheDocument();
      expect(screen.getByText(/Bilan scolaire/)).toBeInTheDocument();
    });
  });

  it('affiche le nom du demandeur', async () => {
    render(<RendezVousPage />);
    await waitFor(() => {
      expect(screen.getByText(/Koné Aminata/i)).toBeInTheDocument();
    });
  });

  it('affiche les boutons Confirmer et Annuler pour un RDV en_attente', async () => {
    render(<RendezVousPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
    });
  });
});
