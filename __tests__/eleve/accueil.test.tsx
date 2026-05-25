import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 1, nom_complet: 'Koné Aminata', prenom: 'Aminata' } }),
  ),
}));
vi.mock('@/stores/eleve.store', () => ({
  useEleveStore: vi.fn((sel) =>
    sel({
      notes: [{ matiere_id: 1, matiere: 'Maths', coefficient: 3, periodes: [] }],
      absences: [{ id: 1, date: '2026-05-01', type: 'absence', justifiee: false, justification: null, matiere: null }],
      classe: '3ème A',
      fetchNotes: vi.fn(),
      fetchAbsences: vi.fn(),
    }),
  ),
}));
vi.mock('@/stores/devoirs.store', () => ({
  useDevoirsStore: vi.fn((sel) =>
    sel({
      devoirs: [
        { id: 1, matiere: 'Maths', titre: 'Exercice 5', description: null, date_limite: '15 juin', fait: false, enseignant: null, classe: null },
        { id: 2, matiere: 'SVT', titre: 'Rapport', description: null, date_limite: '20 juin', fait: true, enseignant: null, classe: null },
      ],
      fetchDevoirs: vi.fn(),
    }),
  ),
}));

import EleveAccueilPage from '@/app/(app)/eleve/accueil/page';

describe('Élève Accueil', () => {
  it('affiche le prénom de l\'élève', () => {
    render(<EleveAccueilPage />);
    expect(screen.getByText(/Aminata/i)).toBeInTheDocument();
  });

  it('affiche le nombre d\'absences', () => {
    render(<EleveAccueilPage />);
    const allOnes = screen.getAllByText('1');
    expect(allOnes.length).toBeGreaterThanOrEqual(1);
  });

  it('affiche les devoirs non rendus', () => {
    render(<EleveAccueilPage />);
    expect(screen.getByText('Exercice 5')).toBeInTheDocument();
  });
});
