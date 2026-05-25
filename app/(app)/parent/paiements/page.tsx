'use client';
import { useEffect } from 'react';
import { useParentStore } from '@/stores/parent.store';
import { PageHeader } from '@/components/admin/page-header';
import { formatMontant, formatDate } from '@/lib/format';

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  valide: 'Validé',
  echec: 'Échec',
  rembourse: 'Remboursé',
};

const STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  valide: 'bg-green-100 text-green-700',
  echec: 'bg-red-100 text-red-600',
  rembourse: 'bg-blue-100 text-blue-700',
};

export default function ParentPaiementsPage() {
  const { paiements, totalPaye, isLoadingPaiements, fetchPaiements } = useParentStore((s) => ({
    paiements: s.paiements,
    totalPaye: s.totalPaye,
    isLoadingPaiements: s.isLoadingPaiements,
    fetchPaiements: s.fetchPaiements,
  }));

  useEffect(() => { fetchPaiements(); }, [fetchPaiements]);

  return (
    <div>
      <PageHeader title="Paiements" />
      <div className="p-4 space-y-4">
        <div className="bg-[#2B3D88] rounded-xl p-4 shadow-sm">
          <p className="text-xs text-blue-200 mb-1">Total payé</p>
          <p className="text-2xl font-bold text-white">{formatMontant(totalPaye)}</p>
        </div>

        {isLoadingPaiements && paiements.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
          </div>
        ) : paiements.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">Aucun paiement</p>
        ) : (
          <div className="space-y-2">
            {paiements.map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{p.type}</p>
                    {p.eleve && <p className="text-xs text-gray-400 mt-0.5">{p.eleve}</p>}
                    <p className="text-xs text-gray-400">{formatDate(p.date)} · {p.methode}</p>
                    {p.periode && <p className="text-xs text-gray-400">{p.periode}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{formatMontant(p.montant)}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${STATUT_COLORS[p.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUT_LABELS[p.statut] ?? p.statut}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
