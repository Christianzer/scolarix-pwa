import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { messagesService } from '@/services/messages.service';
import { zustandStorage } from '@/lib/zustand-storage';
import type { Conversation, Message } from '@/types/messages';

interface ConvMeta {
  currentPage: number;
  hasMore: boolean;
}

interface MessagesState {
  conversations: Conversation[];
  messages: Record<number, Message[]>;
  convMeta: Record<number, ConvMeta>;
  isLoading: boolean;
  isLoadingMore: boolean;
  isSending: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchConversation: (userId: number) => Promise<void>;
  loadMore: (userId: number) => Promise<void>;
  envoyer: (userId: number, contenu: string) => Promise<void>;
  envoyerFichier: (userId: number, uri: string, nom: string, mime: string) => Promise<void>;
  supprimerMessage: (userId: number, messageId: number) => Promise<void>;
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      convMeta: {},
      isLoading: false,
      isLoadingMore: false,
      isSending: false,
      error: null,

      fetchConversations: async () => {
        set({ isLoading: true, error: null });
        try {
          const conversations = await messagesService.getConversations();
          set({ conversations });
        } catch {
          set({ error: 'Impossible de charger les conversations.' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchConversation: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const page = await messagesService.getConversation(userId, 1);
          set((state) => ({
            messages: { ...state.messages, [userId]: page.data },
            convMeta: {
              ...state.convMeta,
              [userId]: { currentPage: 1, hasMore: page.meta.has_more },
            },
          }));
        } catch {
          set({ error: 'Impossible de charger la conversation.' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadMore: async (userId) => {
        const state = get();
        const meta = state.convMeta[userId];
        if (!meta?.hasMore || state.isLoadingMore) return;
        set({ isLoadingMore: true });
        try {
          const nextPage = meta.currentPage + 1;
          const page = await messagesService.getConversation(userId, nextPage);
          set((s) => ({
            messages: {
              ...s.messages,
              // prepend older messages
              [userId]: [...page.data, ...(s.messages[userId] ?? [])],
            },
            convMeta: {
              ...s.convMeta,
              [userId]: { currentPage: nextPage, hasMore: page.meta.has_more },
            },
          }));
        } catch {
          // silently ignore
        } finally {
          set({ isLoadingMore: false });
        }
      },

      envoyer: async (userId, contenu) => {
        set({ isSending: true });
        try {
          const msg = await messagesService.envoyer(userId, contenu);
          set((state) => ({
            messages: {
              ...state.messages,
              [userId]: [...(state.messages[userId] ?? []), msg],
            },
          }));
        } finally {
          set({ isSending: false });
        }
      },

      envoyerFichier: async (userId, uri, nom, mime) => {
        set({ isSending: true });
        try {
          const msg = await messagesService.envoyerFichier(userId, uri, nom, mime);
          set((state) => ({
            messages: {
              ...state.messages,
              [userId]: [...(state.messages[userId] ?? []), msg],
            },
          }));
        } finally {
          set({ isSending: false });
        }
      },

      supprimerMessage: async (userId, messageId) => {
        await messagesService.supprimerMessage(messageId);
        set((state) => ({
          messages: {
            ...state.messages,
            [userId]: (state.messages[userId] ?? []).filter((m) => m.id !== messageId),
          },
        }));
      },
    }),
    {
      name: 'messages-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
      }),
    }
  )
);
