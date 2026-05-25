'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { FileText, CalendarCheck, BookOpen, ClipboardList, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useEleveStore } from '@/stores/eleve.store';
import { useDevoirsStore } from '@/stores/devoirs.store';
import { PageHeader } from '@/components/admin/page-header';

const QUICK_LINKS = [
  { href: '/eleve/cours',          icon: BookOpen,      label: 'Emploi du temps' },
  { href: '/eleve/notes',          icon: FileText,      label: 'Mes notes'       },
  { href: '/eleve/absences',       icon: CalendarCheck, label: 'Mes absences'    },
  { href: '/eleve/devoirs',        icon: ClipboardList, label: 'Devoirs'         },
  { href: '/eleve/cours-en-ligne', icon: BookOpen,      label: 'E-learning'      },
  { href: '/eleve/messages',       icon: MessageCircle, label: 'Messages'        },
];

export default function EleveAccueilPage() {
  const user = useAuthStore((s) => s.user);
  const { notes, absences, fetchNotes, fetchAbsences } = useEleveStore((s) => ({
    notes: s.notes,
    absences: s.absences,
    fetchNotes: s.fetchNotes,
    fetchAbsences: s.fetchAbsences,
  }));
  const { devoirs, fetchDevoirs } = useDevoirsStore((s) => ({
    devoirs: s.devoirs,
    fetchDevoirs: s.fetchDevoirs,
  }));

  useEffect(() => {
    fetchNotes();
    fetchAbsences();
    fetchDevoirs();
  }, [fetchNotes, fetchAbsences, fetchDevoirs]);

  const devoirsARendre = devoirs.filter((d) => !d.fait);

  return (
    <div>
      <PageHeader title={`Bonjour, ${user?.prenom ?? 'Élève'}`} />
      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className="bg-white rounded-xl p-4 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Matière{notes.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-[#2B3D88] rounded-xl p-4 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-white">{absences.length}</p>
            <p className="text-xs text-blue-200 mt-0.5">Absence{absences.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-white rounded-xl p-4 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-orange-500">{devoirsARendre.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">À rendre</p>
          </div>
        </div>

        {devoirsARendre.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-800">Devoirs à rendre</span>
              <Link href="/eleve/devoirs" className="text-xs text-[#2B3D88] font-medium">Voir tout</Link>
            </div>
            {devoirsARendre.slice(0, 3).map((d) => (
              <div key={d.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium text-gray-800">{d.titre}</p>
                <p className="text-xs text-gray-400 mt-0.5">{d.matiere} · {d.date_limite}</p>
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
