'use client';
import { useEffect } from 'react';
import { useEleveStore } from '@/stores/eleve.store';
import { PageHeader } from '@/components/admin/page-header';
import { formatDate } from '@/lib/format';

export default function EleveAbsencesPage() {
  const { absences, isLoadingAbsences, fetchAbsences } = useEleveStore((s) => ({
    absences: s.absences,
    isLoadingAbsences: s.isLoadingAbsences,
    fetchAbsences: s.fetchAbsences,
  }));

  useEffect(() => { fetchAbsences(); }, [fetchAbsences]);

  return (
    <div>
      <PageHeader title="Mes absences" />
      {isLoadingAbsences && absences.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      ) : absences.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucune absence enregistrée</p>
      ) : (
        <div className="p-4 space-y-2">
          {absences.map((a) => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{formatDate(a.date)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {a.type === 'retard' ? 'Retard' : 'Absence'}
                  {a.matiere && ` · ${a.matiere}`}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                a.justifiee ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                {a.justifiee ? 'Justifiée' : 'Non justifiée'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
