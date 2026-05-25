'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEnseignantStore } from '@/stores/enseignant.store';
import { PageHeader } from '@/components/admin/page-header';
import { getInitiales } from '@/lib/format';

export default function ClasseDetailPage() {
  const params = useParams();
  const classeId = Number(params.id);
  const classes = useEnseignantStore((s) => s.classes);
  const elevesByClasse = useEnseignantStore((s) => s.elevesByClasse);
  const isLoadingEleves = useEnseignantStore((s) => s.isLoadingEleves);
  const fetchElevesClasse = useEnseignantStore((s) => s.fetchElevesClasse);

  const classe = classes.find((c) => c.id === classeId);
  const eleves = elevesByClasse[classeId] ?? [];

  useEffect(() => {
    if (!isNaN(classeId)) fetchElevesClasse(classeId);
  }, [classeId, fetchElevesClasse]);

  return (
    <div>
      <PageHeader title={classe?.nom ?? 'Classe'} backHref="/enseignant/classes" />
      <div className="p-4 space-y-3">
        <div className="flex gap-3">
          <Link href={`/enseignant/appel?classe=${classeId}`} className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold text-center">
            Faire l&apos;appel
          </Link>
          <Link href={`/enseignant/saisie?classe=${classeId}`} className="flex-1 bg-white border border-blue-600 text-blue-600 rounded-xl py-3 text-sm font-semibold text-center">
            Saisir les notes
          </Link>
        </div>
        {isLoadingEleves && (
          <div className="flex justify-center py-8">
            <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
          </div>
        )}
        {!isLoadingEleves && eleves.length === 0 && (
          <p className="text-center text-gray-400 py-8">Aucun élève dans cette classe</p>
        )}
        {!isLoadingEleves && eleves.map((eleve) => (
          <div key={eleve.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#2B3D88]">{getInitiales(eleve.nom_complet)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{eleve.nom_complet}</p>
              <p className="text-xs text-gray-400">{eleve.matricule}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
