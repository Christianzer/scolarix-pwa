import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/services/pointage.service', () => ({
  default: {
    getAujourdhui: vi.fn().mockResolvedValue({ data: { pointage: null } }),
    getHistorique: vi.fn().mockResolvedValue({
      data: [{ id: 1, date: '2026-05-24', heure_arrivee: '08:00', heure_depart: null, statut: 'present', commentaire: null, duree_minutes: null, duree_formatee: '' }],
    }),
    pointer: vi.fn().mockResolvedValue({ data: { message: 'Arrivée enregistrée', pointage: { id: 2, date: '2026-05-24', heure_arrivee: '08:30', heure_depart: null, statut: 'present', commentaire: null, duree_minutes: null, duree_formatee: '' } } }),
  },
}));

import PointagePage from '@/app/(app)/enseignant/pointage/page';

describe('Enseignant Pointage', () => {
  it("affiche le bouton de pointage d'arrivée", async () => {
    render(<PointagePage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /pointer l'arrivée/i })).toBeInTheDocument(),
    );
  });

  it("affiche l'historique", async () => {
    render(<PointagePage />);
    await waitFor(() => expect(screen.getByText('2026-05-24')).toBeInTheDocument());
  });
});
