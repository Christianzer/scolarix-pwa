'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { devoirsService } from '@/services/devoirs.service';
import { enseignantService } from '@/services/enseignant.service';
import { PageHeader } from '@/components/admin/page-header';
import type { Devoir, DevoirSoumission } from '@/types/devoirs';

export default function DevoirSoumissionsPage() {
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);
  const [devoirId, setDevoirId] = useState<number | null>(null);
  const [soumissions, setSoumissions] = useState<DevoirSoumission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    devoirsService.getAll().then((d) => { if (!cancelled) setDevoirs(d); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleDevoirChange = async (id: number | null) => {
    setDevoirId(id);
    setSoumissions([]);
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await enseignantService.getSoumissions(id);
      setSoumissions(data);
    } catch {
      toast.error('Impossible de charger les soumissions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Soumissions" backHref="/enseignant/menu" />
      <div className="p-4 space-y-3">
        <select
          aria-label="Devoir"
          value={devoirId ?? ''}
          onChange={(e) => handleDevoirChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Choisir un devoir…</option>
          {devoirs.map((d) => (
            <option key={d.id} value={d.id}>{d.titre} — {d.matiere}</option>
          ))}
        </select>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
          </div>
        )}

        {!isLoading && devoirId && soumissions.length === 0 && (
          <p className="text-center text-gray-400 py-8">Aucune soumission</p>
        )}

        {!isLoading && soumissions.map((s) => (
          <div key={s.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            {s.fait
              ? <CheckCircle2 size={20} className="text-green-500 shrink-0" aria-hidden="true" />
              : <XCircle size={20} className="text-gray-300 shrink-0" aria-hidden="true" />}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{s.nom_complet}</p>
              <p className="text-xs text-gray-400">{s.matricule}</p>
              {s.contenu_soumis && <p className="text-xs text-gray-600 mt-1 truncate">{s.contenu_soumis}</p>}
            </div>
            {s.soumis_le && <span className="text-xs text-gray-400 shrink-0">{s.soumis_le.slice(0, 10)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
