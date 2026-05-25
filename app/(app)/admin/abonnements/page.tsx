'use client';

import { useEffect, useState } from 'react';
import { abonnementAdminService, type AbonnementAdmin, type StatutAbonnement, type TypeAbonnement } from '@/services/abonnement-admin.service';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { toast } from 'sonner';
import { formatMontant, formatDate } from '@/lib/format';

const TYPE_LABELS: Record<TypeAbonnement, string> = {
  scolarite: 'Scolarité', renforcement: 'Renforcement', extra_scolaire: 'Extra-scolaire',
  cantine: 'Cantine', transport: 'Transport', garderie: 'Garderie',
};

const STATUT_FILTRES: { key: StatutAbonnement | 'tous'; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'actif', label: 'Actifs' },
  { key: 'suspendu', label: 'Suspendus' },
  { key: 'annule', label: 'Annulés' },
  { key: 'expire', label: 'Expirés' },
];

export default function AbonnementsPage() {
  const [items, setItems] = useState<AbonnementAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statutFilter, setStatutFilter] = useState<StatutAbonnement | 'tous'>('tous');
  const [acting, setActing] = useState<number | null>(null);

  async function load(statut?: StatutAbonnement) {
    setIsLoading(true);
    try {
      const res = await abonnementAdminService.getAll(statut ? { statut } : {});
      setItems(res.data);
    } catch {
      toast.error('Impossible de charger les abonnements');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load(statutFilter === 'tous' ? undefined : statutFilter);
  }, [statutFilter]);

  async function handleAction(id: number, action: 'suspendre' | 'reactiver' | 'annuler') {
    setActing(id);
    try {
      let updated: AbonnementAdmin;
      if (action === 'suspendre') updated = await abonnementAdminService.suspendre(id);
      else if (action === 'reactiver') updated = await abonnementAdminService.reactiver(id);
      else updated = await abonnementAdminService.annuler(id);
      setItems((prev) => prev.map((a) => a.id === id ? { ...a, ...updated } : a));
      toast.success(action === 'suspendre' ? 'Abonnement suspendu' : action === 'reactiver' ? 'Abonnement réactivé' : 'Abonnement annulé');
    } catch {
      toast.error("Erreur lors de l'opération");
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Abonnements" backHref="/admin/menu" />

      <div className="p-4 space-y-4">
        <div role="group" aria-label="Filtrer par statut" className="flex gap-2 overflow-x-auto pb-1">
          {STATUT_FILTRES.map((f) => (
            <button key={f.key} onClick={() => setStatutFilter(f.key)} aria-pressed={statutFilter === f.key}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statutFilter === f.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="text-center text-gray-400 py-8">Aucun abonnement</div>
        )}

        <div className="space-y-3">
          {items.map((ab) => (
            <div key={ab.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{ab.eleve_nom ?? '—'}</p>
                  <p className="text-xs text-gray-500">{ab.classe_nom ?? '—'} · {ab.matricule ?? '—'}</p>
                </div>
                <StatusBadge status={ab.statut} />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 font-medium">
                  {TYPE_LABELS[ab.type]}{ab.libelle ? ` — ${ab.libelle}` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span className="font-semibold text-gray-900">{formatMontant(ab.montant_mensuel)}/mois</span>
                <span>{formatDate(ab.date_debut ?? '')}{ab.date_fin ? ` → ${formatDate(ab.date_fin)}` : ''}</span>
              </div>

              <div className="flex gap-2">
                {ab.statut === 'actif' && (
                  <>
                    <button onClick={() => void handleAction(ab.id, 'suspendre')} disabled={acting === ab.id}
                      className="flex-1 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-lg font-medium disabled:opacity-50">
                      Suspendre
                    </button>
                    <button onClick={() => void handleAction(ab.id, 'annuler')} disabled={acting === ab.id}
                      className="flex-1 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg font-medium disabled:opacity-50">
                      Annuler
                    </button>
                  </>
                )}
                {ab.statut === 'suspendu' && (
                  <button onClick={() => void handleAction(ab.id, 'reactiver')} disabled={acting === ab.id}
                    className="flex-1 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg font-medium disabled:opacity-50">
                    Réactiver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
