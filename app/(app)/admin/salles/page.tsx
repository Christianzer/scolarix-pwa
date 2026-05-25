'use client';

import { useEffect, useState } from 'react';
import { salleService, type Salle } from '@/services/salle.service';
import { PageHeader } from '@/components/admin/page-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const TYPES_SALLE = ['Classe', 'Laboratoire', 'Salle de réunion', 'Bibliothèque', 'Amphithéâtre', 'Autre'];

interface SalleForm { nom: string; type: string; capacite: string; description: string; actif: boolean; }
const defaultForm: SalleForm = { nom: '', type: '', capacite: '', description: '', actif: true };

export default function SallesPage() {
  const [salles, setSalles] = useState<Salle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Salle | null>(null);
  const [form, setForm] = useState<SalleForm>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const data = await salleService.getAll();
      setSalles(data);
    } catch {
      toast.error('Impossible de charger les salles');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function openCreate() { setEditTarget(null); setForm(defaultForm); setShowDialog(true); }
  function openEdit(s: Salle) {
    setEditTarget(s);
    setForm({ nom: s.nom, type: s.type ?? '', capacite: s.capacite != null ? String(s.capacite) : '', description: s.description ?? '', actif: s.actif });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.nom.trim()) { toast.error('Le nom est requis'); return; }
    setIsSaving(true);
    const payload = { nom: form.nom.trim(), type: form.type || null, capacite: form.capacite ? parseInt(form.capacite, 10) : null, description: form.description || null, actif: form.actif };
    try {
      if (editTarget) { await salleService.update(editTarget.id, payload); toast.success('Salle mise à jour'); }
      else { await salleService.create(payload); toast.success('Salle créée'); }
      setShowDialog(false);
      await load();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await salleService.delete(id);
      toast.success('Salle supprimée');
      setSalles((prev) => prev.filter((s) => s.id !== id));
      setConfirmDelete(null);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Salles" backHref="/admin/menu" />
      <div className="p-4 space-y-3">
        <button onClick={openCreate} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3 font-semibold">
          <Plus size={18} aria-hidden="true" />
          Ajouter une salle
        </button>
        {isLoading && (
          <div className="flex justify-center py-8">
            <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
          </div>
        )}
        {!isLoading && salles.length === 0 && <div className="text-center text-gray-400 py-8">Aucune salle</div>}
        {salles.map((s) => (
          <div key={s.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{s.nom}</p>
                <p className="text-xs text-gray-500">{s.type ?? 'Sans type'}{s.capacite != null ? ` · ${s.capacite} places` : ''}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${s.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {s.actif ? 'Actif' : 'Inactif'}
                </span>
                <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600" aria-label={`Modifier ${s.nom}`}>
                  <Pencil size={14} aria-hidden="true" />
                </button>
                {confirmDelete === s.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => void handleDelete(s.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg font-medium">Confirmer</button>
                    <button onClick={() => setConfirmDelete(null)} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-lg font-medium">Annuler</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600" aria-label={`Supprimer ${s.nom}`}>
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTarget ? 'Modifier la salle' : 'Nouvelle salle'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="salle-nom" className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input id="salle-nom" type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex. Salle A" />
            </div>
            <div>
              <label htmlFor="salle-type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select id="salle-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Sans type —</option>
                {TYPES_SALLE.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="salle-capacite" className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
              <input id="salle-capacite" type="number" inputMode="numeric" value={form.capacite} onChange={(e) => setForm({ ...form, capacite: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nombre de places" />
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="salle-actif" className="text-sm font-medium text-gray-700">Actif</label>
              <button id="salle-actif" role="switch" aria-checked={form.actif} onClick={() => setForm({ ...form, actif: !form.actif })}
                className={`relative w-10 h-6 rounded-full transition-colors ${form.actif ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.actif ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            <button onClick={() => void handleSave()} disabled={isSaving || !form.nom.trim()}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50">
              {isSaving ? 'Sauvegarde…' : editTarget ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
