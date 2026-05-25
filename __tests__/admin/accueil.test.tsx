import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock('next/image', () => ({ default: (p: Record<string, unknown>) => <img alt={p.alt as string} /> }));

vi.mock('@/stores/admin.store', () => ({
  useAdminStore: vi.fn((sel) => sel({
    eleves: [], eleveMeta: { total: 42 }, paiements: [], paiementMeta: null,
    totalAujourdhui: 150000, isLoadingEleves: false, isLoadingPaiements: false,
    fetchEleves: vi.fn(), fetchPaiements: vi.fn(),
  })),
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) => sel({ user: { prenom: 'Kouadio', nom_complet: 'Kouadio Admin', role: 'admin1' } })),
}));
vi.mock('@/stores/annee-scolaire.store', () => ({
  useAnneeScolaireStore: vi.fn((sel) => sel({ annee: { libelle: '2025-2026' }, fetchAnnee: vi.fn() })),
}));

import AccueilPage from '@/app/(app)/admin/accueil/page';

describe('Admin Accueil', () => {
  it('affiche le nombre total d\'élèves', () => {
    render(<AccueilPage />);
    expect(screen.getByText('42')).toBeDefined();
  });

  it('affiche le total perçu aujourd\'hui formaté', () => {
    render(<AccueilPage />);
    expect(screen.getByText(/150/)).toBeDefined();
  });
});
