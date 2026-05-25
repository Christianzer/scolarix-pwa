'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { toast } from 'sonner';
import { getInitiales } from '@/lib/format';
import { RefreshCw } from 'lucide-react';

interface PointageItem {
  id: number; user_id: number; nom_complet: string; role: string; avatar_url: string | null;
  heure_arrivee: string | null; heure_depart: string | null; statut: string; duree_formatee: string | null;
}
interface PointageStats { presents: number; retards: number; absents: number; total_staff: number; }

const ROLE_LABELS: Record<string, string> = {
  enseignant: 'Enseignant', admin1: 'Admin', admin2: 'Admin', surveillant: 'Surveillant',
  comptable: 'Comptable', secretaire: 'Secrétaire', chauffeur: 'Chauffeur',
};

export default function PointagePage() {
  const [items, setItems] = useState<PointageItem[]>([]);
  const [stats, setStats] = useState<PointageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getPointagesAujourdhui();
      setItems(res.data);
      setStats(res.stats);
    } catch {
      toast.error('Impossible de charger le pointage');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Pointage du jour" backHref="/admin/menu" />
      <div className="p-4 space-y-4">
        {stats && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Présents', value: stats.presents, color: 'text-green-700' },
              { label: 'Retards', value: stats.retards, color: 'text-yellow-600' },
              { label: 'Absents', value: stats.absents, color: 'text-red-600' },
              { label: 'Total', value: stats.total_staff, color: 'text-blue-700' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => void load()} disabled={isLoading}
          className="flex items-center gap-2 text-sm text-blue-600 font-medium disabled:opacity-50" aria-label="Actualiser le pointage">
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
          Actualiser
        </button>
        {isLoading && !items.length && (
          <div className="flex justify-center py-12">
            <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
          </div>
        )}
        {!isLoading && items.length === 0 && (
          <div className="text-center text-gray-400 py-12">Aucun pointage aujourd'hui</div>
        )}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0" aria-hidden="true">
                {getInitiales(item.nom_complet)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{item.nom_complet}</p>
                <p className="text-xs text-gray-500">{ROLE_LABELS[item.role] ?? item.role}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-medium text-gray-700">
                  {item.heure_arrivee ?? '—'}{item.heure_depart ? ` → ${item.heure_depart}` : ''}
                </p>
                <div className="mt-1"><StatusBadge status={item.statut} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
