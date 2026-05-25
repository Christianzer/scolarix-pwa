import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockPointer } = vi.hoisted(() => ({
  mockPointer: vi.fn().mockResolvedValue({ action: 'arrivee', message: 'Arrivée enregistrée' }),
}));

vi.mock('@/stores/pointage.store', () => ({
  usePointageStore: vi.fn((sel) =>
    sel({
      pointageJour: null,
      historique: [
        { id: 1, date: '2026-05-25', heure_arrivee: '07:30', heure_depart: '16:00', statut: 'present', commentaire: null, duree_minutes: 510, duree_formatee: '8h30' },
      ],
      isLoading: false,
      fetchAujourdhui: vi.fn(),
      fetchHistorique: vi.fn(),
      pointer: mockPointer,
    }),
  ),
}));

Object.defineProperty(globalThis, 'navigator', {
  value: { geolocation: { getCurrentPosition: vi.fn((success) => success({ coords: { latitude: 5.35, longitude: -4.01 } })) } },
  writable: true,
});

import ChauffeurPointagePage from '@/app/(app)/chauffeur/pointage/page';

describe('Chauffeur Pointage', () => {
  it("affiche le bouton Pointer l'arrivée quand pas encore pointé", () => {
    render(<ChauffeurPointagePage />);
    expect(screen.getByRole('button', { name: /pointer l'arrivée/i })).toBeInTheDocument();
  });

  it("affiche l'historique des pointages", () => {
    render(<ChauffeurPointagePage />);
    expect(screen.getByText(/07:30/)).toBeInTheDocument();
  });

  it('appelle pointer() au clic', async () => {
    render(<ChauffeurPointagePage />);
    fireEvent.click(screen.getByRole('button', { name: /pointer l'arrivée/i }));
    await waitFor(() => expect(mockPointer).toHaveBeenCalled());
  });
});
