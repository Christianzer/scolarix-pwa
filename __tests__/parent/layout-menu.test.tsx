import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/parent/accueil',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 1, nom_complet: 'Coulibaly Jean', email: 'j@test.ci' }, logout: vi.fn() }),
  ),
}));
vi.mock('@/stores/parent.store', () => ({
  useParentStore: vi.fn((sel) =>
    sel({ enfants: [{ id: 1, nom_complet: 'Coulibaly Marie', matricule: 'E001', avatar_url: null, classe: '3ème A', departement: null, nb_absences: 0, lien: 'Père' }] }),
  ),
}));

import ParentBottomNav from '@/components/parent/bottom-nav';
import ParentMenuPage from '@/app/(app)/parent/menu/page';

describe('Parent Layout & Menu', () => {
  it('affiche les 4 onglets de navigation', () => {
    render(<ParentBottomNav />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Paiements')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('affiche le nom du parent dans le menu', () => {
    render(<ParentMenuPage />);
    expect(screen.getByText('Coulibaly Jean')).toBeInTheDocument();
  });

  it('affiche le bouton de déconnexion', () => {
    render(<ParentMenuPage />);
    expect(screen.getByRole('button', { name: /déconnecter/i })).toBeInTheDocument();
  });
});
