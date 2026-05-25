'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useDevoirsStore } from '@/stores/devoirs.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { Devoir } from '@/types/devoirs';

export default function EleveDevoirsPage() {
  const { devoirs, isLoading, isSoumettant, fetchDevoirs, soumettre } = useDevoirsStore((s) => ({
    devoirs: s.devoirs,
    isLoading: s.isLoading,
    isSoumettant: s.isSoumettant,
    fetchDevoirs: s.fetchDevoirs,
    soumettre: s.soumettre,
  }));
  const [selected, setSelected] = useState<Devoir | null>(null);
  const [contenu, setContenu] = useState('');

  useEffect(() => { fetchDevoirs(); }, [fetchDevoirs]);

  const handleSoumettre = async () => {
    if (!selected) return;
    const ok = await soumettre(selected.id, contenu);
    if (ok) {
      toast.success('Devoir soumis avec succès');
      setSelected(null);
      setContenu('');
    } else {
      toast.error('Erreur lors de la soumission');
    }
  };

  return (
    <div>
      <PageHeader title="Devoirs" />
      {isLoading && devoirs.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      ) : devoirs.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucun devoir</p>
      ) : (
        <div className="p-4 space-y-3">
          {devoirs.map((d) => (
            <div key={d.id} className="bg-white rounded-xl shadow-sm px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{d.titre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.matiere}</p>
                  {d.description && <p className="text-xs text-gray-600 mt-1">{d.description}</p>}
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={11} className="text-gray-400" aria-hidden="true" />
                    <p className="text-[11px] text-gray-400">{d.date_limite}</p>
                  </div>
                </div>
                {d.fait ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                    <CheckCircle2 size={12} aria-hidden="true" />
                    Rendu
                  </span>
                ) : (
                  <Button
                    size="sm"
                    className="bg-[#2B3D88] hover:bg-[#1a255e] shrink-0"
                    onClick={() => { setSelected(d); setContenu(''); }}
                  >
                    Soumettre
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Soumettre — {selected?.titre}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Votre réponse (optionnel)…"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={5}
            aria-label="Contenu de la soumission"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Annuler</Button>
            <Button
              className="bg-[#2B3D88] hover:bg-[#1a255e]"
              onClick={handleSoumettre}
              disabled={isSoumettant}
              aria-label="Confirmer la soumission"
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
