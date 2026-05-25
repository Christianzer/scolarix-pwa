'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { formatMontant, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const STATUT_FILTERS = [
  { label: 'Tous',       value: undefined    },
  { label: 'Validés',    value: 'valide'     },
  { label: 'En attente', value: 'en_attente' },
  { label: 'Échoués',    value: 'echoue'     },
];

const TYPE_LABELS: Record<string, string> = {
  scolarite: 'Scolarité', inscription: 'Inscription', cantine: 'Cantine',
  transport: 'Transport', autre: 'Autre',
};

const METHODE_LABELS: Record<string, string> = {
  especes: 'Espèces', mobile_money: 'Mobile Money', virement: 'Virement', cheque: 'Chèque',
};

export default function PaiementsPage() {
  const { paiements, paiementMeta, totalAujourdhui, isLoadingPaiements, fetchPaiements } = useAdminStore((s) => s);
  const [statutFiltre, setStatutFiltre] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPaiements({ page: 1 });
  }, [fetchPaiements]);

  const handleFilter = (statut: string | undefined) => {
    setStatutFiltre(statut);
    setPage(1);
    fetchPaiements({ page: 1, statut });
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPaiements({ page: next, statut: statutFiltre });
  };

  const hasMore = paiementMeta ? page < paiementMeta.last_page : false;

  return (
    <div>
      <PageHeader
        title="Paiements"
        subtitle={`${formatMontant(totalAujourdhui)} aujourd'hui`}
        action={
          <Link href="/admin/creer-paiement" aria-label="Créer un paiement">
            <Plus size={22} className="text-white" aria-hidden="true" />
          </Link>
        }
      />

      <div className="p-4 space-y-3">
        {/* Filtres statut */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="Filtrer par statut">
          {STATUT_FILTERS.map(f => (
            <button
              key={String(f.value)}
              onClick={() => handleFilter(f.value)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                statutFiltre === f.value
                  ? 'bg-[#2B3D88] text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300',
              )}
              aria-pressed={statutFiltre === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Count */}
        {paiementMeta && (
          <p className="text-xs text-gray-400">
            {paiementMeta.total} paiement{paiementMeta.total > 1 ? 's' : ''}
          </p>
        )}

        {/* Liste */}
        {isLoadingPaiements && paiements.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" aria-label="Chargement" />
          </div>
        ) : (
          <div className="space-y-2">
            {paiements.map(p => (
              <div key={p.id} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{p.eleve ?? '—'}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {TYPE_LABELS[p.type] ?? p.type} · {METHODE_LABELS[p.methode] ?? p.methode}
                      {p.reference ? ` · ${p.reference}` : ''}
                    </p>
                    {p.periode && <p className="text-xs text-gray-400">{p.periode}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gray-900">{formatMontant(p.montant)}</p>
                    <StatusBadge status={p.statut} className="mt-1" />
                  </div>
                </div>
                <p className="text-xs text-gray-300 mt-1.5">{formatDate(p.date)}</p>
              </div>
            ))}

            {hasMore && (
              <Button variant="outline" className="w-full" onClick={loadMore} disabled={isLoadingPaiements}>
                {isLoadingPaiements ? 'Chargement…' : 'Voir plus'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
