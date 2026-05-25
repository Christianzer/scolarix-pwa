'use client';

import { useEffect, useState } from 'react';
import { useRdvStore } from '@/stores/rdv.store';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { StatutRdv, RendezVous } from '@/types/rendez-vous';
import type { ConfirmerPayload, ReporterPayload } from '@/services/rdv.service';
import { Calendar } from 'lucide-react';

const FILTRES: { key: StatutRdv | 'tous'; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'confirme', label: 'Confirmés' },
  { key: 'reporte', label: 'Reportés' },
  { key: 'annule', label: 'Annulés' },
];

export default function RendezVousPage() {
  const items = useRdvStore((s) => s.items);
  const isLoading = useRdvStore((s) => s.isLoading);
  const isActing = useRdvStore((s) => s.isActing);
  const fetchAll = useRdvStore((s) => s.fetchAll);
  const confirmer = useRdvStore((s) => s.confirmer);
  const annuler = useRdvStore((s) => s.annuler);
  const reporter = useRdvStore((s) => s.reporter);

  const [filtre, setFiltre] = useState<StatutRdv | 'tous'>('tous');
  const [selected, setSelected] = useState<RendezVous | null>(null);
  const [action, setAction] = useState<'confirmer' | 'reporter' | null>(null);

  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [lieu, setLieu] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const filtered = filtre === 'tous' ? items : items.filter((r) => r.statut === filtre);

  function openAction(rdv: RendezVous, act: 'confirmer' | 'reporter') {
    setSelected(rdv);
    setAction(act);
    setDate(rdv.date_proposee ?? '');
    setHeure(rdv.heure ?? '');
    setLieu(rdv.lieu ?? '');
    setNote('');
  }

  async function handleAnnuler(id: number) {
    try {
      await annuler(id);
      toast.success('RDV annulé');
    } catch {
      toast.error("Erreur lors de l'annulation");
    }
  }

  async function handleSubmit() {
    if (!selected || !action) return;
    if (!date || !heure) { toast.error('Date et heure requises'); return; }
    try {
      if (action === 'confirmer') {
        const payload: ConfirmerPayload = { date_proposee: date, heure, lieu: lieu || undefined, note: note || undefined };
        await confirmer(selected.id, payload);
        toast.success('RDV confirmé');
      } else {
        const payload: ReporterPayload = { date_proposee: date, heure, note: note || undefined };
        await reporter(selected.id, payload);
        toast.success('RDV reporté');
      }
      setSelected(null);
      setAction(null);
    } catch {
      toast.error("Erreur lors de l'opération");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Rendez-vous" backHref="/admin/menu" />

      <div className="p-4 space-y-4">
        <div role="group" aria-label="Filtrer par statut" className="flex gap-2 overflow-x-auto pb-1">
          {FILTRES.map((f) => (
            <button key={f.key} onClick={() => setFiltre(f.key)} aria-pressed={filtre === f.key}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filtre === f.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center text-gray-400 py-8">Aucun rendez-vous</div>
        )}

        <div className="space-y-3">
          {filtered.map((rdv) => (
            <div key={rdv.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{rdv.motif}</p>
                  <p className="text-xs text-gray-500">
                    {rdv.demandeur ? `${rdv.demandeur.nom} ${rdv.demandeur.prenom}` : '—'}
                    {' → '}
                    {rdv.destinataire ? `${rdv.destinataire.nom} ${rdv.destinataire.prenom}` : '—'}
                  </p>
                  {rdv.date_proposee && (
                    <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-1">
                      <Calendar size={11} aria-hidden="true" />
                      {rdv.date_proposee}{rdv.heure ? ` à ${rdv.heure}` : ''}{rdv.lieu ? ` — ${rdv.lieu}` : ''}
                    </p>
                  )}
                </div>
                <StatusBadge status={rdv.statut} />
              </div>

              {rdv.statut === 'en_attente' && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => openAction(rdv, 'confirmer')} disabled={isActing}
                    className="flex-1 py-1.5 text-xs bg-green-600 text-white rounded-lg font-medium disabled:opacity-50">
                    Confirmer
                  </button>
                  <button onClick={() => void handleAnnuler(rdv.id)} disabled={isActing}
                    className="flex-1 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg font-medium disabled:opacity-50">
                    Annuler
                  </button>
                </div>
              )}
              {rdv.statut === 'confirme' && (
                <div className="mt-2">
                  <button onClick={() => openAction(rdv, 'reporter')} disabled={isActing}
                    className="w-full py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-lg font-medium disabled:opacity-50">
                    Reporter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setAction(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === 'confirmer' ? 'Confirmer le RDV' : 'Reporter le RDV'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="rdv-date" className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input id="rdv-date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="rdv-heure" className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
              <input id="rdv-heure" type="time" value={heure} onChange={(e) => setHeure(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {action === 'confirmer' && (
              <div>
                <label htmlFor="rdv-lieu" className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input id="rdv-lieu" type="text" value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="ex. Bureau direction"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div>
              <label htmlFor="rdv-note" className="block text-sm font-medium text-gray-700 mb-1">
                Note <span className="text-gray-400 font-normal">(optionnelle)</span>
              </label>
              <textarea id="rdv-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Observations…"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <button onClick={() => void handleSubmit()} disabled={isActing || !date || !heure}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50">
              {isActing ? 'Traitement…' : action === 'confirmer' ? 'Confirmer' : 'Reporter'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
