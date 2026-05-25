'use client';
import Link from 'next/link';
import {
  LogOut, ClipboardList, BookOpen, MessageCircle,
  CalendarCheck, Users, FileText, Radio,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useEnseignantStore } from '@/stores/enseignant.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { getInitiales } from '@/lib/format';

const QUICK_LINKS = [
  { href: '/enseignant/appel',              icon: Users,         label: "Faire l'appel"   },
  { href: '/enseignant/saisie',             icon: ClipboardList, label: 'Saisir les notes' },
  { href: '/enseignant/mes-notes',          icon: FileText,      label: 'Mes notes'        },
  { href: '/enseignant/creer-devoir',       icon: BookOpen,      label: 'Créer un devoir'  },
  { href: '/enseignant/devoir-soumissions', icon: CalendarCheck, label: 'Soumissions'      },
  { href: '/enseignant/publier-cours',      icon: BookOpen,      label: 'Publier un cours' },
  { href: '/enseignant/diffuser',           icon: Radio,         label: 'Diffuser un msg'  },
  { href: '/enseignant/pointage',           icon: CalendarCheck, label: 'Pointage'         },
  { href: '/enseignant/messages',           icon: MessageCircle, label: 'Messages'         },
];

export default function EnseignantMenuPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const classes = useEnseignantStore((s) => s.classes);

  return (
    <div>
      <PageHeader title="Menu" />
      <div className="p-4 space-y-4 pb-6">
        <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-[#2B3D88]">
              {user ? getInitiales(user.nom_complet) : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{user?.nom_complet}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            <span className="bg-blue-100 text-[#2B3D88] text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block">
              {classes.length} classe{classes.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

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
