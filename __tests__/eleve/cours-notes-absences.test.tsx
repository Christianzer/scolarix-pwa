import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/stores/eleve.store', () => ({
  useEleveStore: vi.fn((sel) =>
    sel({
      cours: [{ id: 1, jour: 'Lundi', heure_debut: '08:00', heure_fin: '10:00', salle: 'A101', matiere: 'Mathématiques', enseignant: 'M. Koné' }],
      notes: [{ matiere_id: 1, matiere: 'Mathématiques', coefficient: 3, periodes: [{ periode: 'trimestre1', notes: [{ id: 1, valeur: 14, bareme: 20, type: 'devoir', commentaire: null }], moyenne: 14 }] }],
      absences: [{ id: 1, date: '2026-05-01', type: 'absence', justifiee: false, justification: null, matiere: 'SVT' }],
      isLoadingCours: false,
      isLoadingNotes: false,
      isLoadingAbsences: false,
      fetchCours: vi.fn(),
      fetchNotes: vi.fn(),
      fetchAbsences: vi.fn(),
    }),
  ),
}));

import EleveCoursPage from '@/app/(app)/eleve/cours/page';
import EleveNotesPage from '@/app/(app)/eleve/notes/page';
import EleveAbsencesPage from '@/app/(app)/eleve/absences/page';

describe('Élève Cours / Notes / Absences', () => {
  it('affiche les cours du jour', () => {
    render(<EleveCoursPage />);
    expect(screen.getByText('Mathématiques')).toBeInTheDocument();
    expect(screen.getByText(/08:00/)).toBeInTheDocument();
  });

  it('affiche les notes par matière avec la moyenne', () => {
    render(<EleveNotesPage />);
    expect(screen.getByText('Mathématiques')).toBeInTheDocument();
    expect(screen.getAllByText(/14/).length).toBeGreaterThan(0);
  });

  it('affiche les absences avec le statut', () => {
    render(<EleveAbsencesPage />);
    expect(screen.getByText(/non justifi/i)).toBeInTheDocument();
  });
});
