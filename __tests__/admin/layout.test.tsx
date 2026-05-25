import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/accueil',
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((selector) => selector({ user: null, isReady: true, restoreSession: vi.fn() })),
}));

import { AdminBottomNav } from '@/components/admin/bottom-nav';

describe('AdminBottomNav', () => {
  it('affiche les 5 onglets', () => {
    render(<AdminBottomNav />);
    expect(screen.getByText('Accueil')).toBeDefined();
    expect(screen.getByText('Élèves')).toBeDefined();
    expect(screen.getByText('Paiements')).toBeDefined();
    expect(screen.getByText('Messages')).toBeDefined();
    expect(screen.getByText('Menu')).toBeDefined();
  });

  it('marque l\'onglet actif selon le pathname', () => {
    render(<AdminBottomNav />);
    const accueilLink = screen.getByRole('link', { name: /accueil/i });
    expect(accueilLink.className).toContain('text-[#2B3D88]');
  });
});
