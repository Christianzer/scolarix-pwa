import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '3' }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/lib/pusher', () => ({
  subscriberMessages: vi.fn().mockResolvedValue(() => {}),
}));
vi.mock('@/services/api', () => ({
  tokenStorage: { get: vi.fn().mockReturnValue('token') },
}));
vi.mock('@/stores/messages.store', () => ({
  useMessagesStore: vi.fn((sel) =>
    sel({
      conversations: [
        { user_id: 3, nom: 'Mme Sanogo', avatar_url: null, dernier_message: 'Votre enfant...', dernier_at: '2026-05-24', non_lus: 0 },
      ],
      messages: {
        3: [{ id: 1, contenu: 'Votre enfant est absent', type: 'texte', fichier_url: null, fichier_nom: null, envoyeur: false, lu: true, heure: '14:00', full_date: '2026-05-24' }],
      },
      convMeta: { 3: { currentPage: 1, hasMore: false } },
      isLoading: false,
      isSending: false,
      fetchConversations: vi.fn(),
      fetchConversation: vi.fn(),
      loadMore: vi.fn(),
      envoyer: vi.fn(),
    }),
  ),
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 1, nom_complet: 'Coulibaly Jean' } }),
  ),
}));

import ParentMessagesPage from '@/app/(app)/parent/messages/page';
import ParentMessageThreadPage from '@/app/(app)/parent/messages/[id]/page';

describe('Parent Messages', () => {
  it('affiche la liste des conversations', () => {
    render(<ParentMessagesPage />);
    expect(screen.getByText('Mme Sanogo')).toBeInTheDocument();
  });

  it('affiche le dernier message', () => {
    render(<ParentMessagesPage />);
    expect(screen.getByText('Votre enfant...')).toBeInTheDocument();
  });

  it('affiche les messages dans le thread', async () => {
    render(<ParentMessageThreadPage />);
    await waitFor(() => expect(screen.getByText('Votre enfant est absent')).toBeInTheDocument());
  });
});
