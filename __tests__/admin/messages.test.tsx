import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ id: '42' }),
}));
vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

const mockFetchConversations = vi.fn();
vi.mock('@/stores/messages.store', () => ({
  useMessagesStore: vi.fn((sel) => sel({
    conversations: [{ user_id: 5, nom: 'Diallo Sekou', avatar_url: null, dernier_message: 'Bonjour', dernier_at: '2026-05-20T10:00:00Z', non_lus: 2 }],
    isLoading: false,
    fetchConversations: mockFetchConversations,
    messages: {}, convMeta: {}, isSending: false,
    fetchConversation: vi.fn(), loadMore: vi.fn(), envoyer: vi.fn(),
  })),
}));

import MessagesPage from '@/app/(app)/admin/messages/page';

describe('Admin Messages', () => {
  it('affiche la liste des conversations', () => {
    render(<MessagesPage />);
    expect(screen.getByText('Diallo Sekou')).toBeDefined();
  });

  it('affiche le badge de messages non lus', () => {
    render(<MessagesPage />);
    expect(screen.getByText('2')).toBeDefined();
  });
});
