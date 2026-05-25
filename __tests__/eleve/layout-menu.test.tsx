import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/eleve/accueil',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 1, nom_complet: 'Koné Aminata', email: 'k@test.ci', prenom: 'Aminata' }, logout: vi.fn() }),
  ),
}));
vi.mock('@/stores/eleve.store', () => ({
  useEleveStore: vi.fn((sel) =>
    sel({ notes: [], cours: [], classe: '3ème A', absences: [] }),
  ),
}));

import EleveBottomNav from '@/components/eleve/bottom-nav';
import EleveMenuPage from '@/app/(app)/eleve/menu/page';

describe('Élève Layout & Menu', () => {
  it('affiche les 4 onglets de navigation', () => {
    render(<EleveBottomNav />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Cours')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('affiche le nom de l\'élève dans le menu', () => {
    render(<EleveMenuPage />);
    expect(screen.getByText('Koné Aminata')).toBeInTheDocument();
  });

  it('affiche le bouton de déconnexion', () => {
    render(<EleveMenuPage />);
    expect(screen.getByRole('button', { name: /déconnecter/i })).toBeInTheDocument();
  });
});
