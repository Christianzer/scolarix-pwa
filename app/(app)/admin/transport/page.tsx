'use client';

import { useEffect, useState } from 'react';
import { getBusList, getStats, type Bus, type TransportStats } from '@/services/transport.service';
import { PageHeader } from '@/components/admin/page-header';
import { toast } from 'sonner';
import { Bus as BusIcon, Users, Navigation } from 'lucide-react';

export default function TransportPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [stats, setStats] = useState<TransportStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([getBusList(true), getStats()])
      .then(([busList, s]) => {
        if (cancelled) return;
        setBuses(busList);
        setStats(s);
      })
      .catch(() => { if (!cancelled) toast.error('Impossible de charger les données transport'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Transport" backHref="/admin/menu" />
      <div className="p-4 space-y-4">
        {stats && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Élèves', value: stats.total_eleves, icon: Users },
              { label: 'Bus actifs', value: stats.total_bus_actifs, icon: BusIcon },
              { label: 'Pointages', value: stats.pointages_today, icon: Navigation },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white rounded-xl p-3 shadow-sm text-center">
                <Icon size={16} className="text-blue-600 mx-auto mb-1" aria-hidden="true" />
                <p className="text-lg font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        )}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
          </div>
        )}
        {!isLoading && buses.length === 0 && <div className="text-center text-gray-400 py-8">Aucun bus actif</div>}
        <div className="space-y-3">
          {buses.map((bus) => {
            const pct = bus.capacite && bus.eleves_count != null ? Math.round((bus.eleves_count / bus.capacite) * 100) : 0;
            return (
              <div key={bus.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{bus.nom}</p>
                    {bus.immatriculation && <p className="text-xs text-gray-500">{bus.immatriculation}</p>}
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">Actif</span>
                </div>
                {bus.chauffeur_nom && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="text-gray-400">Chauffeur : </span>{bus.chauffeur_nom}
                    {bus.chauffeur_telephone && <span className="text-gray-400"> · {bus.chauffeur_telephone}</span>}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar"
                    aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Occupation : ${pct}%`}>
                    <div className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{bus.eleves_count ?? 0}/{bus.capacite ?? '?'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
