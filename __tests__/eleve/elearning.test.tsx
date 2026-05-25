import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '5' }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockMarquer } = vi.hoisted(() => ({
  mockMarquer: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/stores/elearning.store', () => ({
  useElearningStore: vi.fn((sel) =>
    sel({
      cours: [
        { id: 5, titre: 'Introduction à Python', description: 'Bases du langage', video_url: null, fichier_url: null, enseignant: 'M. Traoré', matiere: 'Informatique', classe: null, publie_le: '2026-05-01', completion_percentage: 50, complete: false, complete_le: null },
      ],
      coursDetail: { id: 5, titre: 'Introduction à Python', description: 'Bases', video_url: 'https://yt.be/test', fichier_url: null, enseignant: null, matiere: 'Informatique', classe: null, publie_le: null, completion_percentage: 50, complete: false, complete_le: null, contenu: 'Python est un langage polyvalent.' },
      isLoading: false,
      isLoadingDetail: false,
      fetchCours: vi.fn(),
      fetchCoursDetail: vi.fn(),
      marquerComplete: mockMarquer,
      clearDetail: vi.fn(),
    }),
  ),
}));

import EleveElearningPage from '@/app/(app)/eleve/cours-en-ligne/page';
import EleveElearningDetailPage from '@/app/(app)/eleve/cours-en-ligne/[id]/page';

describe('Élève E-learning', () => {
  it('affiche la liste des cours', () => {
    render(<EleveElearningPage />);
    expect(screen.getByText('Introduction à Python')).toBeInTheDocument();
  });

  it('affiche le détail du cours avec le contenu', async () => {
    render(<EleveElearningDetailPage />);
    await waitFor(() => expect(screen.getByText('Python est un langage polyvalent.')).toBeInTheDocument());
  });

  it('marque le cours comme terminé', async () => {
    render(<EleveElearningDetailPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: /terminé|complet/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /terminé|complet/i }));
    await waitFor(() => expect(mockMarquer).toHaveBeenCalledWith(5));
  });
});
