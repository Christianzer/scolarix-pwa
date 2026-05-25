'use client';

import { useEffect, useState } from 'react';
import { relanceService, type RelanceConfig, type RelanceHistorique, type RelanceStats } from '@/services/relance.service';
import { PageHeader } from '@/components/admin/page-header';
import { toast } from 'sonner';
import { formatMontant, formatDate } from '@/lib/format';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function RelancesPage() {
  const [tab, setTab] = useState<'stats' | 'config'>('stats');
  const [stats, setStats] = useState<RelanceStats | null>(null);
  const [historique, setHistorique] = useState<RelanceHistorique[]>([]);
  const [config, setConfig] = useState<RelanceConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([relanceService.getStats(), relanceService.getHistorique(), relanceService.getConfig()])
      .then(([s, h, c]) => {
        if (cancelled) return;
        setStats(s);
        setHistorique(h.data);
        setConfig(c);
      })
      .catch(() => {
        if (!cancelled) toast.error('Impossible de charger les relances');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function handleToggle(cfg: RelanceConfig) {
    try {
      const updated = await relanceService.updateConfig(cfg.id, { actif: !cfg.actif });
      setConfig((prev) => prev.map((c) => c.id === cfg.id ? updated : c));
      toast.success(updated.actif ? 'Relance activée' : 'Relance désactivée');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Relances" backHref="/admin/menu" />

      <div className="flex border-b border-gray-200 bg-white">
        {(['stats', 'config'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
            {t === 'stats' ? 'Stats & Historique' : 'Configuration'}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div role="status" className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Chargement" />
        </div>
      )}

      {!isLoading && tab === 'stats' && (
        <div className="p-4 space-y-4">
          {stats && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Impayés', value: String(stats.total_impayes), color: 'text-red-600' },
                { label: 'Relances 30j', value: String(stats.relances_30j), color: 'text-blue-700' },
                { label: 'Montant total', value: formatMontant(stats.montant_total), color: 'text-orange-700' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm text-center">
                  <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {historique.length === 0 && (
            <div className="text-center text-gray-400 py-8 text-sm">Aucune relance envoyée</div>
          )}

          <div className="space-y-2">
            {historique.map((h) => (
              <div key={h.id} className="bg-white rounded-xl shadow-sm p-3 flex items-start gap-3">
                {h.statut === 'envoye' ? (
                  <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                ) : (
                  <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{h.eleve ?? '—'}</p>
                  <p className="text-xs text-gray-500">
                    {h.canal.toUpperCase()} · {h.jours_retard}j retard{h.montant ? ` · ${formatMontant(h.montant)}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(h.envoye_le)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && tab === 'config' && (
        <div className="p-4 space-y-3">
          {config.length === 0 && (
            <div className="text-center text-gray-400 py-8 text-sm">Aucun palier configuré</div>
          )}
          {config.map((cfg) => (
            <div key={cfg.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-orange-500" aria-hidden="true" />
                  <p className="font-semibold text-gray-900 text-sm">Après {cfg.jours_retard} jours</p>
                </div>
                <button
                  role="switch"
                  aria-checked={cfg.actif}
                  aria-label={`${cfg.actif ? 'Désactiver' : 'Activer'} ce palier`}
                  onClick={() => void handleToggle(cfg)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${cfg.actif ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${cfg.actif ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex gap-3">
                {[
                  { key: 'canal_email', label: 'Email' },
                  { key: 'canal_sms', label: 'SMS' },
                  { key: 'canal_push', label: 'Push' },
                  { key: 'canal_whatsapp', label: 'WhatsApp' },
                ].map(({ key, label }) => (
                  <span key={key} className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg[key as keyof RelanceConfig] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
