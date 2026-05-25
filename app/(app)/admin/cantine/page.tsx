'use client';

import { useEffect, useState } from 'react';
import { getStats, getTousSoldes, recharger, type CantineStats, type CantineSolde } from '@/services/cantine.service';
import { PageHeader } from '@/components/admin/page-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatMontant } from '@/lib/format';
import { Wallet, Plus } from 'lucide-react';

export default function CantinePage() {
  const [stats, setStats] = useState<CantineStats | null>(null);
  const [soldes, setSoldes] = useState<CantineSolde[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState<CantineSolde | null>(null);
  const [montantRecharge, setMontantRecharge] = useState('');
  const [noteRecharge, setNoteRecharge] = useState('');
  const [isRecharging, setIsRecharging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([getStats(), getTousSoldes()])
      .then(([s, sol]) => {
        if (cancelled) return;
        setStats(s);
        setSoldes(sol.data);
      })
      .catch(() => { if (!cancelled) toast.error('Impossible de charger les données cantine'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleRecharge() {
    if (!selectedEleve) return;
    const amount = parseFloat(montantRecharge);
    if (!Number.isFinite(amount) || amount <= 0) { toast.error('Montant invalide'); return; }
    setIsRecharging(true);
    try {
      const res = await recharger(selectedEleve.eleve_id, amount, noteRecharge || undefined);
      toast.success(`Rechargé — nouveau solde : ${formatMontant(res.nouveau_solde)}`);
      setSoldes((prev) => prev.map((s) => s.eleve_id === selectedEleve.eleve_id ? { ...s, solde: res.nouveau_solde } : s));
      setSelectedEleve(null);
      setMontantRecharge('');
      setNoteRecharge('');
    } catch {
      toast.error('Erreur lors de la recharge');
    } finally {
      setIsRecharging(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Cantine" backHref="/admin/menu" />
      <div className="p-4 space-y-4">
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Inscrits', value: String(stats.inscrits) },
              { label: 'Repas aujourd\'hui', value: String(stats.repas_aujourd_hui) },
              { label: 'Solde moyen', value: formatMontant(stats.solde_moyen) },
              { label: 'Soldes faibles', value: String(stats.soldes_faibles) },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm text-center">
                <p className="text-lg font-bold text-blue-700">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
          </div>
        )}
        {!isLoading && soldes.length === 0 && <div className="text-center text-gray-400 py-8">Aucun inscrit</div>}
        <div className="space-y-2">
          {soldes.map((s) => (
            <div key={s.eleve_id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0" aria-hidden="true">
                <Wallet size={18} className="text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{s.nom}</p>
                <p className={`text-xs font-medium ${s.solde < 5000 ? 'text-red-600' : 'text-green-600'}`}>{formatMontant(s.solde)}</p>
              </div>
              <button
                onClick={() => { setSelectedEleve(s); setMontantRecharge(''); setNoteRecharge(''); }}
                className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full font-medium"
                aria-label={`Recharger le solde de ${s.nom}`}>
                <Plus size={12} aria-hidden="true" />
                Recharger
              </button>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={!!selectedEleve} onOpenChange={(open) => !open && setSelectedEleve(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Recharger — {selectedEleve?.nom}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Solde actuel : <span className="font-semibold text-gray-900">{selectedEleve ? formatMontant(selectedEleve.solde) : '—'}</span></p>
            <div>
              <label htmlFor="recharge-montant" className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
              <input id="recharge-montant" type="number" inputMode="numeric" placeholder="ex. 10000" value={montantRecharge}
                onChange={(e) => setMontantRecharge(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="recharge-note" className="block text-sm font-medium text-gray-700 mb-1">Note <span className="text-gray-400 font-normal">(optionnelle)</span></label>
              <input id="recharge-note" type="text" placeholder="ex. Recharge mensuelle" value={noteRecharge}
                onChange={(e) => setNoteRecharge(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => void handleRecharge()} disabled={isRecharging || !montantRecharge}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50">
              {isRecharging ? 'Recharge…' : 'Recharger'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
