'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useParentStore } from '@/stores/parent.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/format';
import type { AbsenceEleve } from '@/types/eleve';

const PERIODE_LABELS: Record<string, string> = {
  trimestre1: 'T1', trimestre2: 'T2', trimestre3: 'T3',
};

type Tab = 'notes' | 'absences' | 'cours';

export default function ParentEnfantDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { enfantSelectionne, isLoadingDetail, isJustifiant, fetchEnfantDetail, justifierAbsence, deselectionnerEnfant } = useParentStore((s) => ({
    enfantSelectionne: s.enfantSelectionne,
    isLoadingDetail: s.isLoadingDetail,
    isJustifiant: s.isJustifiant,
    fetchEnfantDetail: s.fetchEnfantDetail,
    justifierAbsence: s.justifierAbsence,
    deselectionnerEnfant: s.deselectionnerEnfant,
  }));
  const [tab, setTab] = useState<Tab>('notes');
  const [selectedAbsence, setSelectedAbsence] = useState<AbsenceEleve | null>(null);
  const [justification, setJustification] = useState('');

  useEffect(() => {
    if (!isNaN(id)) fetchEnfantDetail(id);
    return () => { deselectionnerEnfant(); };
  }, [id, fetchEnfantDetail, deselectionnerEnfant]);

  const handleJustifier = async () => {
    if (!selectedAbsence) return;
    const ok = await justifierAbsence(selectedAbsence.id, justification);
    if (ok) {
      toast.success('Absence justifiée');
      setSelectedAbsence(null);
      setJustification('');
    } else {
      toast.error('Erreur lors de la justification');
    }
  };

  if (isLoadingDetail) {
    return (
      <div>
        <PageHeader title="Détail élève" backHref="/parent/accueil" />
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      </div>
    );
  }

  if (!enfantSelectionne) {
    return (
      <div>
        <PageHeader title="Élève" backHref="/parent/accueil" />
        <p className="text-center text-sm text-gray-400 py-16">Élève introuvable</p>
      </div>
    );
  }

  const e = enfantSelectionne;

  return (
    <div>
      <PageHeader title={e.nom_complet} backHref="/parent/accueil" subtitle={e.classe ?? undefined} />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
        {(['notes', 'absences', 'cours'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${
              tab === t ? 'text-[#2B3D88] border-b-2 border-[#2B3D88]' : 'text-gray-400'
            }`}
            aria-selected={tab === t}
          >
            {t === 'notes' ? 'Notes' : t === 'absences' ? 'Absences' : 'Cours'}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'notes' && (
          <div className="space-y-3">
            {e.notes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucune note</p>
            ) : e.notes.map((nm) => (
              <div key={nm.matiere_id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">{nm.matiere}</span>
                  <span className="text-xs text-gray-400">Coef. {nm.coefficient}</span>
                </div>
                {nm.periodes.map((p) => (
                  <div key={p.periode} className="flex items-center justify-between px-4 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-600">{PERIODE_LABELS[p.periode] ?? p.periode}</span>
                    {p.moyenne !== null && (
                      <span className={`text-sm font-bold ${p.moyenne >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                        {p.moyenne}/20
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === 'absences' && (
          <div className="space-y-2">
            {e.absences.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucune absence</p>
            ) : e.absences.map((a) => (
              <div key={a.id} className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{formatDate(a.date)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.type === 'retard' ? 'Retard' : 'Absence'}
                    {a.matiere && ` · ${a.matiere}`}
                  </p>
                </div>
                {a.justifiee ? (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">Justifiée</span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[#2B3D88] border-[#2B3D88] shrink-0"
                    onClick={() => { setSelectedAbsence(a); setJustification(''); }}
                    aria-label={`Justifier l'absence du ${a.date}`}
                  >
                    Justifier
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'cours' && (
          <div className="space-y-2">
            {e.cours.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucun cours</p>
            ) : e.cours.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-start gap-3">
                <div className="text-center min-w-[48px]">
                  <p className="text-xs font-medium text-gray-900">{c.heure_debut}</p>
                  <p className="text-[10px] text-gray-400">{c.heure_fin}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.matiere}</p>
                  <p className="text-xs text-gray-400">{c.jour}{c.salle ? ` · ${c.salle}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedAbsence} onOpenChange={(open) => { if (!open) setSelectedAbsence(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justifier l'absence</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Motif de l'absence (optionnel)…"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={4}
            aria-label="Justification de l'absence"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAbsence(null)}>Annuler</Button>
            <Button
              className="bg-[#2B3D88] hover:bg-[#1a255e]"
              onClick={handleJustifier}
              disabled={isJustifiant}
              aria-label="Confirmer la justification"
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
