import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockPointerEleve } = vi.hoisted(() => ({
  mockPointerEleve: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/chauffeur.service', () => ({
  chauffeurService: {
    getBus: vi.fn().mockResolvedValue({ id: 1, nom: 'Bus 01', capacite: 30, actif: true, arrets: [], eleves_count: 2 }),
    getEleves: vi.fn().mockResolvedValue([
      { eleve_id: 10, nom: 'Koné Aminata', matricule: 'E001', classe: '3ème A', arret: 'Mairie', sens: 'aller_retour', pointe_montee: false, pointe_descente: false },
      { eleve_id: 11, nom: 'Diallo Ibrahim', matricule: 'E002', classe: '4ème B', arret: 'Marché', sens: 'aller', pointe_montee: true, pointe_descente: false },
    ]),
    pointerEleve: mockPointerEleve,
  },
}));

import ChauffeurMonBusPage from '@/app/(app)/chauffeur/mon-bus/page';

describe('Chauffeur Mon Bus', () => {
  it('affiche le nom du bus et les élèves', async () => {
    render(<ChauffeurMonBusPage />);
    await waitFor(() => expect(screen.getByText('Bus 01')).toBeInTheDocument());
    expect(screen.getByText('Koné Aminata')).toBeInTheDocument();
    expect(screen.getByText('Diallo Ibrahim')).toBeInTheDocument();
  });

  it('affiche "Monté" pour les élèves déjà pointés', async () => {
    render(<ChauffeurMonBusPage />);
    await waitFor(() => expect(screen.getByText('Monté')).toBeInTheDocument());
  });

  it('appelle pointerEleve au clic sur le bouton Montée', async () => {
    render(<ChauffeurMonBusPage />);
    await waitFor(() => expect(screen.getByText('Koné Aminata')).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole('button', { name: /montée/i })[0]);
    await waitFor(() => expect(mockPointerEleve).toHaveBeenCalledWith(1, 10, 'montee'));
  });
});
