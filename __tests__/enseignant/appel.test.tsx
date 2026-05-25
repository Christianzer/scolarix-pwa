import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockSauvegarder } = vi.hoisted(() => ({
  mockSauvegarder: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/absences.service', () => ({
  absencesService: {
    getAppelDuJour: vi.fn().mockResolvedValue([]),
    sauvegarderAppel: mockSauvegarder,
  },
}));
vi.mock('@/stores/enseignant.store', () => ({
  useEnseignantStore: vi.fn((sel) =>
    sel({
      classes: [{ id: 1, nom: '3ème A', departement: null, nb_eleves: 1, matieres: [] }],
      elevesByClasse: { 1: [{ id: 10, matricule: 'E001', nom_complet: 'Koné Aminata', avatar_url: null }] },
      fetchElevesClasse: vi.fn().mockResolvedValue(undefined),
    }),
  ),
}));

import AppelPage from '@/app/(app)/enseignant/appel/page';

describe('Enseignant Appel', () => {
  it('affiche le sélecteur de classe', () => {
    render(<AppelPage />);
    expect(screen.getByRole('combobox', { name: /classe/i })).toBeInTheDocument();
  });

  it('affiche les élèves après sélection de classe', async () => {
    render(<AppelPage />);
    fireEvent.change(screen.getByRole('combobox', { name: /classe/i }), { target: { value: '1' } });
    await waitFor(() => { expect(screen.getByText('Koné Aminata')).toBeInTheDocument(); });
  });

  it('soumet l\'appel', async () => {
    render(<AppelPage />);
    fireEvent.change(screen.getByRole('combobox', { name: /classe/i }), { target: { value: '1' } });
    await waitFor(() => expect(screen.getByText('Koné Aminata')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));
    await waitFor(() => expect(mockSauvegarder).toHaveBeenCalled());
  });
});
