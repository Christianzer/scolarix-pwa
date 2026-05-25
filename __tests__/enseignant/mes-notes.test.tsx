import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockGetNotes } = vi.hoisted(() => ({
  mockGetNotes: vi.fn().mockResolvedValue({ notes: [{ id: 1, eleve_id: 10, valeur: 15 }] }),
}));

vi.mock('@/services/enseignant.service', () => ({
  enseignantService: { getNotesClasse: mockGetNotes },
}));
vi.mock('@/stores/enseignant.store', () => ({
  useEnseignantStore: vi.fn((sel) =>
    sel({
      classes: [{ id: 1, nom: '3ème A', departement: null, nb_eleves: 1, matieres: [{ id: 10, nom: 'Maths', coefficient: 4 }] }],
      elevesByClasse: { 1: [{ id: 10, matricule: 'E001', nom_complet: 'Koné Aminata', avatar_url: null }] },
      fetchElevesClasse: vi.fn().mockResolvedValue(undefined),
    }),
  ),
}));

import MesNotesPage from '@/app/(app)/enseignant/mes-notes/page';

describe('Enseignant Mes notes', () => {
  it('affiche le sélecteur de classe', () => {
    render(<MesNotesPage />);
    expect(screen.getByRole('combobox', { name: /classe/i })).toBeInTheDocument();
  });

  it('affiche les notes après recherche', async () => {
    render(<MesNotesPage />);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /classe/i }), '1');
    await userEvent.click(screen.getByRole('button', { name: /afficher les notes/i }));
    await waitFor(() => expect(screen.getByText('Koné Aminata')).toBeInTheDocument());
    expect(screen.getByText('15')).toBeInTheDocument();
  });
});
