'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useEnseignantStore } from '@/stores/enseignant.store';
import { PageHeader } from '@/components/admin/page-header';

const PERIODES = ['1er Trimestre', '2ème Trimestre', '3ème Trimestre'];
const TYPES = ['contrôle', 'devoir', 'examen'];

export default function SaisieNotesPage() {
  const searchParams = useSearchParams();
  const preClasse = searchParams.get('classe');

  const classes = useEnseignantStore((s) => s.classes);
  const elevesByClasse = useEnseignantStore((s) => s.elevesByClasse);
  const isLoadingEleves = useEnseignantStore((s) => s.isLoadingEleves);
  const isSaving = useEnseignantStore((s) => s.isSaving);
  const fetchElevesClasse = useEnseignantStore((s) => s.fetchElevesClasse);
  const saisirNotes = useEnseignantStore((s) => s.saisirNotes);

  const [classeId, setClasseId] = useState<number | null>(preClasse ? Number(preClasse) : null);
  const [matiereId, setMatiereId] = useState<number | null>(null);
  const [periode, setPeriode] = useState('1er Trimestre');
  const [type, setType] = useState('contrôle');
  const [notes, setNotes] = useState<Record<number, string>>({});

  const classe = classes.find((c) => c.id === classeId);
  const eleves = classeId ? (elevesByClasse[classeId] ?? []) : [];

  useEffect(() => {
    if (classeId) fetchElevesClasse(classeId);
  }, [classeId, fetchElevesClasse]);

  useEffect(() => {
    if (classe?.matieres.length) setMatiereId(classe.matieres[0].id);
  }, [classe]);

  const handleSubmit = async () => {
    if (!classeId || !matiereId) return;
    const payload = eleves
      .filter((e) => notes[e.id] !== undefined && notes[e.id] !== '')
      .map((e) => ({ eleve_id: e.id, valeur: Number(notes[e.id]) }));
    if (!payload.length) { toast.error('Aucune note saisie'); return; }
    try {
      const count = await saisirNotes(matiereId, periode, type, payload);
      toast.success(`${count} note${count > 1 ? 's' : ''} enregistrée${count > 1 ? 's' : ''}`);
      setNotes({});
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Saisir les notes" backHref="/enseignant/accueil" />
      <div className="p-4 space-y-3 flex-1">
        <select
          aria-label="Classe"
          value={classeId ?? ''}
          onChange={(e) => { setClasseId(e.target.value ? Number(e.target.value) : null); setNotes({}); }}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Choisir une classe…</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>

        {classe && (
          <>
            <select aria-label="Matière" value={matiereId ?? ''} onChange={(e) => setMatiereId(Number(e.target.value))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
              {classe.matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
            <div className="flex gap-2">
              <select aria-label="Période" value={periode} onChange={(e) => setPeriode(e.target.value)} className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
                {PERIODES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)} className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {isLoadingEleves && (
              <div className="flex justify-center py-8">
                <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
              </div>
            )}
            {!isLoadingEleves && eleves.map((eleve) => (
              <div key={eleve.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{eleve.nom_complet}</p>
                  <p className="text-xs text-gray-400">{eleve.matricule}</p>
                </div>
                <input
                  type="number" min="0" max="20" step="0.5"
                  aria-label={`Note de ${eleve.nom_complet}`}
                  value={notes[eleve.id] ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [eleve.id]: e.target.value }))}
                  className="w-20 text-center rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                  placeholder="/20"
                />
              </div>
            ))}
          </>
        )}
      </div>

      {classeId && eleves.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <button onClick={handleSubmit} disabled={isSaving} className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50">
            {isSaving ? 'Enregistrement…' : 'Enregistrer les notes'}
          </button>
        </div>
      )}
    </div>
  );
}
