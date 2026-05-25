'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bus, ClipboardCheck, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/chauffeur/accueil',  icon: Home,           label: 'Accueil'  },
  { href: '/chauffeur/mon-bus',  icon: Bus,            label: 'Mon bus'  },
  { href: '/chauffeur/pointage', icon: ClipboardCheck, label: 'Pointage' },
  { href: '/chauffeur/menu',     icon: Menu,           label: 'Menu'     },
];

export default function ChauffeurBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 max-w-lg mx-auto"
      aria-label="Navigation principale"
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[11px] transition-colors',
              active ? 'text-[#2B3D88]' : 'text-gray-400 hover:text-gray-600',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
