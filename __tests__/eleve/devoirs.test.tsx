import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockSoumettre } = vi.hoisted(() => ({
  mockSoumettre: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/stores/devoirs.store', () => ({
  useDevoirsStore: vi.fn((sel) =>
    sel({
      devoirs: [
        { id: 1, matiere: 'Maths', titre: 'Exercice algèbre', description: 'Faire les exercices 1 à 5', date_limite: '15 juin 2026', fait: false, enseignant: 'M. Bamba', classe: '3ème A' },
        { id: 2, matiere: 'SVT', titre: 'Rapport de labo', description: null, date_limite: '20 juin 2026', fait: true, enseignant: null, classe: null },
      ],
      isLoading: false,
      isSoumettant: false,
      fetchDevoirs: vi.fn(),
      soumettre: mockSoumettre,
    }),
  ),
}));

import EleveDevoirsPage from '@/app/(app)/eleve/devoirs/page';

describe('Élève Devoirs', () => {
  it('affiche la liste des devoirs', () => {
    render(<EleveDevoirsPage />);
    expect(screen.getByText('Exercice algèbre')).toBeInTheDocument();
    expect(screen.getByText('Rapport de labo')).toBeInTheDocument();
  });

  it('affiche le badge "Rendu" pour les devoirs faits', () => {
    render(<EleveDevoirsPage />);
    expect(screen.getByText('Rendu')).toBeInTheDocument();
  });

  it('soumet un devoir après avoir cliqué Soumettre', async () => {
    render(<EleveDevoirsPage />);
    fireEvent.click(screen.getByRole('button', { name: /soumettre/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() => expect(mockSoumettre).toHaveBeenCalledWith(1, ''));
  });
});
