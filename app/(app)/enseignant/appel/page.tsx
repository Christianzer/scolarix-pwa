'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useEnseignantStore } from '@/stores/enseignant.store';
import { absencesService } from '@/services/absences.service';
import { PageHeader } from '@/components/admin/page-header';
import type { StatutPresence } from '@/types/absences';

type PresenceMap = Record<number, StatutPresence>;

const STATUT_CONFIG: { statut: StatutPresence; label: string; bg: string }[] = [
  { statut: 'present', label: 'P', bg: 'bg-green-500'  },
  { statut: 'absent',  label: 'A', bg: 'bg-red-500'    },
  { statut: 'retard',  label: 'R', bg: 'bg-yellow-500' },
];

export default function AppelPage() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get('classe');

  const classes = useEnseignantStore((s) => s.classes);
  const elevesByClasse = useEnseignantStore((s) => s.elevesByClasse);
  const fetchElevesClasse = useEnseignantStore((s) => s.fetchElevesClasse);

  const [classeId, setClasseId] = useState<number | null>(preselected ? Number(preselected) : null);
  const [presences, setPresences] = useState<PresenceMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const eleves = classeId ? (elevesByClasse[classeId] ?? []) : [];

  useEffect(() => {
    if (!classeId) return;
    let cancelled = false;
    setIsLoading(true);
    fetchElevesClasse(classeId).finally(() => { if (!cancelled) setIsLoading(false); });
    absencesService.getAppelDuJour(classeId).then((existing) => {
      if (cancelled) return;
      const map: PresenceMap = {};
      existing.forEach(({ eleve_id, statut }) => { map[eleve_id] = statut; });
      setPresences(map);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [classeId, fetchElevesClasse]);

  useEffect(() => {
    if (!eleves.length) return;
    setPresences((prev) => {
      const next = { ...prev };
      eleves.forEach((e) => { if (!(e.id in next)) next[e.id] = 'present'; });
      return next;
    });
  }, [eleves]);

  const toggle = (eleveId: number, statut: StatutPresence) =>
    setPresences((prev) => ({ ...prev, [eleveId]: statut }));

  const handleSubmit = async () => {
    if (!classeId) return;
    setIsSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await absencesService.sauvegarderAppel({
        classe_id: classeId,
        date: today,
        presences: eleves.map((e) => ({ eleve_id: e.id, statut: presences[e.id] ?? 'present' })),
      });
      toast.success('Appel enregistré');
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Faire l'appel" backHref="/enseignant/accueil" />
      <div className="p-4 space-y-4 flex-1">
        <select
          aria-label="Classe"
          value={classeId ?? ''}
          onChange={(e) => setClasseId(e.target.value ? Number(e.target.value) : null)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Choisir une classe…</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
          </div>
        )}

        {!isLoading && eleves.map((eleve) => (
          <div key={eleve.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{eleve.nom_complet}</p>
              <p className="text-xs text-gray-400">{eleve.matricule}</p>
            </div>
            <div className="flex gap-1">
              {STATUT_CONFIG.map(({ statut, label, bg }) => (
                <button
                  key={statut}
                  onClick={() => toggle(eleve.id, statut)}
                  aria-label={`${eleve.nom_complet} ${statut}`}
                  className={`w-9 h-9 rounded-full text-white text-xs font-bold transition-opacity ${bg} ${
                    presences[eleve.id] === statut ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {classeId && eleves.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
          >
            {isSaving ? 'Enregistrement…' : "Enregistrer l'appel"}
          </button>
        </div>
      )}
    </div>
  );
}
