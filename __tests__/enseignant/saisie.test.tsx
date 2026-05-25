import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({ useSearchParams: () => ({ get: () => null }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockSaisir } = vi.hoisted(() => ({
  mockSaisir: vi.fn().mockResolvedValue(2),
}));

vi.mock('@/stores/enseignant.store', () => ({
  useEnseignantStore: vi.fn((sel) =>
    sel({
      classes: [{ id: 1, nom: '3ème A', departement: null, nb_eleves: 1, matieres: [{ id: 10, nom: 'Maths', coefficient: 4 }] }],
      elevesByClasse: { 1: [{ id: 10, matricule: 'E001', nom_complet: 'Koné Aminata', avatar_url: null }] },
      isLoadingEleves: false,
      isSaving: false,
      fetchElevesClasse: vi.fn(),
      saisirNotes: mockSaisir,
    }),
  ),
}));

import SaisieNotesPage from '@/app/(app)/enseignant/saisie/page';

describe('Enseignant Saisie notes', () => {
  it('affiche le sélecteur de classe', () => {
    render(<SaisieNotesPage />);
    expect(screen.getByRole('combobox', { name: /classe/i })).toBeInTheDocument();
  });

  it('affiche les filtres après sélection de classe', async () => {
    render(<SaisieNotesPage />);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /classe/i }), '1');
    expect(screen.getByRole('combobox', { name: /période/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /type/i })).toBeInTheDocument();
  });

  it('affiche les élèves avec champ de note', async () => {
    render(<SaisieNotesPage />);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /classe/i }), '1');
    await waitFor(() =>
      expect(screen.getByLabelText(/note de koné aminata/i)).toBeInTheDocument(),
    );
  });
});
