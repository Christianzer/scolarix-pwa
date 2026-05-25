'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown, ChevronUp, LogOut, MessageCircle, Users, Calendar,
  FileText, BookOpen, AlertTriangle, CreditCard, Home, Bus, Utensils,
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { useAuthStore } from '@/stores/auth.store';
import { useAnneeScolaireStore } from '@/stores/annee-scolaire.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { getInitiales } from '@/lib/format';

interface AccordionItem { href: string; label: string; icon: React.ElementType; }
interface AccordionSection { title: string; items: AccordionItem[]; }

const SECTIONS: AccordionSection[] = [
  {
    title: 'Communication',
    items: [
      { href: '/admin/messages',  label: 'Messages',    icon: MessageCircle  },
      { href: '/admin/relances',  label: 'Relances',    icon: AlertTriangle  },
    ],
  },
  {
    title: 'Académique',
    items: [
      { href: '/admin/deliberations', label: 'Délibérations', icon: BookOpen  },
      { href: '/admin/evaluations',   label: 'Évaluations',   icon: FileText  },
    ],
  },
  {
    title: 'RH & Présences',
    items: [
      { href: '/admin/pointage',       label: 'Pointage',       icon: Calendar },
      { href: '/admin/presence-staff', label: 'Présence staff', icon: Users    },
      { href: '/admin/rendez-vous',    label: 'Rendez-vous',    icon: Calendar },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { href: '/admin/cantine',     label: 'Cantine',     icon: Utensils  },
      { href: '/admin/transport',   label: 'Transport',   icon: Bus       },
      { href: '/admin/salles',      label: 'Salles',      icon: Home      },
      { href: '/admin/tarifs',      label: 'Tarifs',      icon: CreditCard},
      { href: '/admin/abonnements', label: 'Abonnements', icon: FileText  },
    ],
  },
];

function AccordionGroup({ section }: { section: AccordionSection }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700"
        aria-expanded={open}
      >
        {section.title}
        {open
          ? <ChevronUp size={16} className="text-gray-400" aria-hidden="true" />
          : <ChevronDown size={16} className="text-gray-400" aria-hidden="true" />}
      </button>
      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {section.items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
              <Icon size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
              <span className="text-sm text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  const eleveMeta = useAdminStore((s) => s.eleveMeta);
  const paiementMeta = useAdminStore((s) => s.paiementMeta);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const annee = useAnneeScolaireStore((s) => s.annee);

  return (
    <div>
      <PageHeader title="Menu" />
      <div className="p-4 space-y-4 pb-6">
        {/* Profil */}
        <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0" aria-hidden="true">
            <span className="text-xl font-bold text-[#2B3D88]">{user ? getInitiales(user.nom_complet) : '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{user?.nom_complet}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {user?.role_label && (
                <span className="bg-blue-100 text-[#2B3D88] text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {user.role_label}
                </span>
              )}
              {annee && (
                <span className="bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {annee.libelle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="bg-white rounded-xl p-3 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{eleveMeta?.total ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Élèves</p>
          </div>
          <div className="bg-white rounded-xl p-3 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{paiementMeta?.total ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Paiements</p>
          </div>
        </div>

        {/* Quick access */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/admin/eleves',         label: 'Élèves',      desc: 'Gestion des élèves'      },
            { href: '/admin/paiements',      label: 'Paiements',   desc: 'Suivi financier'         },
            { href: '/admin/evaluations',    label: 'Évaluations', desc: 'Performances du staff'   },
            { href: '/admin/creer-paiement', label: 'Encaisser',   desc: 'Enregistrer un paiement' },
            { href: '/admin/onboarding',     label: 'Démarrage',   desc: 'Configuration initiale'  },
            { href: '/admin/abonnements',    label: 'Abonnements', desc: 'Suivi des abonnements'   },
          ].map(({ href, label, desc }) => (
            <Link key={href} href={href} className="bg-white rounded-xl p-3 shadow-sm hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900 text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>

        {/* Accordion sections */}
        {SECTIONS.map(section => (
          <AccordionGroup key={section.title} section={section} />
        ))}

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-red-500 border-red-200 hover:bg-red-50"
          onClick={() => void logout()}
        >
          <LogOut size={16} className="mr-2" aria-hidden="true" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
