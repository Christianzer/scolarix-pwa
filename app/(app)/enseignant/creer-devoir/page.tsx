'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useEnseignantStore } from '@/stores/enseignant.store';
import { enseignantService } from '@/services/enseignant.service';
import { PageHeader } from '@/components/admin/page-header';

export default function CreerDevoirPage() {
  const router = useRouter();
  const classes = useEnseignantStore((s) => s.classes);
  const allMatieres = classes
    .flatMap((c) => c.matieres)
    .filter((m, i, arr) => arr.findIndex((a) => a.id === m.id) === i);

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [matiereId, setMatiereId] = useState<number | null>(allMatieres[0]?.id ?? null);
  const [classeId, setClasseId] = useState<number | null>(classes[0]?.id ?? null);
  const [dateLimite, setDateLimite] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !matiereId || !classeId || !dateLimite) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsSaving(true);
    try {
      await enseignantService.creerDevoir({
        titre,
        description: description || undefined,
        matiere_id: matiereId,
        classe_id: classeId,
        date_limite: dateLimite,
      });
      toast.success('Devoir créé');
      router.back();
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Créer un devoir" backHref="/enseignant/menu" />
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Titre *</label>
            <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre du devoir" aria-label="Titre" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions…" aria-label="Description" rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Matière *</label>
            <select aria-label="Matière" value={matiereId ?? ''} onChange={(e) => setMatiereId(Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
              {allMatieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Classe *</label>
            <select aria-label="Classe" value={classeId ?? ''} onChange={(e) => setClasseId(Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
              {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date limite *</label>
            <input type="date" value={dateLimite} onChange={(e) => setDateLimite(e.target.value)} aria-label="Date limite" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" required />
          </div>
        </div>
        <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50">
          {isSaving ? 'Création…' : 'Créer le devoir'}
        </button>
      </form>
    </div>
  );
}
