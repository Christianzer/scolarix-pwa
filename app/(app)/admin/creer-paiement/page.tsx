'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/admin.store';
import { adminService } from '@/services/admin.service';
import { PageHeader } from '@/components/admin/page-header';
import { toast } from 'sonner';
import { formatMontant } from '@/lib/format';
import { Search, X } from 'lucide-react';
import type { EleveAdmin } from '@/types/admin';

const TYPES = ['scolarite', 'cantine', 'transport', 'fournitures', 'activite', 'autre'];
const METHODES = ['especes', 'mobile_money', 'virement', 'cheque', 'autre'];
const STATUTS = ['valide', 'en_attente', 'echoue'];

const TYPE_LABELS: Record<string, string> = {
  scolarite: 'Scolarité', cantine: 'Cantine', transport: 'Transport',
  fournitures: 'Fournitures', activite: 'Activité', autre: 'Autre',
};
const METHODE_LABELS: Record<string, string> = {
  especes: 'Espèces', mobile_money: 'Mobile Money', virement: 'Virement',
  cheque: 'Chèque', autre: 'Autre',
};
const STATUT_LABELS: Record<string, string> = {
  valide: 'Validé', en_attente: 'En attente', echoue: 'Échoué',
};

export default function CreerPaiementPage() {
  const router = useRouter();
  const eleves = useAdminStore((s) => s.eleves);
  const isLoadingEleves = useAdminStore((s) => s.isLoadingEleves);
  const fetchEleves = useAdminStore((s) => s.fetchEleves);

  const [search, setSearch] = useState('');
  const [selectedEleve, setSelectedEleve] = useState<EleveAdmin | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [type, setType] = useState('scolarite');
  const [methode, setMethode] = useState('especes');
  const [statut, setStatut] = useState('valide');
  const [montant, setMontant] = useState('');
  const [periode, setPeriode] = useState('');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!search.trim() || selectedEleve) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchEleves({ search: search.trim(), page: 1 });
      setShowSuggestions(true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, selectedEleve, fetchEleves]);

  function selectEleve(e: EleveAdmin) {
    setSelectedEleve(e);
    setSearch(e.nom_complet);
    setShowSuggestions(false);
  }

  function clearEleve() {
    setSelectedEleve(null);
    setSearch('');
    setShowSuggestions(false);
  }

  async function handleSubmit() {
    if (!selectedEleve) { toast.error('Sélectionnez un élève'); return; }
    const amount = parseFloat(montant);
    if (!Number.isFinite(amount) || amount <= 0) { toast.error('Montant invalide'); return; }

    setIsSubmitting(true);
    try {
      const result = await adminService.creerPaiement({
        eleve_id: selectedEleve.id,
        type,
        montant: amount,
        methode,
        statut,
        ...(periode.trim() ? { periode: periode.trim() } : {}),
        ...(reference.trim() ? { reference: reference.trim() } : {}),
      });
      toast.success(`Paiement créé — réf. ${result.reference}`);
      router.push('/admin/paiements');
    } catch {
      toast.error('Erreur lors de la création du paiement');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Nouveau paiement" backHref="/admin/paiements" />

      <div className="p-4 space-y-5">
        {/* Recherche élève */}
        <div>
          <label htmlFor="eleve-search" className="block text-sm font-medium text-gray-700 mb-1">Élève</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              id="eleve-search"
              type="text"
              placeholder="Rechercher un élève…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (selectedEleve) setSelectedEleve(null);
              }}
              onFocus={() => {
                if (!selectedEleve && search.trim()) setShowSuggestions(true);
              }}
              className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
            />
            {search && (
              <button
                onClick={clearEleve}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label="Effacer la recherche"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          {showSuggestions && !selectedEleve && (
            <div role="listbox" className="mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {isLoadingEleves && (
                <div className="px-4 py-3 text-sm text-gray-400">Recherche…</div>
              )}
              {!isLoadingEleves && eleves.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-400">Aucun élève trouvé</div>
              )}
              {!isLoadingEleves && eleves.map((e) => (
                <button
                  key={e.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => selectEleve(e)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
                >
                  <p className="text-sm font-medium text-gray-900">{e.nom_complet}</p>
                  <p className="text-xs text-gray-500">{e.matricule} · {e.classe ?? '—'}</p>
                </button>
              ))}
            </div>
          )}

          {selectedEleve && (
            <div className="mt-2 bg-blue-50 rounded-xl px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">{selectedEleve.nom_complet}</p>
                <p className="text-xs text-blue-600">{selectedEleve.matricule} · {selectedEleve.classe ?? '—'}</p>
              </div>
              <button onClick={clearEleve} className="text-blue-400" aria-label="Retirer l'élève sélectionné">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Type */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Type</p>
          <div role="group" aria-label="Type de paiement" className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Méthode */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Méthode</p>
          <div role="group" aria-label="Méthode de paiement" className="flex flex-wrap gap-2">
            {METHODES.map((m) => (
              <button
                key={m}
                onClick={() => setMethode(m)}
                aria-pressed={methode === m}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  methode === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {METHODE_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Statut */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Statut</p>
          <div role="group" aria-label="Statut du paiement" className="flex gap-2">
            {STATUTS.map((s) => (
              <button
                key={s}
                onClick={() => setStatut(s)}
                aria-pressed={statut === s}
                className={`flex-1 py-2 rounded-full text-sm font-medium border transition-colors ${
                  statut === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {STATUT_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Montant */}
        <div>
          <label htmlFor="montant-input" className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
          <input
            id="montant-input"
            type="number"
            inputMode="numeric"
            placeholder="ex. 150000"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {montant && Number.isFinite(parseFloat(montant)) && (
            <p className="text-xs text-gray-500 mt-1">{formatMontant(parseFloat(montant))}</p>
          )}
        </div>

        {/* Période (optionnelle) */}
        <div>
          <label htmlFor="periode-input" className="block text-sm font-medium text-gray-700 mb-1">
            Période <span className="text-gray-400 font-normal">(optionnelle)</span>
          </label>
          <input
            id="periode-input"
            type="text"
            placeholder="ex. Trimestre 1"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Référence (optionnelle) */}
        <div>
          <label htmlFor="reference-input" className="block text-sm font-medium text-gray-700 mb-1">
            Référence <span className="text-gray-400 font-normal">(optionnelle)</span>
          </label>
          <input
            id="reference-input"
            type="text"
            placeholder="ex. TXN-123456"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !selectedEleve}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
        >
          {isSubmitting ? 'Création…' : 'Créer le paiement'}
        </button>
      </div>
    </div>
  );
}
