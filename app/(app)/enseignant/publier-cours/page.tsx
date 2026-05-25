'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useEnseignantStore } from '@/stores/enseignant.store';
import { elearningService } from '@/services/elearning.service';
import { PageHeader } from '@/components/admin/page-header';

export default function PublierCoursPage() {
  const router = useRouter();
  const classes = useEnseignantStore((s) => s.classes);
  const allMatieres = classes
    .flatMap((c) => c.matieres)
    .filter((m, i, arr) => arr.findIndex((a) => a.id === m.id) === i);

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [contenu, setContenu] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [matiereId, setMatiereId] = useState<number | null>(allMatieres[0]?.id ?? null);
  const [classeId, setClasseId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !matiereId) { toast.error('Titre et matière requis'); return; }
    setIsSaving(true);
    try {
      await elearningService.publierCours({
        titre,
        description: description || undefined,
        contenu: contenu || undefined,
        video_url: videoUrl || undefined,
        matiere_id: matiereId,
        classe_id: classeId ? Number(classeId) : undefined,
      });
      toast.success('Cours publié');
      router.back();
    } catch {
      toast.error('Erreur lors de la publication');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Publier un cours" backHref="/enseignant/menu" />
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Titre *</label>
            <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre du cours" aria-label="Titre" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Matière *</label>
            <select aria-label="Matière" value={matiereId ?? ''} onChange={(e) => setMatiereId(Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
              {allMatieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Classe (optionnel)</label>
            <select aria-label="Classe" value={classeId} onChange={(e) => setClasseId(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <option value="">Toutes les classes</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Résumé du cours…" aria-label="Description" rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Contenu</label>
            <textarea value={contenu} onChange={(e) => setContenu(e.target.value)} placeholder="Contenu du cours…" aria-label="Contenu" rows={4} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">URL vidéo</label>
            <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/…" aria-label="URL vidéo" type="url" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50">
          {isSaving ? 'Publication…' : 'Publier le cours'}
        </button>
      </form>
    </div>
  );
}
