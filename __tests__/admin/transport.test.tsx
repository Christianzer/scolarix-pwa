import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/transport',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/services/transport.service', () => ({
  getBusList: vi.fn().mockResolvedValue([
    { id: 1, nom: 'Bus 01', description: 'Route Nord', capacite: 30, immatriculation: 'AB-123-CI',
      chauffeur_nom: 'Diabaté Moussa', chauffeur_telephone: '0707070707', actif: true, arrets: [], eleves_count: 22 },
  ]),
  getStats: vi.fn().mockResolvedValue({
    total_eleves: 45, total_bus_actifs: 2, pointages_today: 38,
    par_bus: [{ id: 1, nom: 'Bus 01', inscrits: 22, capacite: 30, taux: 73 }],
  }),
}));

import TransportPage from '@/app/(app)/admin/transport/page';

describe('Admin Transport', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('affiche le total des élèves', async () => {
    render(<TransportPage />);
    await waitFor(() => { expect(screen.getByText('45')).toBeInTheDocument(); });
  });

  it('affiche le nom du bus', async () => {
    render(<TransportPage />);
    await waitFor(() => { expect(screen.getByText('Bus 01')).toBeInTheDocument(); });
  });

  it('affiche le nom du chauffeur', async () => {
    render(<TransportPage />);
    await waitFor(() => { expect(screen.getByText('Diabaté Moussa')).toBeInTheDocument(); });
  });
});
