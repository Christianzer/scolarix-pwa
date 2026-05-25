'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDeliberationStore } from '@/stores/deliberation.store';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Decision, DeliberationResultat } from '@/types/deliberation';

const DECISIONS: { key: Decision; label: string; color: string }[] = [
  { key: 'admis', label: 'Admis', color: 'bg-green-100 text-green-700 border-green-300' },
  { key: 'passage_conditionnel', label: 'Passage conditionnel', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { key: 'redoublant', label: 'Redoublant', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { key: 'exclu', label: 'Exclu', color: 'bg-red-100 text-red-700 border-red-300' },
];

export default function DeliberationResultatsPage() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get('id');
  const id = rawId ? parseInt(rawId, 10) : null;

  const detail = useDeliberationStore((s) => s.detail);
  const isLoadingDetail = useDeliberationStore((s) => s.isLoadingDetail);
  const isValidating = useDeliberationStore((s) => s.isValidating);
  const fetchById = useDeliberationStore((s) => s.fetchById);
  const valider = useDeliberationStore((s) => s.valider);
  const updateResultat = useDeliberationStore((s) => s.updateResultat);
  const clearDetail = useDeliberationStore((s) => s.clearDetail);

  const [selectedResultat, setSelectedResultat] = useState<DeliberationResultat | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (id) {
      void Promise.resolve(fetchById(id)).catch(() => {
        if (!cancelled) toast.error('Impossible de charger les résultats');
      });
    }
    return () => {
      cancelled = true;
      clearDetail();
    };
  }, [id, fetchById, clearDetail]);

  function openDecisionDialog(r: DeliberationResultat) {
    setSelectedResultat(r);
    setDecision(r.decision);
    setCommentaire(r.commentaire ?? '');
  }

  async function handleSaveDecision() {
    if (!detail || !selectedResultat) return;
    setIsSaving(true);
    try {
      await updateResultat(detail.id, selectedResultat.id, {
        decision: decision ?? null,
        commentaire: commentaire || null,
      });
      toast.success('Décision enregistrée');
      setSelectedResultat(null);
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleValider() {
    if (!detail) return;
    try {
      await valider(detail.id);
      toast.success('Délibération validée');
    } catch {
      toast.error('Erreur lors de la validation');
    }
  }

  if (!id) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <PageHeader title="Résultats" backHref="/admin/deliberations" />
        <div className="p-4 text-center text-gray-400 py-12">Identifiant manquant</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader
        title={detail ? `${detail.classe} — ${detail.periode_label}` : 'Résultats'}
        backHref="/admin/deliberations"
      />

      {isLoadingDetail && (
        <div className="flex justify-center py-12">
          <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
        </div>
      )}

      {!isLoadingDetail && detail && (
        <>
          <div className="grid grid-cols-2 gap-3 p-4">
            {[
              { label: 'Élèves', value: String(detail.stats.nb_eleves) },
              { label: 'Moy. classe', value: detail.stats.moyenne_classe !== null ? detail.stats.moyenne_classe.toFixed(2) : '—' },
              { label: 'Admis', value: String(detail.stats.nb_admis) },
              { label: 'Redoublants', value: String(detail.stats.nb_redoublants) },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm text-center">
                <p className="text-2xl font-bold text-blue-700">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-4 mb-2">
            <p className="text-sm font-medium text-gray-700">{detail.resultats.length} résultats</p>
            <StatusBadge status={detail.statut} />
          </div>

          <div className="px-4 space-y-2 pb-4">
            {detail.resultats.map((r) => (
              <button
                key={r.id}
                onClick={() => openDecisionDialog(r)}
                disabled={detail.statut === 'validee'}
                aria-label={`Modifier la décision de ${r.nom_complet}`}
                className="w-full bg-white rounded-xl shadow-sm p-3 flex items-center gap-3 text-left disabled:opacity-70 active:scale-[0.98] transition-transform"
              >
                <div className="w-8 text-center">
                  <p className="text-xs font-bold text-gray-400">#{r.rang ?? '—'}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{r.nom_complet}</p>
                  <p className="text-xs text-gray-500">{r.matricule}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {r.moyenne_generale !== null ? r.moyenne_generale.toFixed(2) : '—'}
                  </p>
                  <p className="text-xs text-gray-500">{r.mention_label}</p>
                </div>
                <div className="ml-1">
                  {r.decision ? (
                    <span className="text-xs font-medium text-blue-600">{r.decision_label}</span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {detail.statut === 'en_cours' && (
            <div className="p-4 pb-8">
              <button
                onClick={() => void handleValider()}
                disabled={isValidating}
                className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
              >
                {isValidating ? 'Validation…' : 'Valider la délibération'}
              </button>
            </div>
          )}
        </>
      )}

      <Dialog open={!!selectedResultat} onOpenChange={(open) => !open && setSelectedResultat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedResultat?.nom_complet}</DialogTitle>
          </DialogHeader>
          {selectedResultat && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-blue-700">
                    {selectedResultat.moyenne_generale !== null ? selectedResultat.moyenne_generale.toFixed(2) : '—'}
                  </p>
                  <p className="text-xs text-gray-500">Moyenne</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-700">#{selectedResultat.rang ?? '—'}</p>
                  <p className="text-xs text-gray-500">Rang</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs font-medium text-gray-700 mt-1">{selectedResultat.mention_label}</p>
                  <p className="text-xs text-gray-500">Mention</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Décision</p>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Choisir une décision">
                  {DECISIONS.map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setDecision(decision === d.key ? null : d.key)}
                      aria-pressed={decision === d.key}
                      className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                        decision === d.key ? d.color + ' border-2' : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="commentaire-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaire <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  id="commentaire-input"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Observations…"
                />
              </div>

              <button
                onClick={() => void handleSaveDecision()}
                disabled={isSaving}
                className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
              >
                {isSaving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
