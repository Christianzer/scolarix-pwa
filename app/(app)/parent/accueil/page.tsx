'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { useParentStore } from '@/stores/parent.store';
import { PageHeader } from '@/components/admin/page-header';
import { getInitiales } from '@/lib/format';

export default function ParentAccueilPage() {
  const user = useAuthStore((s) => s.user);
  const { enfants, isLoadingEnfants, fetchEnfants } = useParentStore((s) => ({
    enfants: s.enfants,
    isLoadingEnfants: s.isLoadingEnfants,
    fetchEnfants: s.fetchEnfants,
  }));

  useEffect(() => { fetchEnfants(); }, [fetchEnfants]);

  const totalAbsences = enfants.reduce((sum, e) => sum + e.nb_absences, 0);

  return (
    <div>
      <PageHeader title={`Bonjour, ${user?.prenom ?? 'Parent'}`} />
      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className="bg-white rounded-xl p-4 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{enfants.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Enfant{enfants.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-[#2B3D88] rounded-xl p-4 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-white">{totalAbsences}</p>
            <p className="text-xs text-blue-200 mt-0.5">Absence{totalAbsences !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {isLoadingEnfants && enfants.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Mes enfants</p>
            {enfants.map((e) => (
              <Link
                key={e.id}
                href={`/parent/enfant/${e.id}`}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors block"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0" aria-hidden="true">
                  <span className="text-base font-bold text-[#2B3D88]">{getInitiales(e.nom_complet)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{e.nom_complet}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.classe ?? 'Classe inconnue'}</p>
                  {e.lien && <p className="text-xs text-gray-400">{e.lien}</p>}
                </div>
                {e.nb_absences > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {e.nb_absences} abs.
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
