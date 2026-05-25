import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '7' }),
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
        { user_id: 7, nom: 'M. Bamba', avatar_url: null, dernier_message: 'Bonjour', dernier_at: '2026-05-24', non_lus: 1 },
      ],
      messages: {
        7: [{ id: 1, contenu: 'Bonjour monsieur', type: 'texte', fichier_url: null, fichier_nom: null, envoyeur: true, lu: true, heure: '10:00', full_date: '2026-05-24' }],
      },
      convMeta: { 7: { currentPage: 1, hasMore: false } },
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
    sel({ user: { id: 99, nom_complet: 'Koné Aminata' } }),
  ),
}));

import EleveMessagesPage from '@/app/(app)/eleve/messages/page';
import EleveMessageThreadPage from '@/app/(app)/eleve/messages/[id]/page';

describe('Élève Messages', () => {
  it('affiche la liste des conversations', () => {
    render(<EleveMessagesPage />);
    expect(screen.getByText('M. Bamba')).toBeInTheDocument();
  });

  it('affiche le badge non lus', () => {
    render(<EleveMessagesPage />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('affiche les messages dans le thread', async () => {
    render(<EleveMessageThreadPage />);
    await waitFor(() => expect(screen.getByText('Bonjour monsieur')).toBeInTheDocument());
  });
});
