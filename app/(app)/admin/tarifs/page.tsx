'use client';

import { useEffect, useState } from 'react';
import { tarifService, type TarifScolarite, type FraisAnnexes } from '@/services/tarif.service';
import { adminService } from '@/services/admin.service';
import { PageHeader } from '@/components/admin/page-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatMontant } from '@/lib/format';
import { Plus, Trash2 } from 'lucide-react';

type StatutAffectation = 'tous' | 'affecte' | 'non_affecte';

export default function TarifsPage() {
  const [tarifs, setTarifs] = useState<TarifScolarite[]>([]);
  const [fraisAnnexes, setFraisAnnexes] = useState<FraisAnnexes | null>(null);
  const [classes, setClasses] = useState<Array<{ id: number; nom: string; departement: string | null }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingFrais, setIsSavingFrais] = useState(false);

  const [classeId, setClasseId] = useState<number | ''>('');
  const [versement, setVersement] = useState<1 | 2 | 3>(1);
  const [montant, setMontant] = useState('');
  const [statut, setStatut] = useState<StatutAffectation>('tous');
  const [echeance, setEcheance] = useState('');

  const [fraisForm, setFraisForm] = useState({
    assurance_scolaire: '', carnet_correspondance: '', carte_acces: '',
    tablier: '', tenues_sport: '',
  });

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      tarifService.getScolarite(),
      tarifService.getFraisAnnexes(),
      adminService.getClasses(),
    ])
      .then(([t, fa, cls]) => {
        if (cancelled) return;
        setTarifs(t);
        setFraisAnnexes(fa);
        setClasses(cls);
        setFraisForm({
          assurance_scolaire: String(fa.assurance_scolaire),
          carnet_correspondance: String(fa.carnet_correspondance),
          carte_acces: String(fa.carte_acces),
          tablier: String(fa.tablier),
          tenues_sport: String(fa.tenues_sport),
        });
      })
      .catch(() => {
        if (!cancelled) toast.error('Impossible de charger les tarifs');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function handleCreateTarif() {
    if (!classeId) { toast.error('Sélectionnez une classe'); return; }
    const amt = parseFloat(montant);
    if (!Number.isFinite(amt) || amt <= 0) { toast.error('Montant invalide'); return; }
    setIsSaving(true);
    try {
      await tarifService.createScolarite({
        classe_id: classeId as number,
        statut_affectation: statut,
        versement_numero: versement,
        montant: amt,
        date_echeance: echeance || null,
      });
      toast.success('Tarif créé');
      setShowCreate(false);
      const updated = await tarifService.getScolarite();
      setTarifs(updated);
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTarif(id: number) {
    try {
      await tarifService.deleteScolarite(id);
      toast.success('Tarif supprimé');
      setTarifs((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }

  async function handleSaveFrais() {
    const payload = {
      assurance_scolaire: parseFloat(fraisForm.assurance_scolaire) || 0,
      carnet_correspondance: parseFloat(fraisForm.carnet_correspondance) || 0,
      carte_acces: parseFloat(fraisForm.carte_acces) || 0,
      tablier: parseFloat(fraisForm.tablier) || 0,
      tenues_sport: parseFloat(fraisForm.tenues_sport) || 0,
    };
    setIsSavingFrais(true);
    try {
      const updated = await tarifService.updateFraisAnnexes(payload);
      setFraisAnnexes(updated);
      toast.success('Frais annexes mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSavingFrais(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Tarifs" backHref="/admin/menu" />

      <div className="p-4 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Scolarité</h2>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full font-medium">
              <Plus size={12} aria-hidden="true" />
              Ajouter
            </button>
          </div>

          {isLoading && (
            <div className="flex justify-center py-4">
              <div role="status" className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
            </div>
          )}

          {!isLoading && tarifs.length === 0 && (
            <div className="text-center text-gray-400 py-4 text-sm">Aucun tarif configuré</div>
          )}

          <div className="space-y-2">
            {tarifs.map((t) => (
              <div key={t.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t.classe_nom ?? 'Toutes classes'}</p>
                  <p className="text-xs text-gray-500">
                    Versement {t.versement_numero}{t.mois_label ? ` · ${t.mois_label}` : ''}{t.date_echeance ? ` · éch. ${t.date_echeance.slice(0, 10)}` : ''}
                  </p>
                </div>
                <p className="text-sm font-bold text-blue-700">{formatMontant(t.montant)}</p>
                <button onClick={() => void handleDeleteTarif(t.id)} className="p-1.5 text-gray-400 hover:text-red-600" aria-label="Supprimer ce tarif">
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Frais annexes</h2>
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            {[
              { key: 'assurance_scolaire', label: 'Assurance scolaire' },
              { key: 'carnet_correspondance', label: 'Carnet correspondance' },
              { key: 'carte_acces', label: "Carte d'accès" },
              { key: 'tablier', label: 'Tablier' },
              { key: 'tenues_sport', label: 'Tenues sport' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <label htmlFor={`frais-${key}`} className="flex-1 text-sm text-gray-700">{label}</label>
                <input
                  id={`frais-${key}`}
                  type="number"
                  inputMode="numeric"
                  value={fraisForm[key as keyof typeof fraisForm]}
                  onChange={(e) => setFraisForm({ ...fraisForm, [key]: e.target.value })}
                  className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            {fraisAnnexes && (
              <p className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                Total actuel : <span className="font-semibold">{formatMontant(fraisAnnexes.total)}</span>
              </p>
            )}
            <button
              onClick={() => void handleSaveFrais()}
              disabled={isSavingFrais}
              className="w-full bg-blue-600 text-white rounded-xl py-2.5 font-semibold text-sm disabled:opacity-50"
            >
              {isSavingFrais ? 'Sauvegarde…' : 'Enregistrer les frais'}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau tarif de scolarité</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="tarif-classe" className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select id="tarif-classe" value={classeId} onChange={(e) => setClasseId(Number(e.target.value) || '')}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Sélectionner —</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Versement</p>
              <div className="flex gap-2">
                {([1, 2, 3] as const).map((v) => (
                  <button key={v} onClick={() => setVersement(v)} aria-pressed={versement === v}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${versement === v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    V{v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Affectation</p>
              <div className="flex gap-2">
                {([['tous', 'Tous'], ['affecte', 'Affectés'], ['non_affecte', 'Non affectés']] as [StatutAffectation, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => setStatut(v)} aria-pressed={statut === v}
                    className={`flex-1 py-2 rounded-full text-xs font-medium transition-colors ${statut === v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="tarif-montant" className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
              <input id="tarif-montant" type="number" inputMode="numeric" value={montant} onChange={(e) => setMontant(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex. 75000" />
            </div>
            <div>
              <label htmlFor="tarif-echeance" className="block text-sm font-medium text-gray-700 mb-1">
                Date d'échéance <span className="text-gray-400 font-normal">(optionnelle)</span>
              </label>
              <input id="tarif-echeance" type="date" value={echeance} onChange={(e) => setEcheance(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => void handleCreateTarif()} disabled={isSaving || !classeId || !montant}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50">
              {isSaving ? 'Création…' : 'Créer le tarif'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
