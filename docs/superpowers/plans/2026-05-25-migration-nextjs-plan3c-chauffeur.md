# Plan 3c — Chauffeur Role Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Migrate the Chauffeur (bus driver) role to Next.js 15 PWA — 3 tasks covering 5 screens.

**Architecture:** Same pattern as previous roles. Two distinct domains: (1) pointage personnel via `usePointageStore`, (2) gestion du bus via `transport.service.ts` directly in pages (no dedicated store needed — data is fetched on mount, local state for toggle).

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, shadcn/ui, Zustand, Vitest + @testing-library/react, sonner toasts

---

## Existing code to reuse

- `usePointageStore` from `@/stores/pointage.store` — `pointageJour: Pointage|null`, `historique: Pointage[]`, `isLoading`, `hasPassed`, `fetchAujourdhui()`, `fetchHistorique()`, `pointer(lat, lon)`
- `useAuthStore` from `@/stores/auth.store` — `user`, `logout`
- `PageHeader` from `@/components/admin/page-header`
- `Button`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from `@/components/ui/*`
- `formatDate`, `formatHeure`, `getInitiales` from `@/lib/format`
- `toast` from `sonner`
- `cn` from `@/lib/utils`

## New service to create: `services/chauffeur.service.ts`

```ts
import api from './api';
import type { Bus, EleveBusItem } from './transport.service';

export const chauffeurService = {
  async getBus(): Promise<Bus | null> {
    const res = await api.get('/transport/bus', { params: { actif: 1 } });
    const buses: Bus[] = res.data;
    return buses[0] ?? null;
  },

  async getEleves(busId: number): Promise<EleveBusItem[]> {
    const res = await api.get(`/transport/bus/${busId}/eleves`);
    return res.data.eleves ?? [];
  },

  async pointerEleve(busId: number, eleveId: number, sens: 'montee' | 'descente'): Promise<void> {
    await api.post(`/transport/bus/${busId}/pointer`, { eleve_id: eleveId, sens });
  },
};
```

## Key types (from `services/transport.service.ts`)

```ts
interface Bus { id: number; nom: string; description?: string; capacite: number; immatriculation?: string; chauffeur_nom?: string; actif: boolean; arrets: Arret[]; eleves_count?: number; }
interface EleveBusItem { eleve_id: number; nom: string; matricule: string; classe?: string; arret?: string; sens: 'aller'|'retour'|'aller_retour'; pointe_montee: boolean; pointe_descente: boolean; heure_montee?: string; heure_descente?: string; }
```

---

### Task 1: Chauffeur — Bottom nav + layout + menu + accueil

**Files:**
- Create: `services/chauffeur.service.ts`
- Create: `components/chauffeur/bottom-nav.tsx`
- Create: `app/(app)/chauffeur/layout.tsx`
- Create: `app/(app)/chauffeur/menu/page.tsx`
- Create: `app/(app)/chauffeur/accueil/page.tsx`
- Test: `__tests__/chauffeur/layout-menu-accueil.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/chauffeur/layout-menu-accueil.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/chauffeur/accueil',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 1, nom_complet: 'Diallo Moussa', prenom: 'Moussa', email: 'd@test.ci' }, logout: vi.fn() }),
  ),
}));
vi.mock('@/stores/pointage.store', () => ({
  usePointageStore: vi.fn((sel) =>
    sel({ pointageJour: null, historique: [], isLoading: false, fetchAujourdhui: vi.fn(), fetchHistorique: vi.fn() }),
  ),
}));
vi.mock('@/services/chauffeur.service', () => ({
  chauffeurService: {
    getBus: vi.fn().mockResolvedValue({ id: 1, nom: 'Bus 01', capacite: 30, actif: true, arrets: [], eleves_count: 22 }),
    getEleves: vi.fn().mockResolvedValue([]),
    pointerEleve: vi.fn().mockResolvedValue(undefined),
  },
}));

import ChauffeurBottomNav from '@/components/chauffeur/bottom-nav';
import ChauffeurMenuPage from '@/app/(app)/chauffeur/menu/page';
import ChauffeurAccueilPage from '@/app/(app)/chauffeur/accueil/page';

describe('Chauffeur Layout, Menu & Accueil', () => {
  it('affiche les 4 onglets de navigation', () => {
    render(<ChauffeurBottomNav />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Mon bus')).toBeInTheDocument();
    expect(screen.getByText('Pointage')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('affiche le nom du chauffeur dans le menu', () => {
    render(<ChauffeurMenuPage />);
    expect(screen.getByText('Diallo Moussa')).toBeInTheDocument();
  });

  it('affiche le nom du bus sur l\'accueil', async () => {
    render(<ChauffeurAccueilPage />);
    await screen.findByText('Bus 01');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/chauffeur/layout-menu-accueil.test.tsx
```

