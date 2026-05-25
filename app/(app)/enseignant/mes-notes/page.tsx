'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useEnseignantStore } from '@/stores/enseignant.store';
import { enseignantService } from '@/services/enseignant.service';
import { PageHeader } from '@/components/admin/page-header';

const PERIODES = ['1er Trimestre', '2ème Trimestre', '3ème Trimestre'];

interface NoteEntry { id: number; eleve_id: number; valeur: number; nom_complet?: string; }

export default function MesNotesPage() {
  const classes = useEnseignantStore((s) => s.classes);
  const elevesByClasse = useEnseignantStore((s) => s.elevesByClasse);
  const fetchElevesClasse = useEnseignantStore((s) => s.fetchElevesClasse);

  const [classeId, setClasseId] = useState<number | null>(null);
  const [matiereId, setMatiereId] = useState<number | null>(null);
  const [periode, setPeriode] = useState('1er Trimestre');
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const classe = classes.find((c) => c.id === classeId);
  const eleves = classeId ? (elevesByClasse[classeId] ?? []) : [];

  const handleClasseChange = async (id: number | null) => {
    setClasseId(id);
    setNotes([]);
    if (!id) return;
    await fetchElevesClasse(id);
    const cls = classes.find((c) => c.id === id);
    if (cls?.matieres.length) setMatiereId(cls.matieres[0].id);
  };

  const handleSearch = async () => {
    if (!classeId || !matiereId) return;
    setIsLoading(true);
    try {
      const res = await enseignantService.getNotesClasse(classeId, { matiere_id: matiereId, periode });
      setNotes(
        res.notes.map((n) => ({
          ...n,
          nom_complet: eleves.find((e) => e.id === n.eleve_id)?.nom_complet,
        })),
      );
    } catch {
      toast.error('Impossible de charger les notes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Mes notes" backHref="/enseignant/accueil" />
      <div className="p-4 space-y-3">
        <select
          aria-label="Classe"
          value={classeId ?? ''}
          onChange={(e) => handleClasseChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Choisir une classe…</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>

        {classe && (
          <>
            <select
              aria-label="Matière"
              value={matiereId ?? ''}
              onChange={(e) => setMatiereId(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              {classe.matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
            <select
              aria-label="Période"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              {PERIODES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white rounded-xl py-2.5 font-semibold text-sm"
            >
              Afficher les notes
            </button>
          </>
        )}

        {isLoading && (
          <div className="flex justify-center py-8">
            <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
          </div>
        )}

        {!isLoading && notes.length === 0 && classeId && (
          <p className="text-center text-gray-400 py-8">Aucune note trouvée</p>
        )}

        {!isLoading && notes.map((note) => (
          <div key={note.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{note.nom_complet ?? `Élève #${note.eleve_id}`}</p>
              <p className="text-xs text-gray-400">{periode}</p>
            </div>
            <span className="text-xl font-bold text-[#2B3D88]">
              {note.valeur}<span className="text-sm text-gray-400">/20</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
