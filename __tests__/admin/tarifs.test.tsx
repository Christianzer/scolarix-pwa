import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/tarifs',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/services/tarif.service', () => ({
  tarifService: {
    getScolarite: vi.fn().mockResolvedValue([
      { id: 1, classe_id: 5, classe_nom: '3ème A', statut_affectation: 'tous', versement_numero: 1, date_echeance: '2025-10-01', mois_label: 'Octobre', montant: 75000 },
    ]),
    getFraisAnnexes: vi.fn().mockResolvedValue({
      assurance_scolaire: 5000, carnet_correspondance: 1500, carte_acces: 2000,
      tablier: 3500, tenues_sport: 4000, total: 16000,
    }),
    createScolarite: vi.fn().mockResolvedValue({}),
    updateFraisAnnexes: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/services/admin.service', () => ({
  adminService: {
    getClasses: vi.fn().mockResolvedValue([
      { id: 5, nom: '3ème A', departement: null },
    ]),
  },
}));

import TarifsPage from '@/app/(app)/admin/tarifs/page';

describe('Admin Tarifs', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('affiche le tarif de scolarité', async () => {
    render(<TarifsPage />);
    await waitFor(() => {
      expect(screen.getByText('3ème A')).toBeInTheDocument();
    });
  });

  it('affiche le montant formaté', async () => {
    render(<TarifsPage />);
    await waitFor(() => {
      expect(screen.getByText(/75/)).toBeInTheDocument();
    });
  });

  it('affiche la section frais annexes', async () => {
    render(<TarifsPage />);
    await waitFor(() => {
      expect(screen.getByText(/frais annexes/i)).toBeInTheDocument();
    });
  });
});