- [ ] **Step 3: Create `services/chauffeur.service.ts`**

```ts
import api from './api';
import type { Bus, EleveBusItem } from './transport.service';

export const chauffeurService = {
  async getBus(): Promise<Bus | null> {
    const res = await api.get('/transport/bus', { params: { actif: 1 } });
    const buses: Bus[] = Array.isArray(res.data) ? res.data : [];
    return buses[0] ?? null;
  },

  async getEleves(busId: number): Promise<EleveBusItem[]> {
    const res = await api.get(`/transport/bus/${busId}/eleves`);
    return res.data.eleves ?? [];
  },

  async pointerEleve(busId: number, eleveId: number, sens: 'montee' | 'descente'): Promise<void> {
    await api.post(`/transport/bus/${busId}/pointer`, { eleve_id: eleveId, sens });
  },
};
```

- [ ] **Step 4: Create `components/chauffeur/bottom-nav.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bus, ClipboardCheck, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/chauffeur/accueil',  icon: Home,          label: 'Accueil'  },
  { href: '/chauffeur/mon-bus',  icon: Bus,           label: 'Mon bus'  },
  { href: '/chauffeur/pointage', icon: ClipboardCheck, label: 'Pointage' },
  { href: '/chauffeur/menu',     icon: Menu,          label: 'Menu'     },
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
```

- [ ] **Step 5: Create `app/(app)/chauffeur/layout.tsx`**

```tsx
import ChauffeurBottomNav from '@/components/chauffeur/bottom-nav';

export default function ChauffeurLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 max-w-lg mx-auto">
      {children}
      <ChauffeurBottomNav />
    </div>
  );
}
```

- [ ] **Step 6: Create `app/(app)/chauffeur/menu/page.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { LogOut, Bus, ClipboardCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { getInitiales } from '@/lib/format';

const QUICK_LINKS = [
  { href: '/chauffeur/mon-bus',  icon: Bus,            label: 'Mon bus'          },
  { href: '/chauffeur/pointage', icon: ClipboardCheck, label: 'Mon pointage'     },
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
```

- [ ] **Step 7: Create `app/(app)/chauffeur/accueil/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bus, ClipboardCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { usePointageStore } from '@/stores/pointage.store';
import { chauffeurService } from '@/services/chauffeur.service';
import { PageHeader } from '@/components/admin/page-header';
import type { Bus as BusType } from '@/services/transport.service';

export default function ChauffeurAccueilPage() {
  const user = useAuthStore((s) => s.user);
  const { pointageJour, fetchAujourdhui } = usePointageStore((s) => ({
    pointageJour: s.pointageJour,
    fetchAujourdhui: s.fetchAujourdhui,
  }));
  const [bus, setBus] = useState<BusType | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAujourdhui();
    chauffeurService.getBus().then((b) => { if (!cancelled) setBus(b); }).catch(() => {});
    return () => { cancelled = true; };
  }, [fetchAujourdhui]);

  return (
    <div>
      <PageHeader title={`Bonjour, ${user?.prenom ?? 'Chauffeur'}`} />
      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className={`rounded-xl p-4 flex-1 shadow-sm text-center ${pointageJour?.heure_arrivee ? 'bg-green-500' : 'bg-[#2B3D88]'}`}>
            <p className="text-2xl font-bold text-white">
              {pointageJour?.heure_arrivee ?? '—'}
            </p>
            <p className="text-xs text-blue-200 mt-0.5">
              {pointageJour?.heure_arrivee ? 'Arrivée pointée' : 'Pas encore pointé'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{bus?.eleves_count ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-0.5">Élèves inscrits</p>
          </div>
        </div>

        {bus && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Bus size={18} className="text-[#2B3D88]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{bus.nom}</p>
                {bus.immatriculation && <p className="text-xs text-gray-400">{bus.immatriculation}</p>}
                <p className="text-xs text-gray-400">Capacité : {bus.capacite} places</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/chauffeur/mon-bus"
            className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Bus size={18} className="text-[#2B3D88]" aria-hidden="true" />
            </div>
            <span className="text-xs text-gray-600 text-center">Pointer les élèves</span>
          </Link>
          <Link
            href="/chauffeur/pointage"
            className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <ClipboardCheck size={18} className="text-[#2B3D88]" aria-hidden="true" />
            </div>
            <span className="text-xs text-gray-600 text-center">Mon pointage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

```
npx vitest run __tests__/chauffeur/layout-menu-accueil.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 9: Commit**

