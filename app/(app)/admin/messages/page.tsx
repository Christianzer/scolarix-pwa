'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMessagesStore } from '@/stores/messages.store';
import { PageHeader } from '@/components/admin/page-header';
import { getInitiales, formatHeure } from '@/lib/format';

export default function MessagesPage() {
  const router = useRouter();
  const { conversations, isLoading, fetchConversations } = useMessagesStore((s) => ({
    conversations: s.conversations,
    isLoading: s.isLoading,
    fetchConversations: s.fetchConversations,
  }));

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div>
      <PageHeader title="Messages" />
      <div role="list" aria-label="Conversations">
        {isLoading && conversations.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" aria-label="Chargement" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">Aucune conversation</p>
          </div>
        ) : (
          conversations.map(conv => (
            <button
              key={conv.user_id}
              role="listitem"
              onClick={() => router.push(`/admin/messages/${conv.user_id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
              aria-label={`Conversation avec ${conv.nom}${conv.non_lus > 0 ? `, ${conv.non_lus} messages non lus` : ''}`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center" aria-hidden="true">
                  <span className="text-base font-semibold text-[#2B3D88]">{getInitiales(conv.nom)}</span>
                </div>
                {conv.non_lus > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    aria-hidden="true"
                  >
                    {conv.non_lus > 9 ? '9+' : conv.non_lus}
                  </span>
                )}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-sm truncate ${conv.non_lus > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {conv.nom}
                  </span>
                  <span className="text-[11px] text-gray-400 shrink-0">{formatHeure(conv.dernier_at)}</span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${conv.non_lus > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                  {conv.dernier_message}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
