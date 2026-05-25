import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/chauffeur/accueil',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 1, nom_complet: 'Diallo Moussa', prenom: 'Moussa', email: 'd@test.ci' }, logout: vi.fn() }),
  ),
}));
vi.mock('@/stores/pointage.store', () => ({
  usePointageStore: vi.fn((sel) =>
    sel({ pointageJour: null, historique: [], isLoading: false, fetchAujourdhui: vi.fn(), fetchHistorique: vi.fn() }),
  ),
}));
vi.mock('@/services/chauffeur.service', () => ({
  chauffeurService: {
    getBus: vi.fn().mockResolvedValue({ id: 1, nom: 'Bus 01', capacite: 30, actif: true, arrets: [], eleves_count: 22 }),
    getEleves: vi.fn().mockResolvedValue([]),
    pointerEleve: vi.fn().mockResolvedValue(undefined),
  },
}));

import ChauffeurBottomNav from '@/components/chauffeur/bottom-nav';
import ChauffeurMenuPage from '@/app/(app)/chauffeur/menu/page';
import ChauffeurAccueilPage from '@/app/(app)/chauffeur/accueil/page';

describe('Chauffeur Layout, Menu & Accueil', () => {
  it('affiche les 4 onglets de navigation', () => {
    render(<ChauffeurBottomNav />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Mon bus')).toBeInTheDocument();
    expect(screen.getByText('Pointage')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('affiche le nom du chauffeur dans le menu', () => {
    render(<ChauffeurMenuPage />);
    expect(screen.getByText('Diallo Moussa')).toBeInTheDocument();
  });

  it('affiche le nom du bus sur l\'accueil', async () => {
    render(<ChauffeurAccueilPage />);
    await screen.findByText('Bus 01');
  });
});