```bash
git add services/chauffeur.service.ts components/chauffeur/bottom-nav.tsx app/(app)/chauffeur/layout.tsx app/(app)/chauffeur/menu/page.tsx app/(app)/chauffeur/accueil/page.tsx __tests__/chauffeur/layout-menu-accueil.test.tsx
git commit -m "feat(chauffeur): service, bottom nav, layout, menu, accueil"
```

---

### Task 2: Chauffeur — Pointage personnel

**Files:**
- Create: `app/(app)/chauffeur/pointage/page.tsx`
- Test: `__tests__/chauffeur/pointage.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/chauffeur/pointage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockPointer } = vi.hoisted(() => ({
  mockPointer: vi.fn().mockResolvedValue({ action: 'arrivee', message: 'Arrivée enregistrée' }),
}));

vi.mock('@/stores/pointage.store', () => ({
  usePointageStore: vi.fn((sel) =>
    sel({
      pointageJour: null,
      historique: [
        { id: 1, date: '2026-05-25', heure_arrivee: '07:30', heure_depart: '16:00', statut: 'present', commentaire: null, duree_minutes: 510, duree_formatee: '8h30' },
      ],
      isLoading: false,
      fetchAujourdhui: vi.fn(),
      fetchHistorique: vi.fn(),
      pointer: mockPointer,
    }),
  ),
}));

// Mock geolocation
Object.defineProperty(globalThis, 'navigator', {
  value: { geolocation: { getCurrentPosition: vi.fn((success) => success({ coords: { latitude: 5.35, longitude: -4.01 } })) } },
  writable: true,
});

import ChauffeurPointagePage from '@/app/(app)/chauffeur/pointage/page';

describe('Chauffeur Pointage', () => {
  it('affiche le bouton Pointer l\'arrivée quand pas encore pointé', () => {
    render(<ChauffeurPointagePage />);
    expect(screen.getByRole('button', { name: /pointer l'arrivée/i })).toBeInTheDocument();
  });

  it('affiche l\'historique des pointages', () => {
    render(<ChauffeurPointagePage />);
    expect(screen.getByText(/07:30/)).toBeInTheDocument();
  });

  it('appelle pointer() au clic', async () => {
    render(<ChauffeurPointagePage />);
    fireEvent.click(screen.getByRole('button', { name: /pointer l'arrivée/i }));
    await waitFor(() => expect(mockPointer).toHaveBeenCalled());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/chauffeur/pointage.test.tsx
```

- [ ] **Step 3: Create `app/(app)/chauffeur/pointage/page.tsx`**

This is the same pattern as `app/(app)/enseignant/pointage/page.tsx` but adapted for the chauffeur. Read the enseignant pointage page at `app/(app)/enseignant/pointage/page.tsx` for reference, then create this file:

