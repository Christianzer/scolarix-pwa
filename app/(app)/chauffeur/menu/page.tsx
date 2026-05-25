'use client';
import Link from 'next/link';
import { LogOut, Bus, ClipboardCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { getInitiales } from '@/lib/format';

const QUICK_LINKS = [
  { href: '/chauffeur/mon-bus',  icon: Bus,            label: 'Mon bus'      },
  { href: '/chauffeur/pointage', icon: ClipboardCheck, label: 'Mon pointage' },
];

export default function ChauffeurMenuPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

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
              Chauffeur
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {QUICK_LINKS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors"
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
