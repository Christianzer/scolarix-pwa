'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Send } from 'lucide-react';
import { useMessagesStore } from '@/stores/messages.store';
import { useAuthStore } from '@/stores/auth.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { subscriberMessages } from '@/lib/pusher';
import { tokenStorage } from '@/services/api';
import { cn } from '@/lib/utils';

export default function EleveMessageThreadPage() {
  const params = useParams();
  const userId = Number(params.id);
  const { messages, convMeta, isSending, fetchConversation, loadMore, envoyer } = useMessagesStore((s) => ({
    messages: s.messages,
    convMeta: s.convMeta,
    isSending: s.isSending,
    fetchConversation: s.fetchConversation,
    loadMore: s.loadMore,
    envoyer: s.envoyer,
  }));
  const myUser = useAuthStore((s) => s.user);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const thread = messages[userId] ?? [];
  const meta = convMeta[userId];

  useEffect(() => {
    if (!isNaN(userId)) fetchConversation(userId);
  }, [fetchConversation, userId]);

  useEffect(() => {
    if (!myUser?.id || isNaN(userId)) return;
    const token = tokenStorage.get() ?? '';
    let unsub: (() => void) | undefined;
    subscriberMessages(myUser.id, token, () => { fetchConversation(userId); }).then(fn => { unsub = fn; });
    return () => { unsub?.(); };
  }, [myUser?.id, userId, fetchConversation]);

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || isSending) return;
    setText('');
    await envoyer(userId, content);
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Conversation" backHref="/eleve/messages" />
      {meta?.hasMore && (
        <div className="text-center p-2 border-b border-gray-100">
          <Button variant="ghost" size="sm" onClick={() => loadMore(userId)}>
            Voir les messages précédents
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20" role="log" aria-live="polite" aria-label="Messages">
        {thread.map(msg => (
          <div key={msg.id} className={cn('flex', msg.envoyeur ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[75%] px-3 py-2 rounded-2xl text-sm break-words',
              msg.envoyeur
                ? 'bg-[#2B3D88] text-white rounded-br-sm'
                : 'bg-white text-gray-900 shadow-sm rounded-bl-sm',
            )}>
              <p className="whitespace-pre-wrap">{msg.contenu}</p>
              <p className={cn('text-[10px] mt-1 text-right', msg.envoyeur ? 'text-blue-200' : 'text-gray-400')}>
                {msg.heure}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 flex items-center gap-2 px-3 py-2"
      >
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Écrire un message…"
          className="flex-1"
          autoComplete="off"
          aria-label="Message à envoyer"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!text.trim() || isSending}
          className="bg-[#2B3D88] hover:bg-[#1a255e] shrink-0"
          aria-label="Envoyer"
        >
          <Send size={16} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
