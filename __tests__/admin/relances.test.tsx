import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/relances',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/services/relance.service', () => ({
  relanceService: {
    getStats: vi.fn().mockResolvedValue({
      total_impayes: 15, montant_total: 1250000, relances_30j: 42,
      par_palier: { moins_7j: 5, '7_a_15j': 4, '15_a_30j': 3, '30_a_60j': 2, '60_a_90j': 1, plus_90j: 0 },
    }),
    getHistorique: vi.fn().mockResolvedValue({
      data: [
        { id: 1, eleve: 'Koné Aminata', classe: '3ème A', paiement_id: 10, type: 'scolarite',
          montant: 75000, jours_retard: 12, canal: 'sms', destinataire: '+225 07 07', statut: 'envoye', envoye_le: '2025-11-01' },
      ],
      total: 1, last_page: 1,
    }),
    getConfig: vi.fn().mockResolvedValue([
      { id: 1, jours_retard: 7, actif: true, canal_email: true, canal_sms: false, canal_push: true, canal_whatsapp: false },
    ]),
    updateConfig: vi.fn().mockResolvedValue({}),
  },
}));

import RelancesPage from '@/app/(app)/admin/relances/page';

describe('Admin Relances', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('affiche le total des impayés', async () => {
    render(<RelancesPage />);
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  it("affiche une relance dans l'historique", async () => {
    render(<RelancesPage />);
    await waitFor(() => {
      expect(screen.getByText('Koné Aminata')).toBeInTheDocument();
    });
  });

  it('affiche l\'onglet Configuration', async () => {
    render(<RelancesPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /configuration/i })).toBeInTheDocument();
    });
  });
});
