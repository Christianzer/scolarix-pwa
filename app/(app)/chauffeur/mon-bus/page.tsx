'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { chauffeurService } from '@/services/chauffeur.service';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import type { Bus, EleveBusItem } from '@/services/transport.service';

export default function ChauffeurMonBusPage() {
  const [bus, setBus] = useState<Bus | null>(null);
  const [eleves, setEleves] = useState<EleveBusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pointing, setPointing] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    chauffeurService.getBus().then(async (b) => {
      if (cancelled || !b) { setIsLoading(false); return; }
      setBus(b);
      const list = await chauffeurService.getEleves(b.id);
      if (!cancelled) { setEleves(list); setIsLoading(false); }
    }).catch(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handlePointer = async (eleve: EleveBusItem, sens: 'montee' | 'descente') => {
    if (!bus) return;
    setPointing(eleve.eleve_id);
    try {
      await chauffeurService.pointerEleve(bus.id, eleve.eleve_id, sens);
      setEleves((prev) =>
        prev.map((e) =>
          e.eleve_id === eleve.eleve_id
            ? {
                ...e,
                pointe_montee: sens === 'montee' ? true : e.pointe_montee,
                pointe_descente: sens === 'descente' ? true : e.pointe_descente,
              }
            : e
        )
      );
      toast.success(`${eleve.nom} — ${sens === 'montee' ? 'montée' : 'descente'} enregistrée`);
    } catch {
      toast.error('Erreur lors du pointage');
    } finally {
      setPointing(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={bus ? bus.nom : 'Mon bus'}
        subtitle={bus ? `Capacité : ${bus.capacite} · ${eleves.length} élève${eleves.length !== 1 ? 's' : ''}` : undefined}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      ) : !bus ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucun bus assigné</p>
      ) : eleves.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucun élève inscrit</p>
      ) : (
        <div className="p-4 space-y-2">
          {eleves.map((e) => (
            <div key={e.eleve_id} className="bg-white rounded-xl shadow-sm px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{e.nom}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.classe ?? e.matricule}</p>
                  {e.arret && <p className="text-xs text-gray-400">Arrêt : {e.arret}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {e.pointe_montee ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                      <CheckCircle2 size={12} aria-hidden="true" />
                      Monté
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[#2B3D88] border-[#2B3D88] text-xs"
                      disabled={pointing === e.eleve_id}
                      onClick={() => handlePointer(e, 'montee')}
                      aria-label={`Pointer montée de ${e.nom}`}
                    >
                      Montée
                    </Button>
                  )}
                  {e.pointe_descente ? (
                    <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full font-medium">
                      <CheckCircle2 size={12} aria-hidden="true" />
                      Descendu
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-500 border-orange-300 text-xs"
                      disabled={pointing === e.eleve_id}
                      onClick={() => handlePointer(e, 'descente')}
                      aria-label={`Pointer descente de ${e.nom}`}
                    >
                      Descente
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
