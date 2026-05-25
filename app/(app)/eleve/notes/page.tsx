'use client';
import { useEffect } from 'react';
import { useEleveStore } from '@/stores/eleve.store';
import { PageHeader } from '@/components/admin/page-header';

const PERIODE_LABELS: Record<string, string> = {
  trimestre1: 'Trimestre 1',
  trimestre2: 'Trimestre 2',
  trimestre3: 'Trimestre 3',
};

export default function EleveNotesPage() {
  const { notes, isLoadingNotes, fetchNotes } = useEleveStore((s) => ({
    notes: s.notes,
    isLoadingNotes: s.isLoadingNotes,
    fetchNotes: s.fetchNotes,
  }));

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  return (
    <div>
      <PageHeader title="Mes notes" />
      {isLoadingNotes && notes.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      ) : notes.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucune note disponible</p>
      ) : (
        <div className="p-4 space-y-3">
          {notes.map((nm) => (
            <div key={nm.matiere_id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">{nm.matiere}</span>
                <span className="text-xs text-gray-400">Coef. {nm.coefficient}</span>
              </div>
              {nm.periodes.map((p) => (
                <div key={p.periode} className="px-4 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">{PERIODE_LABELS[p.periode] ?? p.periode}</span>
                    {p.moyenne !== null && (
                      <span className={`text-sm font-bold ${p.moyenne >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                        {p.moyenne}/20
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.notes.map((n) => (
                      <div key={n.id} className="bg-gray-50 rounded-lg px-2 py-1 text-center">
                        <p className="text-xs font-semibold text-gray-800">{n.valeur}/{n.bareme}</p>
                        <p className="text-[10px] text-gray-400">{n.type}</p>
                      </div>
                    ))}
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
