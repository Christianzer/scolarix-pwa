'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useEnseignantStore } from '@/stores/enseignant.store';
import { messagesService } from '@/services/messages.service';
import { PageHeader } from '@/components/admin/page-header';

export default function DiffuserPage() {
  const classes = useEnseignantStore((s) => s.classes);
  const [classeId, setClasseId] = useState<number | null>(null);
  const [contenu, setContenu] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classeId) { toast.error('Veuillez choisir une classe'); return; }
    if (!contenu.trim()) { toast.error('Message vide'); return; }
    setIsSending(true);
    try {
      await messagesService.diffuserClasse(classeId, contenu.trim());
      toast.success('Message diffusé');
      setContenu('');
    } catch {
      toast.error('Erreur lors de la diffusion');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Diffuser un message" backHref="/enseignant/menu" />
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Classe *</label>
            <select
              aria-label="Classe"
              value={classeId ?? ''}
              onChange={(e) => setClasseId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Choisir une classe…</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Message *</label>
            <textarea
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              placeholder="Votre message pour toute la classe…"
              aria-label="Message"
              rows={5}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
              required
            />
          </div>
        </div>
        <button type="submit" disabled={isSending} className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50">
          {isSending ? 'Envoi…' : 'Diffuser à la classe'}
        </button>
      </form>
    </div>
  );
}