```tsx
'use client';
import { useEffect } from 'react';
import { MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePointageStore } from '@/stores/pointage.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';

const STATUT_LABELS: Record<string, string> = {
  present: 'Présent',
  absent: 'Absent',
  retard: 'Retard',
  conge: 'Congé',
};

const STATUT_COLORS: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-600',
  retard: 'bg-yellow-100 text-yellow-700',
  conge: 'bg-blue-100 text-blue-700',
};

export default function ChauffeurPointagePage() {
  const { pointageJour, historique, isLoading, fetchAujourdhui, fetchHistorique, pointer } = usePointageStore((s) => ({
    pointageJour: s.pointageJour,
    historique: s.historique,
    isLoading: s.isLoading,
    fetchAujourdhui: s.fetchAujourdhui,
    fetchHistorique: s.fetchHistorique,
    pointer: s.pointer,
  }));

  useEffect(() => {
    fetchAujourdhui();
    fetchHistorique();
  }, [fetchAujourdhui, fetchHistorique]);

  const handlePointer = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non disponible');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await pointer(pos.coords.latitude, pos.coords.longitude);
          toast.success(res.message);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Erreur lors du pointage';
          toast.error(msg);
        }
      },
      () => toast.error('Impossible d\'obtenir votre position'),
    );
  };

  const aPointe = !!pointageJour?.heure_arrivee;
  const aFini = !!pointageJour?.heure_depart;

  return (
    <div>
      <PageHeader title="Mon pointage" />
      <div className="p-4 space-y-4">
        {/* Carte du jour */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Aujourd'hui</p>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400 mb-1">Arrivée</p>
              <p className="text-lg font-bold text-gray-900">{pointageJour?.heure_arrivee ?? '—'}</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400 mb-1">Départ</p>
              <p className="text-lg font-bold text-gray-900">{pointageJour?.heure_depart ?? '—'}</p>
            </div>
          </div>

          {!aPointe ? (
            <Button
              className="w-full bg-[#2B3D88] hover:bg-[#1a255e]"
              onClick={handlePointer}
              disabled={isLoading}
              aria-label="Pointer l'arrivée"
            >
              <MapPin size={16} className="mr-2" aria-hidden="true" />
              Pointer l'arrivée
            </Button>
          ) : !aFini ? (
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={handlePointer}
              disabled={isLoading}
              aria-label="Pointer le départ"
            >
              <Clock size={16} className="mr-2" aria-hidden="true" />
              Pointer le départ
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-600 py-2">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span className="text-sm font-medium">Journée terminée · {pointageJour.duree_formatee}</span>
            </div>
          )}
        </div>

        {/* Historique */}
        {historique.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-800">Historique</span>
            </div>
            {historique.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(h.date)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {h.heure_arrivee ?? '—'} → {h.heure_depart ?? '—'}
                    {h.duree_formatee ? ` · ${h.duree_formatee}` : ''}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUT_COLORS[h.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUT_LABELS[h.statut] ?? h.statut}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```
npx vitest run __tests__/chauffeur/pointage.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 5: Commit**

```bash
git add app/(app)/chauffeur/pointage/page.tsx __tests__/chauffeur/pointage.test.tsx
git commit -m "feat(chauffeur): pointage personnel page"
```

---

### Task 3: Chauffeur — Mon bus (élèves + pointage transport)

**Files:**
- Create: `app/(app)/chauffeur/mon-bus/page.tsx`
- Test: `__tests__/chauffeur/mon-bus.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/chauffeur/mon-bus.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockPointerEleve } = vi.hoisted(() => ({
  mockPointerEleve: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/chauffeur.service', () => ({
  chauffeurService: {
    getBus: vi.fn().mockResolvedValue({ id: 1, nom: 'Bus 01', capacite: 30, actif: true, arrets: [], eleves_count: 2 }),
    getEleves: vi.fn().mockResolvedValue([
      { eleve_id: 10, nom: 'Koné Aminata', matricule: 'E001', classe: '3ème A', arret: 'Mairie', sens: 'aller_retour', pointe_montee: false, pointe_descente: false },
      { eleve_id: 11, nom: 'Diallo Ibrahim', matricule: 'E002', classe: '4ème B', arret: 'Marché', sens: 'aller', pointe_montee: true, pointe_descente: false },
    ]),
    pointerEleve: mockPointerEleve,
  },
}));

import ChauffeurMonBusPage from '@/app/(app)/chauffeur/mon-bus/page';

describe('Chauffeur Mon Bus', () => {
  it('affiche le nom du bus et les élèves', async () => {
    render(<ChauffeurMonBusPage />);
    await waitFor(() => expect(screen.getByText('Bus 01')).toBeInTheDocument());
    expect(screen.getByText('Koné Aminata')).toBeInTheDocument();
    expect(screen.getByText('Diallo Ibrahim')).toBeInTheDocument();
  });

  it('affiche "Monté" pour les élèves déjà pointés', async () => {
    render(<ChauffeurMonBusPage />);
    await waitFor(() => expect(screen.getByText('Monté')).toBeInTheDocument());
  });

  it('appelle pointerEleve au clic sur le bouton Montée', async () => {
    render(<ChauffeurMonBusPage />);
    await waitFor(() => expect(screen.getByText('Koné Aminata')).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole('button', { name: /montée/i })[0]);
    await waitFor(() => expect(mockPointerEleve).toHaveBeenCalledWith(1, 10, 'montee'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/chauffeur/mon-bus.test.tsx
```

