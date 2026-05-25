import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/enseignant/classes',
  useParams: () => ({ id: '1' }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const CLASSES = [
  { id: 1, nom: '3ème A', departement: 'Collège', nb_eleves: 25, matieres: [{ id: 10, nom: 'Maths', coefficient: 4 }] },
];
const ELEVES = [{ id: 1, matricule: 'E001', nom_complet: 'Koné Aminata', avatar_url: null }];

vi.mock('@/stores/enseignant.store', () => ({
  useEnseignantStore: vi.fn((sel) =>
    sel({
      classes: CLASSES,
      isLoadingClasses: false,
      isLoadingEleves: false,
      elevesByClasse: { 1: ELEVES },
      fetchClasses: vi.fn(),
      fetchElevesClasse: vi.fn(),
    }),
  ),
}));

import ClassesPage from '@/app/(app)/enseignant/classes/page';
import ClasseDetailPage from '@/app/(app)/enseignant/classe/[id]/page';

describe('Enseignant Classes', () => {
  it('affiche la liste des classes avec le nombre d\'élèves', () => {
    render(<ClassesPage />);
    expect(screen.getByText('3ème A')).toBeInTheDocument();
    expect(screen.getByText(/25 élève/i)).toBeInTheDocument();
  });

  it('affiche les matières de la classe', () => {
    render(<ClassesPage />);
    expect(screen.getByText('Maths')).toBeInTheDocument();
  });

  it('affiche la liste des élèves sur la page de détail', () => {
    render(<ClasseDetailPage />);
    expect(screen.getByText('Koné Aminata')).toBeInTheDocument();
    expect(screen.getByText('E001')).toBeInTheDocument();
  });
});
