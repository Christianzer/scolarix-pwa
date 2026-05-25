import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn() }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockCreer, mockGetSoumissions } = vi.hoisted(() => ({
  mockCreer: vi.fn().mockResolvedValue(undefined),
  mockGetSoumissions: vi.fn().mockResolvedValue([
    { id: 1, eleve_id: 10, nom_complet: 'Koné Aminata', matricule: 'E001', contenu_soumis: 'Ma réponse', soumis_le: '2026-05-20', fait: true },
  ]),
}));

vi.mock('@/services/enseignant.service', () => ({
  enseignantService: { creerDevoir: mockCreer, getSoumissions: mockGetSoumissions },
}));
vi.mock('@/services/devoirs.service', () => ({
  devoirsService: {
    getAll: vi.fn().mockResolvedValue([
      { id: 1, matiere: 'Maths', titre: 'DM Pythagore', description: null, date_limite: '20 mai 2026', fait: false, enseignant: null, classe: null },
    ]),
  },
}));
vi.mock('@/stores/enseignant.store', () => ({
  useEnseignantStore: vi.fn((sel) =>
    sel({
      classes: [{ id: 1, nom: '3ème A', departement: null, nb_eleves: 1, matieres: [{ id: 10, nom: 'Maths', coefficient: 4 }] }],
    }),
  ),
}));

import CreerDevoirPage from '@/app/(app)/enseignant/creer-devoir/page';
import DevoirSoumissionsPage from '@/app/(app)/enseignant/devoir-soumissions/page';

describe('Enseignant Devoirs', () => {
  it('affiche le formulaire de création', () => {
    render(<CreerDevoirPage />);
    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date limite/i)).toBeInTheDocument();
  });

  it('affiche les soumissions après sélection du devoir', async () => {
    render(<DevoirSoumissionsPage />);
    await waitFor(() => expect(screen.getByText(/DM Pythagore/i)).toBeInTheDocument());
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /devoir/i }), '1');
    await waitFor(() => expect(screen.getByText('Koné Aminata')).toBeInTheDocument());
  });

  it('appelle getSoumissions avec l\'id du devoir', async () => {
    render(<DevoirSoumissionsPage />);
    await waitFor(() => screen.getByText(/DM Pythagore/i));
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /devoir/i }), '1');
    await waitFor(() => expect(mockGetSoumissions).toHaveBeenCalledWith(1));
  });
});
