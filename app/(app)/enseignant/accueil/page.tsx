'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Users, FileText, BookOpen, CalendarCheck, Clock } from 'lucide-react';
import { useEnseignantStore } from '@/stores/enseignant.store';
import { useAuthStore } from '@/stores/auth.store';
import { devoirsService } from '@/services/devoirs.service';
import { PageHeader } from '@/components/admin/page-header';
import type { Devoir } from '@/types/devoirs';

const QUICK_LINKS = [
  { href: '/enseignant/classes',    icon: Users,         label: 'Classes'      },
  { href: '/enseignant/appel',      icon: Users,         label: 'Appel'        },
  { href: '/enseignant/saisie',     icon: ClipboardList, label: 'Saisir notes' },
  { href: '/enseignant/mes-notes',  icon: FileText,      label: 'Mes notes'    },
  { href: '/enseignant/creer-devoir', icon: BookOpen,    label: 'Créer devoir' },
  { href: '/enseignant/pointage',   icon: CalendarCheck, label: 'Pointage'     },
];

export default function EnseignantAccueilPage() {
  const user = useAuthStore((s) => s.user);
  const classes = useEnseignantStore((s) => s.classes);
  const fetchClasses = useEnseignantStore((s) => s.fetchClasses);
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchClasses();
    devoirsService
      .getAll()
      .then((d) => { if (!cancelled) setDevoirs(d.slice(0, 3)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [fetchClasses]);

  return (
    <div>
      <PageHeader title={`Bonjour, ${user?.prenom ?? 'Enseignant'}`} />
      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className="bg-white rounded-xl p-4 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Classe{classes.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-[#2B3D88] rounded-xl p-4 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-white">{devoirs.length}</p>
            <p className="text-xs text-blue-200 mt-0.5">Devoir{devoirs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {devoirs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800">Devoirs récents</span>
              <Link href="/enseignant/creer-devoir" className="text-xs text-[#2B3D88] font-medium">+ Créer</Link>
            </div>
            {devoirs.map((d) => (
              <div key={d.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium text-gray-800">{d.titre}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock size={12} className="text-gray-400" aria-hidden="true" />
                  <p className="text-xs text-gray-400">{d.date_limite} · {d.matiere}</p>
                </div>
              </div>
            ))}
          </div>
        )}

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
