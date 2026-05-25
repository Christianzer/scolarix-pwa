'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MessageCircle, CreditCard, X } from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatMontant, getInitiales } from '@/lib/format';
import type { EleveAdminDetail } from '@/types/admin';

export default function ElevesPage() {
  const router = useRouter();
  const {
    eleves, eleveMeta, eleveDetail, isLoadingEleves, isLoadingDetail,
    fetchEleves, fetchEleveDetail, clearDetail,
  } = useAdminStore((s) => s);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    fetchEleves({ page: 1 });
  }, [fetchEleves]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchEleves({ page: 1, search: value || undefined });
    }, 300);
  }, [fetchEleves]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchEleves({ page: next, search: search || undefined });
  };

  const hasMore = eleveMeta ? page < eleveMeta.last_page : false;

  return (
    <div>
      <PageHeader title="Élèves" subtitle={eleveMeta ? `${eleveMeta.total} élèves` : undefined} />

      <div className="p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <Input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Rechercher un élève…"
            className="pl-9"
            aria-label="Rechercher un élève"
          />
          {search && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Effacer la recherche">
              <X size={14} className="text-gray-400" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Liste */}
        {isLoadingEleves && eleves.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" aria-label="Chargement" />
          </div>
        ) : (
          <div className="space-y-2">
            {eleves.map(eleve => (
              <button
                key={eleve.id}
                onClick={() => fetchEleveDetail(eleve.id)}
                className="w-full bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0" aria-hidden="true">
                  <span className="text-sm font-semibold text-[#2B3D88]">{getInitiales(eleve.nom_complet)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{eleve.nom_complet}</p>
                  <p className="text-xs text-gray-400 truncate">{eleve.classe ?? '—'} · {eleve.matricule}</p>
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${eleve.actif ? 'bg-green-400' : 'bg-gray-300'}`} aria-hidden="true" />
              </button>
            ))}

            {hasMore && (
              <Button variant="outline" className="w-full" onClick={loadMore} disabled={isLoadingEleves}>
                {isLoadingEleves ? 'Chargement…' : 'Voir plus'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Dialog open={!!eleveDetail || isLoadingDetail} onOpenChange={open => { if (!open) clearDetail(); }}>
        <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fiche élève</DialogTitle>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" />
            </div>
          ) : eleveDetail ? (
            <EleveDetailContent
              eleve={eleveDetail}
              onMessage={() => { clearDetail(); router.push('/admin/messages'); }}
              onPaiements={() => { clearDetail(); router.push('/admin/paiements'); }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EleveDetailContent({
  eleve, onMessage, onPaiements,
}: { eleve: EleveAdminDetail; onMessage: () => void; onPaiements: () => void }) {
  return (
    <div className="space-y-4">
      {/* Avatar + identité */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center" aria-hidden="true">
          <span className="text-2xl font-bold text-[#2B3D88]">{getInitiales(eleve.nom_complet)}</span>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900">{eleve.nom_complet}</p>
          <p className="text-sm text-gray-400">{eleve.matricule}</p>
          <StatusBadge status={eleve.actif ? 'actif' : 'inactif'} className="mt-1" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-gray-900">{eleve.nb_absences}</p>
          <p className="text-[10px] text-gray-400">Absences</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-sm font-bold text-gray-900 truncate">{formatMontant(eleve.total_paiements)}</p>
          <p className="text-[10px] text-gray-400">Total payé</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-sm font-bold text-red-500 truncate">{formatMontant(eleve.impayes_pending)}</p>
          <p className="text-[10px] text-gray-400">Impayés</p>
        </div>
      </div>

      {/* Infos */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
        {eleve.email && <p><span className="text-gray-400">Email : </span>{eleve.email}</p>}
        {eleve.telephone && <p><span className="text-gray-400">Tél : </span>{eleve.telephone}</p>}
        {eleve.departement && <p><span className="text-gray-400">Dépt : </span>{eleve.departement}</p>}
        {eleve.date_naissance && <p><span className="text-gray-400">Né(e) : </span>{eleve.date_naissance}</p>}
      </div>

      {/* Parents */}
      {eleve.parents.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">Parents / tuteurs</p>
          {eleve.parents.map(parent => (
            <div key={parent.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
              <span className="text-gray-800">{parent.nom_complet}</span>
              <span className="text-gray-400 text-xs">{[parent.lien, parent.telephone].filter(Boolean).join(' · ')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1 gap-2" onClick={onMessage}>
          <MessageCircle size={16} aria-hidden="true" /> Message
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={onPaiements}>
          <CreditCard size={16} aria-hidden="true" /> Paiements
        </Button>
      </div>
    </div>
  );
}
