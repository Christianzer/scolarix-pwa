import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '42' }),
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
        { user_id: 42, nom: 'Diallo Ibrahim', avatar_url: null, dernier_message: 'Bonjour', dernier_at: '2026-05-24', non_lus: 2 },
      ],
      messages: {
        42: [{ id: 1, contenu: 'Bonjour', type: 'texte', fichier_url: null, fichier_nom: null, envoyeur: false, lu: true, heure: '09:00', full_date: '2026-05-24' }],
      },
      convMeta: { 42: { currentPage: 1, hasMore: false } },
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
    sel({ user: { id: 1, nom_complet: 'Test User' } }),
  ),
}));

import EnseignantMessagesPage from '@/app/(app)/enseignant/messages/page';
import EnseignantMessageThreadPage from '@/app/(app)/enseignant/messages/[id]/page';

describe('Enseignant Messages', () => {
  it('affiche la liste des conversations', () => {
    render(<EnseignantMessagesPage />);
    expect(screen.getByText('Diallo Ibrahim')).toBeInTheDocument();
    expect(screen.getByText('Bonjour')).toBeInTheDocument();
  });

  it('affiche le badge non lus', () => {
    render(<EnseignantMessagesPage />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('affiche les messages dans le thread', async () => {
    render(<EnseignantMessageThreadPage />);
    await waitFor(() => expect(screen.getByText('Bonjour')).toBeInTheDocument());
  });
});
