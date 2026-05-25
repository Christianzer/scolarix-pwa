import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { prenom: 'Ibrahim', nom_complet: 'Diallo Ibrahim', email: 'diallo@test.sn' } }),
  ),
}));
vi.mock('@/stores/enseignant.store', () => ({
  useEnseignantStore: vi.fn((sel) =>
    sel({
      classes: [{ id: 1, nom: '3ème A', departement: null, nb_eleves: 30, matieres: [] }],
      fetchClasses: vi.fn(),
    }),
  ),
}));
vi.mock('@/services/devoirs.service', () => ({
  devoirsService: { getAll: vi.fn().mockResolvedValue([]) },
}));

import EnseignantAccueilPage from '@/app/(app)/enseignant/accueil/page';

describe('Enseignant Accueil', () => {
  it('affiche le prénom de l\'enseignant', () => {
    render(<EnseignantAccueilPage />);
    expect(screen.getByText(/Ibrahim/i)).toBeInTheDocument();
  });

  it('affiche le nombre de classes', () => {
    render(<EnseignantAccueilPage />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('affiche les liens rapides', () => {
    render(<EnseignantAccueilPage />);
    expect(screen.getByRole('link', { name: /appel/i })).toBeInTheDocument();
  });
});
