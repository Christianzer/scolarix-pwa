'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { Users, CreditCard, BookOpen, MessageCircle, Bell, ClipboardList } from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { useAuthStore } from '@/stores/auth.store';
import { useAnneeScolaireStore } from '@/stores/annee-scolaire.store';
import { PageHeader } from '@/components/admin/page-header';
import { StatsCard } from '@/components/admin/stats-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { formatMontant, formatDate } from '@/lib/format';
import type { PaiementAdmin } from '@/types/admin';

const QUICK_LINKS = [
  { href: '/admin/eleves',        icon: Users,         label: 'Élèves'        },
  { href: '/admin/paiements',     icon: CreditCard,    label: 'Paiements'     },
  { href: '/admin/evaluations',   icon: ClipboardList, label: 'Évaluations'   },
  { href: '/admin/messages',      icon: MessageCircle, label: 'Messages'      },
  { href: '/admin/onboarding',    icon: BookOpen,      label: 'Démarrage'     },
  { href: '/admin/menu',          icon: Bell,          label: 'Notifications' },
];

function MiniBarChart({ paiements }: { paiements: PaiementAdmin[] }) {
  const counts = {
    valide:     paiements.filter(p => p.statut === 'valide').length,
    en_attente: paiements.filter(p => p.statut === 'en_attente').length,
    echoue:     paiements.filter(p => p.statut === 'echoue').length,
  };
  const bars = [
    { label: 'Validés',    value: counts.valide,     color: 'bg-green-500'  },
    { label: 'En attente', value: counts.en_attente, color: 'bg-yellow-400' },
    { label: 'Échoués',    value: counts.echoue,     color: 'bg-red-400'    },
  ];
  const max = Math.max(...bars.map(b => b.value), 1);
  return (
    <div className="flex items-end gap-3 h-20 pt-2" role="img" aria-label="Répartition des paiements">
      {bars.map(bar => (
        <div key={bar.label} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full bg-gray-100 rounded-t relative" style={{ height: 40 }}>
            <div
              className={`${bar.color} rounded-t absolute bottom-0 w-full transition-all`}
              style={{ height: `${(bar.value / max) * 40}px` }}
            />
          </div>
          <span className="text-[10px] text-gray-500">{bar.value}</span>
          <span className="text-[9px] text-gray-400 text-center leading-tight">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AccueilPage() {
  const eleveMeta = useAdminStore((s) => s.eleveMeta);
  const paiements = useAdminStore((s) => s.paiements);
  const totalAujourdhui = useAdminStore((s) => s.totalAujourdhui);
  const fetchEleves = useAdminStore((s) => s.fetchEleves);
  const fetchPaiements = useAdminStore((s) => s.fetchPaiements);
  const user = useAuthStore((s) => s.user);
  const annee = useAnneeScolaireStore((s) => s.annee);
  const fetchAnnee = useAnneeScolaireStore((s) => s.fetchAnnee);

  useEffect(() => {
    fetchEleves({ page: 1 });
    fetchPaiements({ page: 1 });
    fetchAnnee();
  }, [fetchEleves, fetchPaiements, fetchAnnee]);

  const lastPaiements = paiements.slice(0, 3);

  return (
    <div>
      <PageHeader
        title={`Bonjour, ${user?.prenom ?? 'Admin'}`}
        subtitle={annee?.libelle}
      />
      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="flex gap-3">
          <StatsCard label="Élèves inscrits" value={eleveMeta?.total ?? '—'} />
          <StatsCard
            label="Perçu aujourd'hui"
            value={formatMontant(totalAujourdhui)}
            className="bg-[#2B3D88] [&>div:first-child]:text-white [&>div:last-child]:text-blue-200"
          />
        </div>

        {/* Mini bar chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-3">Répartition des paiements</p>
          <MiniBarChart paiements={paiements} />
        </div>

        {/* Derniers paiements */}
        {lastPaiements.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800">Derniers paiements</span>
              <Link href="/admin/paiements" className="text-xs text-[#2B3D88] font-medium">Voir tout</Link>
            </div>
            {lastPaiements.map(p => (
              <div key={p.id} className="px-4 py-3 flex items-center justify-between border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.eleve ?? '—'}</p>
                  <p className="text-xs text-gray-400">{formatDate(p.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatMontant(p.montant)}</p>
                  <StatusBadge status={p.statut} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick access */}
        <div className="grid grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-xl p-3 flex flex-col items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Icon size={18} className="text-[#2B3D88]" aria-hidden="true" />
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
