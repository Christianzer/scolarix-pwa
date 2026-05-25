import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/enseignant/menu',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { nom_complet: 'Diallo Ibrahim', email: 'diallo@test.sn' }, logout: vi.fn() }),
  ),
}));
vi.mock('@/stores/enseignant.store', () => ({
  useEnseignantStore: vi.fn((sel) =>
    sel({ classes: [{ id: 1, nom: '3ème A', departement: null, nb_eleves: 30, matieres: [] }] }),
  ),
}));

import { EnseignantBottomNav } from '@/components/enseignant/bottom-nav';
import EnseignantMenuPage from '@/app/(app)/enseignant/menu/page';

describe('Enseignant layout-menu', () => {
  it('affiche les 4 onglets de navigation', () => {
    render(<EnseignantBottomNav />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Classes')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('affiche le nom de l\'enseignant sur la page menu', () => {
    render(<EnseignantMenuPage />);
    expect(screen.getByText('Diallo Ibrahim')).toBeInTheDocument();
  });

  it('affiche le bouton de déconnexion', () => {
    render(<EnseignantMenuPage />);
    expect(screen.getByRole('button', { name: /déconnecter/i })).toBeInTheDocument();
  });
});
