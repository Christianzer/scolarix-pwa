'use client';
import { useEffect } from 'react';
import { MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePointageStore } from '@/stores/pointage.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

const STATUT_LABELS: Record<string, string> = {
  present: 'Présent',
  absent: 'Absent',
  retard: 'Retard',
  conge: 'Congé',
};

const STATUT_COLORS: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-600',
  retard: 'bg-yellow-100 text-yellow-700',
  conge: 'bg-blue-100 text-blue-700',
};

export default function ChauffeurPointagePage() {
  const { pointageJour, historique, isLoading, fetchAujourdhui, fetchHistorique, pointer } = usePointageStore((s) => ({
    pointageJour: s.pointageJour,
    historique: s.historique,
    isLoading: s.isLoading,
    fetchAujourdhui: s.fetchAujourdhui,
    fetchHistorique: s.fetchHistorique,
    pointer: s.pointer,
  }));

  useEffect(() => {
    fetchAujourdhui();
    fetchHistorique();
  }, [fetchAujourdhui, fetchHistorique]);

  const handlePointer = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non disponible');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await pointer(pos.coords.latitude, pos.coords.longitude);
          toast.success(res.message);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Erreur lors du pointage';
          toast.error(msg);
        }
      },
      () => toast.error("Impossible d'obtenir votre position"),
    );
  };

  const aPointe = !!pointageJour?.heure_arrivee;
  const aFini = !!pointageJour?.heure_depart;

  return (
    <div>
      <PageHeader title="Mon pointage" />
      <div className="p-4 space-y-4">
        {/* Carte du jour */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Aujourd'hui</p>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400 mb-1">Arrivée</p>
              <p className="text-lg font-bold text-gray-900">{pointageJour?.heure_arrivee ?? '—'}</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400 mb-1">Départ</p>
              <p className="text-lg font-bold text-gray-900">{pointageJour?.heure_depart ?? '—'}</p>
            </div>
          </div>

          {!aPointe ? (
            <Button
              className="w-full bg-[#2B3D88] hover:bg-[#1a255e]"
              onClick={handlePointer}
              disabled={isLoading}
              aria-label="Pointer l'arrivée"
            >
              <MapPin size={16} className="mr-2" aria-hidden="true" />
              Pointer l'arrivée
            </Button>
          ) : !aFini ? (
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={handlePointer}
              disabled={isLoading}
              aria-label="Pointer le départ"
            >
              <Clock size={16} className="mr-2" aria-hidden="true" />
              Pointer le départ
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-600 py-2">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span className="text-sm font-medium">Journée terminée · {pointageJour.duree_formatee}</span>
            </div>
          )}
        </div>

        {/* Historique */}
        {historique.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-800">Historique</span>
            </div>
            {historique.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(h.date)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {h.heure_arrivee ?? '—'} → {h.heure_depart ?? '—'}
                    {h.duree_formatee ? ` · ${h.duree_formatee}` : ''}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUT_COLORS[h.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUT_LABELS[h.statut] ?? h.statut}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
