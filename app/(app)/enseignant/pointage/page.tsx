'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MapPin, Clock } from 'lucide-react';
import pointageService from '@/services/pointage.service';
import { PageHeader } from '@/components/admin/page-header';
import type { Pointage, AujourdhuiResponse } from '@/types/pointage';

const STATUT_LABELS: Record<string, string> = {
  present: 'Présent', absent: 'Absent', retard: 'Retard', conge: 'Congé',
};
const STATUT_COLORS: Record<string, string> = {
  present: 'text-green-600 bg-green-50',
  absent:  'text-red-600 bg-red-50',
  retard:  'text-yellow-700 bg-yellow-50',
  conge:   'text-gray-600 bg-gray-100',
};

export default function PointagePage() {
  const [aujourd, setAujourd] = useState<AujourdhuiResponse | null>(null);
  const [historique, setHistorique] = useState<Pointage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPointing, setIsPointing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([pointageService.getAujourdhui(), pointageService.getHistorique()])
      .then(([auRes, hiRes]) => {
        if (cancelled) return;
        setAujourd(auRes.data as AujourdhuiResponse);
        setHistorique((hiRes.data as unknown as Pointage[]) ?? []);
      })
      .catch(() => { if (!cancelled) toast.error('Impossible de charger le pointage'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handlePointer = () => {
    if (!navigator.geolocation) { toast.error('Géolocalisation non disponible'); return; }
    setIsPointing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await pointageService.pointer(pos.coords.latitude, pos.coords.longitude);
          const data = res.data;
          toast.success(data.message ?? 'Pointage enregistré');
          setAujourd({ pointage: data.pointage });
        } catch {
          toast.error('Erreur lors du pointage');
        } finally {
          setIsPointing(false);
        }
      },
      () => { toast.error("Impossible d'obtenir votre position"); setIsPointing(false); },
    );
  };

  const pointage = aujourd?.pointage ?? null;
  const hasArrivee = !!pointage?.heure_arrivee;
  const hasDepart = !!pointage?.heure_depart;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Pointage" backHref="/enseignant/accueil" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Aujourd&apos;hui</p>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-gray-400" aria-hidden="true" />
                <span className="text-sm text-gray-600">Arrivée :</span>
                <span className="text-sm font-medium">{pointage?.heure_arrivee ?? '—'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-gray-400" aria-hidden="true" />
                <span className="text-sm text-gray-600">Départ :</span>
                <span className="text-sm font-medium">{pointage?.heure_depart ?? '—'}</span>
              </div>
              {pointage?.statut && (
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${STATUT_COLORS[pointage.statut] ?? 'text-gray-600 bg-gray-100'}`}>
                  {STATUT_LABELS[pointage.statut] ?? pointage.statut}
                </span>
              )}
            </div>
          )}
          <button
            onClick={handlePointer}
            disabled={isPointing || (hasArrivee && hasDepart)}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
          >
            <MapPin size={16} aria-hidden="true" />
            {isPointing ? 'Localisation…' : hasArrivee ? (hasDepart ? 'Journée terminée' : 'Pointer le départ') : "Pointer l'arrivée"}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <p className="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-100">Historique</p>
          {historique.length === 0 && !isLoading && (
            <p className="text-center text-gray-400 py-8 text-sm">Aucun historique</p>
          )}
          {historique.map((h) => (
            <div key={h.id} className="px-4 py-3 flex items-center justify-between border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{h.date}</p>
                <p className="text-xs text-gray-400">{h.heure_arrivee ?? '—'} → {h.heure_depart ?? '—'}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUT_COLORS[h.statut] ?? 'text-gray-600 bg-gray-100'}`}>
                  {STATUT_LABELS[h.statut] ?? h.statut}
                </span>
                {h.duree_formatee && <p className="text-xs text-gray-400 mt-0.5">{h.duree_formatee}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
