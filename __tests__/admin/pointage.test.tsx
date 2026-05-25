import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/pointage',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/services/admin.service', () => ({
  adminService: {
    getPointagesAujourdhui: vi.fn().mockResolvedValue({
      data: [
        { id: 1, user_id: 10, nom_complet: 'Kouassi Jean', role: 'enseignant', avatar_url: null,
          heure_arrivee: '07:45', heure_depart: null, statut: 'present', duree_formatee: null },
      ],
      stats: { presents: 8, retards: 2, absents: 3, total_staff: 13 },
    }),
  },
}));

import PointagePage from '@/app/(app)/admin/pointage/page';

describe('Admin Pointage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('affiche les stats du jour', async () => {
    render(<PointagePage />);
    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('13')).toBeInTheDocument();
    });
  });

  it('affiche le nom d\'un membre', async () => {
    render(<PointagePage />);
    await waitFor(() => {
      expect(screen.getByText('Kouassi Jean')).toBeInTheDocument();
    });
  });

  it('affiche l\'heure d\'arrivée', async () => {
    render(<PointagePage />);
    await waitFor(() => {
      expect(screen.getByText('07:45')).toBeInTheDocument();
    });
  });
});
