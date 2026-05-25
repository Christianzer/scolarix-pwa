'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, BookOpen } from 'lucide-react';
import { useElearningStore } from '@/stores/elearning.store';
import { PageHeader } from '@/components/admin/page-header';

export default function EleveElearningPage() {
  const { cours, isLoading, fetchCours } = useElearningStore((s) => ({
    cours: s.cours,
    isLoading: s.isLoading,
    fetchCours: s.fetchCours,
  }));

  useEffect(() => { fetchCours(); }, [fetchCours]);

  return (
    <div>
      <PageHeader title="E-learning" />
      {isLoading && cours.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      ) : cours.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucun cours disponible</p>
      ) : (
        <div className="p-4 space-y-3">
          {cours.map((c) => (
            <Link
              key={c.id}
              href={`/eleve/cours-en-ligne/${c.id}`}
              className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors block"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-[#2B3D88]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.titre}</p>
                  {c.complete && (
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" aria-label="Terminé" />
                  )}
                </div>
                {c.matiere && <p className="text-xs text-gray-400 mt-0.5">{c.matiere}</p>}
                {c.enseignant && <p className="text-xs text-gray-400">{c.enseignant}</p>}
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2B3D88] rounded-full transition-all"
                      style={{ width: `${c.completion_percentage}%` }}
                      role="progressbar"
                      aria-valuenow={c.completion_percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progression : ${c.completion_percentage}%`}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
