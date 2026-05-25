import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/admin/deliberations',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockDeliberations = [
  {
    id: 1, classe_id: 5, classe: '3ème A', departement: null,
    periode: 'trimestre1', periode_label: 'Trimestre 1',
    statut: 'en_cours', nb_eleves: 32, validee_par: null, validee_le: null, created_at: '2025-10-01',
  },
  {
    id: 2, classe_id: 6, classe: '4ème B', departement: null,
    periode: 'trimestre2', periode_label: 'Trimestre 2',
    statut: 'validee', nb_eleves: 28, validee_par: 'Admin', validee_le: '2025-12-15', created_at: '2025-12-01',
  },
];

const { mockFetchAll, mockCreate } = vi.hoisted(() => ({
  mockFetchAll: vi.fn(),
  mockCreate: vi.fn().mockResolvedValue(1),
}));

vi.mock('@/stores/deliberation.store', () => ({
  useDeliberationStore: vi.fn((sel) =>
    sel({
      deliberations: mockDeliberations,
      isLoading: false,
      isCreating: false,
      fetchAll: mockFetchAll,
      create: mockCreate,
    }),
  ),
}));

vi.mock('@/services/admin.service', () => ({
  adminService: {
    getClasses: vi.fn().mockResolvedValue([
      { id: 5, nom: '3ème A', departement: null },
      { id: 6, nom: '4ème B', departement: null },
    ]),
  },
}));

import DeliberationsPage from '@/app/(app)/admin/deliberations/page';

describe('Admin Délibérations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche la liste des délibérations', async () => {
    render(<DeliberationsPage />);
    await waitFor(() => {
      expect(screen.getByText('3ème A')).toBeInTheDocument();
      expect(screen.getByText('4ème B')).toBeInTheDocument();
    });
  });

  it('filtre par période T1', async () => {
    const user = userEvent.setup();
    render(<DeliberationsPage />);
    await waitFor(() => screen.getByText('3ème A'));
    await user.click(screen.getByRole('button', { name: /T1/i }));
    await waitFor(() => {
      expect(screen.getByText('3ème A')).toBeInTheDocument();
      expect(screen.queryByText('4ème B')).toBeNull();
    });
  });

  it('affiche le bouton Nouvelle délibération', () => {
    render(<DeliberationsPage />);
    expect(screen.getByRole('button', { name: /nouvelle/i })).toBeInTheDocument();
  });
});
