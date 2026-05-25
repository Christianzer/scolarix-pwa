'use client';
import { useEffect } from 'react';
import { useEleveStore } from '@/stores/eleve.store';
import { PageHeader } from '@/components/admin/page-header';

const JOURS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function EleveCoursPage() {
  const { cours, isLoadingCours, fetchCours, classe } = useEleveStore((s) => ({
    cours: s.cours,
    isLoadingCours: s.isLoadingCours,
    fetchCours: s.fetchCours,
    classe: s.classe,
  }));

  useEffect(() => { fetchCours(); }, [fetchCours]);

  const grouped = JOURS_ORDER.reduce<Record<string, typeof cours>>((acc, jour) => {
    const items = cours.filter((c) => c.jour === jour);
    if (items.length) acc[jour] = items;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Emploi du temps" subtitle={classe ?? undefined} />
      {isLoadingCours && cours.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      ) : cours.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucun cours disponible</p>
      ) : (
        <div className="p-4 space-y-4">
          {Object.entries(grouped).map(([jour, items]) => (
            <div key={jour} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <span className="text-sm font-semibold text-[#2B3D88]">{jour}</span>
              </div>
              {items.map((c) => (
                <div key={c.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="text-center min-w-[48px]">
                    <p className="text-xs font-medium text-gray-900">{c.heure_debut}</p>
                    <p className="text-[10px] text-gray-400">{c.heure_fin}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{c.matiere}</p>
                    {c.enseignant && <p className="text-xs text-gray-400 truncate">{c.enseignant}</p>}
                    {c.salle && <p className="text-xs text-gray-400">{c.salle}</p>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
