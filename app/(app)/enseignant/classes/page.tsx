'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useEnseignantStore } from '@/stores/enseignant.store';
import { PageHeader } from '@/components/admin/page-header';

export default function ClassesPage() {
  const classes = useEnseignantStore((s) => s.classes);
  const isLoading = useEnseignantStore((s) => s.isLoadingClasses);
  const fetchClasses = useEnseignantStore((s) => s.fetchClasses);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  return (
    <div>
      <PageHeader title="Mes classes" backHref="/enseignant/accueil" />
      <div className="p-4 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
          </div>
        )}
        {!isLoading && classes.length === 0 && (
          <p className="text-center text-gray-400 py-12">Aucune classe assignée</p>
        )}
        {!isLoading && classes.map((cls) => (
          <Link
            key={cls.id}
            href={`/enseignant/classe/${cls.id}`}
            className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{cls.nom}</p>
              {cls.departement && <p className="text-xs text-gray-400">{cls.departement}</p>}
              <p className="text-xs text-gray-500 mt-1">{cls.nb_eleves} élève{cls.nb_eleves !== 1 ? 's' : ''}</p>
              {cls.matieres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {cls.matieres.map((m) => (
                    <span key={m.id} className="text-[10px] bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">{m.nom}</span>
                  ))}
                </div>
              )}
            </div>
            <ChevronRight size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  );
}
