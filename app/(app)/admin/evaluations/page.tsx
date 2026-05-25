'use client';

import { useEffect, useState } from 'react';
import { evaluationService, type Evaluation, type EvaluationTemplate } from '@/services/evaluation.service';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ClipboardList, ChevronRight } from 'lucide-react';

function ScoreCircle({ note }: { note: number | null }) {
  if (note === null) return <span className="text-gray-400 text-sm">—</span>;
  const pct = (note / 10) * 100;
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" role="img" aria-label={`Note : ${note}/10`}>
      <circle cx="24" cy="24" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={r} fill="none"
        stroke="#3b82f6" strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="28" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1d4ed8">
        {note.toFixed(1)}
      </text>
    </svg>
  );
}

export default function EvaluationsPage() {
  const [tab, setTab] = useState<'liste' | 'templates'>('liste');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<Evaluation | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    Promise.all([evaluationService.getAll(), evaluationService.getTemplates()])
      .then(([evalsRes, tmplRes]) => {
        if (controller.signal.aborted) return;
        setEvaluations(evalsRes.data);
        setTemplates(tmplRes);
      })
      .catch(() => {
        if (!controller.signal.aborted) toast.error('Impossible de charger les évaluations');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function handleValider(id: number) {
    setIsValidating(true);
    try {
      await evaluationService.valider(id);
      toast.success('Évaluation validée');
      setSelected(null);
      const res = await evaluationService.getAll();
      setEvaluations(res.data);
    } catch {
      toast.error('Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Évaluations" backHref="/admin/menu" />

      <div role="tablist" className="flex border-b border-gray-200 bg-white">
        {(['liste', 'templates'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
            }`}
          >
            {t === 'liste' ? 'Liste' : 'Templates'}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && tab === 'liste' && (
          <>
            {evaluations.length === 0 && (
              <div className="text-center text-gray-400 py-12">Aucune évaluation</div>
            )}
            {evaluations.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setSelected(ev)}
                className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
              >
                <ScoreCircle note={ev.note} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{ev.employe ?? '—'}</p>
                  <p className="text-xs text-gray-500">{ev.periode} · {ev.date?.slice(0, 10)}</p>
                  <p className="text-xs text-gray-400 truncate">{ev.evaluateur ?? '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ev.statut} />
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>
            ))}
          </>
        )}

        {!isLoading && tab === 'templates' && (
          <>
            {templates.length === 0 && (
              <div className="text-center text-gray-400 py-12">Aucun template</div>
            )}
            {templates.map((tmpl) => (
              <div key={tmpl.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <ClipboardList size={20} className="text-blue-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{tmpl.nom}</p>
                    {tmpl.description && <p className="text-xs text-gray-500 mt-0.5">{tmpl.description}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tmpl.criteres.map((c) => (
                        <span key={c.nom} className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">
                          {c.nom} ({c.poids}%)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Évaluation — {selected?.employe ?? '—'}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="flex justify-center py-2">
                <ScoreCircle note={selected.note} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Période</span><p className="font-medium">{selected.periode}</p></div>
                <div><span className="text-gray-500">Évaluateur</span><p className="font-medium">{selected.evaluateur ?? '—'}</p></div>
                <div><span className="text-gray-500">Statut</span><div className="mt-1"><StatusBadge status={selected.statut} /></div></div>
                <div><span className="text-gray-500">Date</span><p className="font-medium">{selected.date?.slice(0, 10)}</p></div>
              </div>
              {selected.commentaire && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selected.commentaire}</p>
              )}
              {selected.grille && selected.grille.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Critères</p>
                  {selected.grille.map((c) => (
                    <div key={c.nom} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700">{c.nom} ({c.poids}%)</span>
                      <span className="font-medium">{c.note !== null ? c.note : '—'}</span>
                    </div>
                  ))}
                </div>
              )}
              {selected.statut !== 'validee' && (
                <button
                  onClick={() => handleValider(selected.id)}
                  disabled={isValidating}
                  className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
                >
                  {isValidating ? 'Validation…' : 'Valider l\'évaluation'}
                </button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
