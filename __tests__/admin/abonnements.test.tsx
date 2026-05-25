import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/abonnements',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/services/abonnement-admin.service', () => ({
  abonnementAdminService: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        { id: 1, eleve_id: 10, eleve_nom: 'Koné Aminata', classe_nom: '3ème A', matricule: 'E001',
          type: 'cantine', libelle: 'Cantine complète', montant_mensuel: 15000,
          statut: 'actif', statut_label: 'Actif', date_debut: '2025-10-01', date_fin: '2026-07-31', notes: null },
        { id: 2, eleve_id: 11, eleve_nom: 'Traoré Ibrahima', classe_nom: '4ème B', matricule: 'E002',
          type: 'transport', libelle: 'Bus ligne 1', montant_mensuel: 10000,
          statut: 'suspendu', statut_label: 'Suspendu', date_debut: '2025-10-01', date_fin: null, notes: null },
      ],
      meta: { current_page: 1, last_page: 1, total: 2 },
    }),
    suspendre: vi.fn().mockResolvedValue({ id: 1, statut: 'suspendu', statut_label: 'Suspendu' }),
    reactiver: vi.fn().mockResolvedValue({ id: 2, statut: 'actif', statut_label: 'Actif' }),
    annuler: vi.fn().mockResolvedValue({ id: 1, statut: 'annule', statut_label: 'Annulé' }),
  },
}));

import AbonnementsPage from '@/app/(app)/admin/abonnements/page';

describe('Admin Abonnements', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('affiche la liste des abonnements', async () => {
    render(<AbonnementsPage />);
    await waitFor(() => {
      expect(screen.getByText('Koné Aminata')).toBeInTheDocument();
      expect(screen.getByText('Traoré Ibrahima')).toBeInTheDocument();
    });
  });

  it('affiche le type et le montant', async () => {
    render(<AbonnementsPage />);
    await waitFor(() => {
      expect(screen.getByText(/cantine/i)).toBeInTheDocument();
      expect(screen.getByText(/15/)).toBeInTheDocument();
    });
  });

  it('affiche le bouton Suspendre pour un abonnement actif', async () => {
    render(<AbonnementsPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /suspendre/i })).toBeInTheDocument();
    });
  });
});