- [ ] **Step 3: Create `app/(app)/chauffeur/mon-bus/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { chauffeurService } from '@/services/chauffeur.service';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import type { Bus, EleveBusItem } from '@/services/transport.service';

export default function ChauffeurMonBusPage() {
  const [bus, setBus] = useState<Bus | null>(null);
  const [eleves, setEleves] = useState<EleveBusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pointing, setPointing] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    chauffeurService.getBus().then(async (b) => {
      if (cancelled || !b) { setIsLoading(false); return; }
      setBus(b);
      const list = await chauffeurService.getEleves(b.id);
      if (!cancelled) { setEleves(list); setIsLoading(false); }
    }).catch(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handlePointer = async (eleve: EleveBusItem, sens: 'montee' | 'descente') => {
    if (!bus) return;
    setPointing(eleve.eleve_id);
    try {
      await chauffeurService.pointerEleve(bus.id, eleve.eleve_id, sens);
      setEleves((prev) =>
        prev.map((e) =>
          e.eleve_id === eleve.eleve_id
            ? { ...e, pointe_montee: sens === 'montee' ? true : e.pointe_montee, pointe_descente: sens === 'descente' ? true : e.pointe_descente }
            : e
        )
      );
      toast.success(`${eleve.nom} — ${sens === 'montee' ? 'montée' : 'descente'} enregistrée`);
    } catch {
      toast.error('Erreur lors du pointage');
    } finally {
      setPointing(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={bus ? bus.nom : 'Mon bus'}
        subtitle={bus ? `Capacité : ${bus.capacite} · ${eleves.length} élève${eleves.length !== 1 ? 's' : ''}` : undefined}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      ) : !bus ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucun bus assigné</p>
      ) : eleves.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucun élève inscrit</p>
      ) : (
        <div className="p-4 space-y-2">
          {eleves.map((e) => (
            <div key={e.eleve_id} className="bg-white rounded-xl shadow-sm px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{e.nom}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.classe ?? e.matricule}</p>
                  {e.arret && <p className="text-xs text-gray-400">Arrêt : {e.arret}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {e.pointe_montee ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                      <CheckCircle2 size={12} aria-hidden="true" />
                      Monté
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[#2B3D88] border-[#2B3D88] text-xs"
                      disabled={pointing === e.eleve_id}
                      onClick={() => handlePointer(e, 'montee')}
                      aria-label={`Pointer montée de ${e.nom}`}
                    >
                      Montée
                    </Button>
                  )}
                  {e.pointe_descente ? (
                    <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full font-medium">
                      <CheckCircle2 size={12} aria-hidden="true" />
                      Descendu
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-500 border-orange-300 text-xs"
                      disabled={pointing === e.eleve_id}
                      onClick={() => handlePointer(e, 'descente')}
                      aria-label={`Pointer descente de ${e.nom}`}
                    >
                      Descente
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```
npx vitest run __tests__/chauffeur/mon-bus.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 5: Commit**

```bash
git add app/(app)/chauffeur/mon-bus/page.tsx __tests__/chauffeur/mon-bus.test.tsx
git commit -m "feat(chauffeur): mon bus page with transport pointage"
```

---

## Notes for implementer

- `Bus` and `EleveBusItem` types come from `@/services/transport.service` (the file exports them as named interfaces at the top, not from a `types/` file).
- The `chauffeurService.getBus()` returns the first bus from the list — the backend filters by the authenticated chauffeur automatically.
- `usePointageStore` is the **personal** attendance store (staff arrivée/départ). The transport pointage (élèves montée/descente) goes directly through `chauffeurService.pointerEleve()` — no dedicated store needed.
- OOM warning: run tests per-file, not all together.
