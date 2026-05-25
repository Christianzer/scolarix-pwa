import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

const mockFetchEleves = vi.fn();
const mockFetchEleveDetail = vi.fn();
const mockClearDetail = vi.fn();

vi.mock('@/stores/admin.store', () => ({
  useAdminStore: vi.fn((sel) => sel({
    eleves: [{ id: 1, matricule: 'M001', nom_complet: 'Konan Aya', classe: 'CM2-A', departement: 'Primaire', actif: true, avatar_url: null, classe_id: 5 }],
    eleveMeta: { total: 1, current_page: 1, last_page: 1, per_page: 20 },
    eleveDetail: null, isLoadingEleves: false, isLoadingDetail: false,
    fetchEleves: mockFetchEleves, fetchEleveDetail: mockFetchEleveDetail, clearDetail: mockClearDetail,
  })),
}));

import ElevesPage from '@/app/(app)/admin/eleves/page';

describe('Admin Élèves', () => {
  it('affiche la liste des élèves', () => {
    render(<ElevesPage />);
    expect(screen.getByText('Konan Aya')).toBeDefined();
  });

  it('appelle fetchEleves au montage', () => {
    render(<ElevesPage />);
    expect(mockFetchEleves).toHaveBeenCalledWith({ page: 1 });
  });
});
