# Plan 3b — Élève + Parent Roles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Élève (student) and Parent roles from Expo React Native to Next.js 15 PWA — 12 tasks covering ~15 screens.

**Architecture:** Same pattern as Plan 3a (Enseignant): `'use client'` pages in `app/(app)/[role]/`, Zustand stores for data, bottom nav component per role, Vitest + @testing-library tests. Élève uses `useEleveStore`, `useDevoirsStore`, `useElearningStore`, `useMessagesStore`. Parent uses `useParentStore`, `useMessagesStore`.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, shadcn/ui (New York), Zustand, Vitest + @testing-library/react, sonner toasts

---

## Existing code to reuse

- `PageHeader` from `@/components/admin/page-header` — props: `title`, `backHref?`, `action?`
- `StatusBadge` from `@/components/admin/status-badge`
- `Button`, `Input`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from `@/components/ui/*`
- `formatMontant`, `formatDate`, `formatHeure`, `getInitiales` from `@/lib/format`
- `useAuthStore` from `@/stores/auth.store` — `user: User | null`, `logout: () => Promise<void>`
- `useEleveStore` — `notes: NoteMatiere[]`, `cours: CoursJour[]`, `classe: string|null`, `absences: AbsenceEleve[]`, `fetchNotes()`, `fetchCours()`, `fetchAbsences()`
- `useDevoirsStore` — `devoirs: Devoir[]`, `isLoading`, `isSoumettant`, `fetchDevoirs()`, `soumettre(id, contenu?)`
- `useElearningStore` — `cours: CoursResume[]`, `coursDetail: CoursDetail|null`, `isLoading`, `isLoadingDetail`, `fetchCours()`, `fetchCoursDetail(id)`, `marquerComplete(id)`, `clearDetail()`
- `useParentStore` — `enfants: Enfant[]`, `enfantSelectionne: EnfantDetail|null`, `paiements: Paiement[]`, `totalPaye`, `isLoadingEnfants`, `isLoadingDetail`, `isLoadingPaiements`, `isJustifiant`, `isReclamant`, `fetchEnfants()`, `fetchEnfantDetail(id)`, `fetchPaiements()`, `justifierAbsence(absenceId, justification)`, `reclamarNote(noteId, motif)`, `deselectionnerEnfant()`
- `useMessagesStore` — `conversations`, `messages`, `convMeta`, `isSending`, `fetchConversations()`, `fetchConversation(userId)`, `loadMore(userId)`, `envoyer(userId, contenu)`
- `subscriberMessages` from `@/lib/pusher`
- `tokenStorage` from `@/services/api`
- `cn` from `@/lib/utils`

## Key types

```ts
// types/eleve.ts
interface NoteDetail { id: number; valeur: number; bareme: number; type: string; commentaire: string | null; }
interface PeriodeNotes { periode: 'trimestre1'|'trimestre2'|'trimestre3'; notes: NoteDetail[]; moyenne: number | null; }
interface NoteMatiere { matiere_id: number; matiere: string; coefficient: number; periodes: PeriodeNotes[]; }
interface CoursJour { id: number; jour: string; heure_debut: string; heure_fin: string; salle: string|null; matiere: string; enseignant: string|null; }
interface AbsenceEleve { id: number; date: string; type: 'absence'|'retard'; justifiee: boolean; justification: string|null; matiere: string|null; }

// types/parent.ts
interface Enfant { id: number; matricule: string; nom_complet: string; avatar_url: string|null; classe: string|null; departement: string|null; nb_absences: number; lien: string|null; }
interface EnfantDetail { id: number; nom_complet: string; matricule: string; classe: string|null; classe_id?: number; notes: NoteMatiere[]; absences: AbsenceEleve[]; cours: CoursJour[]; }
interface Paiement { id: number; eleve: string|null; type: string; montant: number; methode: string; statut: 'en_attente'|'valide'|'echec'|'rembourse'; reference: string|null; periode: string|null; date: string; }

// types/elearning.ts
interface CoursResume { id: number; titre: string; description: string|null; video_url: string|null; fichier_url: string|null; enseignant: string|null; matiere: string|null; classe: string|null; publie_le: string|null; completion_percentage: number; complete: boolean; complete_le: string|null; }
interface CoursDetail extends CoursResume { contenu: string|null; }

// types/devoirs.ts
interface Devoir { id: number; matiere: string; titre: string; description: string|null; date_limite: string; date_limite_iso?: string; fait: boolean; contenu_soumis?: string|null; enseignant: string|null; classe: string|null; }
```

---

### Task 1: Élève — Bottom nav + layout + menu

**Files:**
- Create: `components/eleve/bottom-nav.tsx`
- Create: `app/(app)/eleve/layout.tsx`
- Create: `app/(app)/eleve/menu/page.tsx`
- Test: `__tests__/eleve/layout-menu.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/eleve/layout-menu.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/eleve/accueil',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 1, nom_complet: 'Koné Aminata', email: 'k@test.ci', prenom: 'Aminata' }, logout: vi.fn() }),
  ),
}));
vi.mock('@/stores/eleve.store', () => ({
  useEleveStore: vi.fn((sel) =>
    sel({ notes: [], cours: [], classe: '3ème A', absences: [] }),
  ),
}));

import EleveBottomNav from '@/components/eleve/bottom-nav';
import EleveMenuPage from '@/app/(app)/eleve/menu/page';

describe('Élève Layout & Menu', () => {
  it('affiche les 4 onglets de navigation', () => {
    render(<EleveBottomNav />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Cours')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('affiche le nom de l\'élève dans le menu', () => {
    render(<EleveMenuPage />);
    expect(screen.getByText('Koné Aminata')).toBeInTheDocument();
  });

  it('affiche le bouton de déconnexion', () => {
    render(<EleveMenuPage />);
    expect(screen.getByRole('button', { name: /déconnecter/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/eleve/layout-menu.test.tsx
```
Expected: FAIL — module not found

- [ ] **Step 3: Create `components/eleve/bottom-nav.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, MessageCircle, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/eleve/accueil',   icon: Home,          label: 'Accueil'  },
  { href: '/eleve/cours',     icon: BookOpen,      label: 'Cours'    },
  { href: '/eleve/messages',  icon: MessageCircle, label: 'Messages' },
  { href: '/eleve/menu',      icon: Menu,          label: 'Menu'     },
];

export default function EleveBottomNav() {
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

- [ ] **Step 4: Create `app/(app)/eleve/layout.tsx`**

```tsx
import EleveBottomNav from '@/components/eleve/bottom-nav';

export default function EleveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 max-w-lg mx-auto">
      {children}
      <EleveBottomNav />
    </div>
  );
}
```

- [ ] **Step 5: Create `app/(app)/eleve/menu/page.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { LogOut, BookOpen, FileText, CalendarCheck, MessageCircle, ClipboardList } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useEleveStore } from '@/stores/eleve.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { getInitiales } from '@/lib/format';

const QUICK_LINKS = [
  { href: '/eleve/notes',         icon: FileText,      label: 'Mes notes'      },
  { href: '/eleve/absences',      icon: CalendarCheck, label: 'Mes absences'   },
  { href: '/eleve/devoirs',       icon: ClipboardList, label: 'Devoirs'        },
  { href: '/eleve/cours-en-ligne',icon: BookOpen,      label: 'E-learning'     },
  { href: '/eleve/messages',      icon: MessageCircle, label: 'Messages'       },
];

export default function EleveMenuPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const classe = useEleveStore((s) => s.classe);

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
            {classe && (
              <span className="bg-blue-100 text-[#2B3D88] text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block">
                {classe}
              </span>
            )}
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
```

- [ ] **Step 6: Run test to verify it passes**

```
npx vitest run __tests__/eleve/layout-menu.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 7: Commit**

```bash
git add components/eleve/bottom-nav.tsx app/(app)/eleve/layout.tsx app/(app)/eleve/menu/page.tsx __tests__/eleve/layout-menu.test.tsx
git commit -m "feat(eleve): bottom nav, layout, menu page"
```

---

### Task 2: Élève — Accueil

**Files:**
- Create: `app/(app)/eleve/accueil/page.tsx`
- Test: `__tests__/eleve/accueil.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/eleve/accueil.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 1, nom_complet: 'Koné Aminata', prenom: 'Aminata' } }),
  ),
}));
vi.mock('@/stores/eleve.store', () => ({
  useEleveStore: vi.fn((sel) =>
    sel({
      notes: [{ matiere_id: 1, matiere: 'Maths', coefficient: 3, periodes: [] }],
      absences: [{ id: 1, date: '2026-05-01', type: 'absence', justifiee: false, justification: null, matiere: null }],
      classe: '3ème A',
      fetchNotes: vi.fn(),
      fetchAbsences: vi.fn(),
    }),
  ),
}));
vi.mock('@/stores/devoirs.store', () => ({
  useDevoirsStore: vi.fn((sel) =>
    sel({
      devoirs: [
        { id: 1, matiere: 'Maths', titre: 'Exercice 5', description: null, date_limite: '15 juin', fait: false, enseignant: null, classe: null },
        { id: 2, matiere: 'SVT', titre: 'Rapport', description: null, date_limite: '20 juin', fait: true, enseignant: null, classe: null },
      ],
      fetchDevoirs: vi.fn(),
    }),
  ),
}));

import EleveAccueilPage from '@/app/(app)/eleve/accueil/page';

describe('Élève Accueil', () => {
  it('affiche le prénom de l\'élève', () => {
    render(<EleveAccueilPage />);
    expect(screen.getByText(/Aminata/i)).toBeInTheDocument();
  });

  it('affiche le nombre d\'absences', () => {
    render(<EleveAccueilPage />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('affiche les devoirs non rendus', () => {
    render(<EleveAccueilPage />);
    expect(screen.getByText('Exercice 5')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/eleve/accueil.test.tsx
```

- [ ] **Step 3: Create `app/(app)/eleve/accueil/page.tsx`**

```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

```
npx vitest run __tests__/eleve/accueil.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 5: Commit**

```bash
git add app/(app)/eleve/accueil/page.tsx __tests__/eleve/accueil.test.tsx
git commit -m "feat(eleve): accueil page"
```

---

### Task 3: Élève — Emploi du temps + Notes + Absences

**Files:**
- Create: `app/(app)/eleve/cours/page.tsx`
- Create: `app/(app)/eleve/notes/page.tsx`
- Create: `app/(app)/eleve/absences/page.tsx`
- Test: `__tests__/eleve/cours-notes-absences.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/eleve/cours-notes-absences.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/stores/eleve.store', () => ({
  useEleveStore: vi.fn((sel) =>
    sel({
      cours: [{ id: 1, jour: 'Lundi', heure_debut: '08:00', heure_fin: '10:00', salle: 'A101', matiere: 'Mathématiques', enseignant: 'M. Koné' }],
      notes: [{ matiere_id: 1, matiere: 'Mathématiques', coefficient: 3, periodes: [{ periode: 'trimestre1', notes: [{ id: 1, valeur: 14, bareme: 20, type: 'devoir', commentaire: null }], moyenne: 14 }] }],
      absences: [{ id: 1, date: '2026-05-01', type: 'absence', justifiee: false, justification: null, matiere: 'SVT' }],
      isLoadingCours: false,
      isLoadingNotes: false,
      isLoadingAbsences: false,
      fetchCours: vi.fn(),
      fetchNotes: vi.fn(),
      fetchAbsences: vi.fn(),
    }),
  ),
}));

import EleveCoursPage from '@/app/(app)/eleve/cours/page';
import EleveNotesPage from '@/app/(app)/eleve/notes/page';
import EleveAbsencesPage from '@/app/(app)/eleve/absences/page';

describe('Élève Cours / Notes / Absences', () => {
  it('affiche les cours du jour', () => {
    render(<EleveCoursPage />);
    expect(screen.getByText('Mathématiques')).toBeInTheDocument();
    expect(screen.getByText(/08:00/)).toBeInTheDocument();
  });

  it('affiche les notes par matière avec la moyenne', () => {
    render(<EleveNotesPage />);
    expect(screen.getByText('Mathématiques')).toBeInTheDocument();
    expect(screen.getByText(/14/)).toBeInTheDocument();
  });

  it('affiche les absences avec le statut', () => {
    render(<EleveAbsencesPage />);
    expect(screen.getByText(/2026-05-01|01\/05\/2026|mai/i)).toBeInTheDocument();
    expect(screen.getByText(/non justifi/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/eleve/cours-notes-absences.test.tsx
```

- [ ] **Step 3: Create `app/(app)/eleve/cours/page.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import { useEleveStore } from '@/stores/eleve.store';
import { PageHeader } from '@/components/admin/page-header';

const JOURS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function EleveCoursPage() {
  const { cours, isLoadingCours, fetchCours, classe } = useEleveStore((s) => ({
    cours: s.cours,
    isLoadingCours: s.isLoadingCours,
    fetchCours: s.fetchCours,
    classe: s.classe,
  }));

  useEffect(() => { fetchCours(); }, [fetchCours]);

  const grouped = JOURS_ORDER.reduce<Record<string, typeof cours>>((acc, jour) => {
    const items = cours.filter((c) => c.jour === jour);
    if (items.length) acc[jour] = items;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Emploi du temps" subtitle={classe ?? undefined} />
      {isLoadingCours && cours.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      ) : cours.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucun cours disponible</p>
      ) : (
        <div className="p-4 space-y-4">
          {Object.entries(grouped).map(([jour, items]) => (
            <div key={jour} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <span className="text-sm font-semibold text-[#2B3D88]">{jour}</span>
              </div>
              {items.map((c) => (
                <div key={c.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="text-center min-w-[48px]">
                    <p className="text-xs font-medium text-gray-900">{c.heure_debut}</p>
                    <p className="text-[10px] text-gray-400">{c.heure_fin}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{c.matiere}</p>
                    {c.enseignant && <p className="text-xs text-gray-400 truncate">{c.enseignant}</p>}
                    {c.salle && <p className="text-xs text-gray-400">{c.salle}</p>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create `app/(app)/eleve/notes/page.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import { useEleveStore } from '@/stores/eleve.store';
import { PageHeader } from '@/components/admin/page-header';

const PERIODE_LABELS: Record<string, string> = {
  trimestre1: 'Trimestre 1',
  trimestre2: 'Trimestre 2',
  trimestre3: 'Trimestre 3',
};

export default function EleveNotesPage() {
  const { notes, isLoadingNotes, fetchNotes } = useEleveStore((s) => ({
    notes: s.notes,
    isLoadingNotes: s.isLoadingNotes,
    fetchNotes: s.fetchNotes,
  }));

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  return (
    <div>
      <PageHeader title="Mes notes" />
      {isLoadingNotes && notes.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      ) : notes.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucune note disponible</p>
      ) : (
        <div className="p-4 space-y-3">
          {notes.map((nm) => (
            <div key={nm.matiere_id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">{nm.matiere}</span>
                <span className="text-xs text-gray-400">Coef. {nm.coefficient}</span>
              </div>
              {nm.periodes.map((p) => (
                <div key={p.periode} className="px-4 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">{PERIODE_LABELS[p.periode] ?? p.periode}</span>
                    {p.moyenne !== null && (
                      <span className={`text-sm font-bold ${p.moyenne >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                        {p.moyenne}/20
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.notes.map((n) => (
                      <div key={n.id} className="bg-gray-50 rounded-lg px-2 py-1 text-center">
                        <p className="text-xs font-semibold text-gray-800">{n.valeur}/{n.bareme}</p>
                        <p className="text-[10px] text-gray-400">{n.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create `app/(app)/eleve/absences/page.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import { useEleveStore } from '@/stores/eleve.store';
import { PageHeader } from '@/components/admin/page-header';
import { formatDate } from '@/lib/format';

export default function EleveAbsencesPage() {
  const { absences, isLoadingAbsences, fetchAbsences } = useEleveStore((s) => ({
    absences: s.absences,
    isLoadingAbsences: s.isLoadingAbsences,
    fetchAbsences: s.fetchAbsences,
  }));

  useEffect(() => { fetchAbsences(); }, [fetchAbsences]);

  return (
    <div>
      <PageHeader title="Mes absences" />
      {isLoadingAbsences && absences.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      ) : absences.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucune absence enregistrée</p>
      ) : (
        <div className="p-4 space-y-2">
          {absences.map((a) => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{formatDate(a.date)}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {a.type === 'retard' ? 'Retard' : 'Absence'}
                  {a.matiere && ` · ${a.matiere}`}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                a.justifiee ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                {a.justifiee ? 'Justifiée' : 'Non justifiée'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

```
npx vitest run __tests__/eleve/cours-notes-absences.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 7: Commit**

```bash
git add app/(app)/eleve/cours/page.tsx app/(app)/eleve/notes/page.tsx app/(app)/eleve/absences/page.tsx __tests__/eleve/cours-notes-absences.test.tsx
git commit -m "feat(eleve): emploi du temps, notes, absences pages"
```

---

### Task 4: Élève — Devoirs

**Files:**
- Create: `app/(app)/eleve/devoirs/page.tsx`
- Test: `__tests__/eleve/devoirs.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/eleve/devoirs.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockSoumettre } = vi.hoisted(() => ({
  mockSoumettre: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/stores/devoirs.store', () => ({
  useDevoirsStore: vi.fn((sel) =>
    sel({
      devoirs: [
        { id: 1, matiere: 'Maths', titre: 'Exercice algèbre', description: 'Faire les exercices 1 à 5', date_limite: '15 juin 2026', fait: false, enseignant: 'M. Bamba', classe: '3ème A' },
        { id: 2, matiere: 'SVT', titre: 'Rapport de labo', description: null, date_limite: '20 juin 2026', fait: true, enseignant: null, classe: null },
      ],
      isLoading: false,
      isSoumettant: false,
      fetchDevoirs: vi.fn(),
      soumettre: mockSoumettre,
    }),
  ),
}));

import EleveDevoirsPage from '@/app/(app)/eleve/devoirs/page';

describe('Élève Devoirs', () => {
  it('affiche la liste des devoirs', () => {
    render(<EleveDevoirsPage />);
    expect(screen.getByText('Exercice algèbre')).toBeInTheDocument();
    expect(screen.getByText('Rapport de labo')).toBeInTheDocument();
  });

  it('affiche le badge "Rendu" pour les devoirs faits', () => {
    render(<EleveDevoirsPage />);
    expect(screen.getByText('Rendu')).toBeInTheDocument();
  });

  it('soumet un devoir après avoir cliqué Soumettre', async () => {
    render(<EleveDevoirsPage />);
    fireEvent.click(screen.getByRole('button', { name: /soumettre/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() => expect(mockSoumettre).toHaveBeenCalledWith(1, ''));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/eleve/devoirs.test.tsx
```

- [ ] **Step 3: Create `app/(app)/eleve/devoirs/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useDevoirsStore } from '@/stores/devoirs.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { Devoir } from '@/types/devoirs';

export default function EleveDevoirsPage() {
  const { devoirs, isLoading, isSoumettant, fetchDevoirs, soumettre } = useDevoirsStore((s) => ({
    devoirs: s.devoirs,
    isLoading: s.isLoading,
    isSoumettant: s.isSoumettant,
    fetchDevoirs: s.fetchDevoirs,
    soumettre: s.soumettre,
  }));
  const [selected, setSelected] = useState<Devoir | null>(null);
  const [contenu, setContenu] = useState('');

  useEffect(() => { fetchDevoirs(); }, [fetchDevoirs]);

  const handleSoumettre = async () => {
    if (!selected) return;
    const ok = await soumettre(selected.id, contenu);
    if (ok) {
      toast.success('Devoir soumis avec succès');
      setSelected(null);
      setContenu('');
    } else {
      toast.error('Erreur lors de la soumission');
    }
  };

  return (
    <div>
      <PageHeader title="Devoirs" />
      {isLoading && devoirs.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      ) : devoirs.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucun devoir</p>
      ) : (
        <div className="p-4 space-y-3">
          {devoirs.map((d) => (
            <div key={d.id} className="bg-white rounded-xl shadow-sm px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{d.titre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.matiere}</p>
                  {d.description && <p className="text-xs text-gray-600 mt-1">{d.description}</p>}
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={11} className="text-gray-400" aria-hidden="true" />
                    <p className="text-[11px] text-gray-400">{d.date_limite}</p>
                  </div>
                </div>
                {d.fait ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                    <CheckCircle2 size={12} aria-hidden="true" />
                    Rendu
                  </span>
                ) : (
                  <Button
                    size="sm"
                    className="bg-[#2B3D88] hover:bg-[#1a255e] shrink-0"
                    onClick={() => { setSelected(d); setContenu(''); }}
                  >
                    Soumettre
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Soumettre — {selected?.titre}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Votre réponse (optionnel)…"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={5}
            aria-label="Contenu de la soumission"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Annuler</Button>
            <Button
              className="bg-[#2B3D88] hover:bg-[#1a255e]"
              onClick={handleSoumettre}
              disabled={isSoumettant}
              aria-label="Confirmer la soumission"
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```
npx vitest run __tests__/eleve/devoirs.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 5: Commit**

```bash
git add app/(app)/eleve/devoirs/page.tsx __tests__/eleve/devoirs.test.tsx
git commit -m "feat(eleve): devoirs page with soumission dialog"
```

---

### Task 5: Élève — E-learning (liste + détail)

**Files:**
- Create: `app/(app)/eleve/cours-en-ligne/page.tsx`
- Create: `app/(app)/eleve/cours-en-ligne/[id]/page.tsx`
- Test: `__tests__/eleve/elearning.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/eleve/elearning.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '5' }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockMarquer } = vi.hoisted(() => ({
  mockMarquer: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/stores/elearning.store', () => ({
  useElearningStore: vi.fn((sel) =>
    sel({
      cours: [
        { id: 5, titre: 'Introduction à Python', description: 'Bases du langage', video_url: null, fichier_url: null, enseignant: 'M. Traoré', matiere: 'Informatique', classe: null, publie_le: '2026-05-01', completion_percentage: 50, complete: false, complete_le: null },
      ],
      coursDetail: { id: 5, titre: 'Introduction à Python', description: 'Bases', video_url: 'https://yt.be/test', fichier_url: null, enseignant: null, matiere: 'Informatique', classe: null, publie_le: null, completion_percentage: 50, complete: false, complete_le: null, contenu: 'Python est un langage polyvalent.' },
      isLoading: false,
      isLoadingDetail: false,
      fetchCours: vi.fn(),
      fetchCoursDetail: vi.fn(),
      marquerComplete: mockMarquer,
      clearDetail: vi.fn(),
    }),
  ),
}));

import EleveElearningPage from '@/app/(app)/eleve/cours-en-ligne/page';
import EleveElearningDetailPage from '@/app/(app)/eleve/cours-en-ligne/[id]/page';

describe('Élève E-learning', () => {
  it('affiche la liste des cours', () => {
    render(<EleveElearningPage />);
    expect(screen.getByText('Introduction à Python')).toBeInTheDocument();
  });

  it('affiche le détail du cours avec le contenu', async () => {
    render(<EleveElearningDetailPage />);
    await waitFor(() => expect(screen.getByText('Python est un langage polyvalent.')).toBeInTheDocument());
  });

  it('marque le cours comme terminé', async () => {
    render(<EleveElearningDetailPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: /terminé|complet/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /terminé|complet/i }));
    await waitFor(() => expect(mockMarquer).toHaveBeenCalledWith(5));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/eleve/elearning.test.tsx
```

- [ ] **Step 3: Create `app/(app)/eleve/cours-en-ligne/page.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, BookOpen } from 'lucide-react';
import { useElearningStore } from '@/stores/elearning.store';
import { PageHeader } from '@/components/admin/page-header';

export default function EleveElearningPage() {
  const { cours, isLoading, fetchCours } = useElearningStore((s) => ({
    cours: s.cours,
    isLoading: s.isLoading,
    fetchCours: s.fetchCours,
  }));

  useEffect(() => { fetchCours(); }, [fetchCours]);

  return (
    <div>
      <PageHeader title="E-learning" />
      {isLoading && cours.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      ) : cours.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">Aucun cours disponible</p>
      ) : (
        <div className="p-4 space-y-3">
          {cours.map((c) => (
            <Link
              key={c.id}
              href={`/eleve/cours-en-ligne/${c.id}`}
              className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors block"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-[#2B3D88]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.titre}</p>
                  {c.complete && (
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" aria-label="Terminé" />
                  )}
                </div>
                {c.matiere && <p className="text-xs text-gray-400 mt-0.5">{c.matiere}</p>}
                {c.enseignant && <p className="text-xs text-gray-400">{c.enseignant}</p>}
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2B3D88] rounded-full transition-all"
                      style={{ width: `${c.completion_percentage}%` }}
                      role="progressbar"
                      aria-valuenow={c.completion_percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progression : ${c.completion_percentage}%`}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create `app/(app)/eleve/cours-en-ligne/[id]/page.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useElearningStore } from '@/stores/elearning.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';

export default function EleveElearningDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { coursDetail, isLoadingDetail, fetchCoursDetail, marquerComplete, clearDetail } = useElearningStore((s) => ({
    coursDetail: s.coursDetail,
    isLoadingDetail: s.isLoadingDetail,
    fetchCoursDetail: s.fetchCoursDetail,
    marquerComplete: s.marquerComplete,
    clearDetail: s.clearDetail,
  }));

  useEffect(() => {
    if (!isNaN(id)) fetchCoursDetail(id);
    return () => { clearDetail(); };
  }, [id, fetchCoursDetail, clearDetail]);

  const handleMarquer = async () => {
    await marquerComplete(id);
    toast.success('Cours marqué comme terminé');
  };

  if (isLoadingDetail) {
    return (
      <div>
        <PageHeader title="Cours" backHref="/eleve/cours-en-ligne" />
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      </div>
    );
  }

  if (!coursDetail) {
    return (
      <div>
        <PageHeader title="Cours" backHref="/eleve/cours-en-ligne" />
        <p className="text-center text-sm text-gray-400 py-16">Cours introuvable</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={coursDetail.titre} backHref="/eleve/cours-en-ligne" />
      <div className="p-4 space-y-4">
        {coursDetail.matiere && (
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{coursDetail.matiere}</p>
        )}

        {coursDetail.description && (
          <p className="text-sm text-gray-600">{coursDetail.description}</p>
        )}

        {coursDetail.contenu && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm font-medium text-gray-800 mb-2">Contenu</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{coursDetail.contenu}</p>
          </div>
        )}

        {coursDetail.video_url && (
          <a
            href={coursDetail.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-50 text-[#2B3D88] rounded-xl px-4 py-3 text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <ExternalLink size={16} aria-hidden="true" />
            Voir la vidéo
          </a>
        )}

        {!coursDetail.complete ? (
          <Button
            className="w-full bg-[#2B3D88] hover:bg-[#1a255e]"
            onClick={handleMarquer}
            aria-label="Marquer comme terminé"
          >
            <CheckCircle2 size={16} className="mr-2" aria-hidden="true" />
            Marquer comme terminé
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-600 py-2">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span className="text-sm font-medium">Cours complété</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

```
npx vitest run __tests__/eleve/elearning.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 6: Commit**

```bash
git add app/(app)/eleve/cours-en-ligne/page.tsx "app/(app)/eleve/cours-en-ligne/[id]/page.tsx" __tests__/eleve/elearning.test.tsx
git commit -m "feat(eleve): e-learning list and detail pages"
```

---

### Task 6: Élève — Messages

**Files:**
- Create: `app/(app)/eleve/messages/page.tsx`
- Create: `app/(app)/eleve/messages/[id]/page.tsx`
- Test: `__tests__/eleve/messages.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/eleve/messages.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '7' }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/lib/pusher', () => ({
  subscriberMessages: vi.fn().mockResolvedValue(() => {}),
}));
vi.mock('@/services/api', () => ({
  tokenStorage: { get: vi.fn().mockReturnValue('token') },
}));
vi.mock('@/stores/messages.store', () => ({
  useMessagesStore: vi.fn((sel) =>
    sel({
      conversations: [
        { user_id: 7, nom: 'M. Bamba', avatar_url: null, dernier_message: 'Bonjour', dernier_at: '2026-05-24', non_lus: 1 },
      ],
      messages: {
        7: [{ id: 1, contenu: 'Bonjour monsieur', type: 'texte', fichier_url: null, fichier_nom: null, envoyeur: true, lu: true, heure: '10:00', full_date: '2026-05-24' }],
      },
      convMeta: { 7: { currentPage: 1, hasMore: false } },
      isLoading: false,
      isSending: false,
      fetchConversations: vi.fn(),
      fetchConversation: vi.fn(),
      loadMore: vi.fn(),
      envoyer: vi.fn(),
    }),
  ),
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 99, nom_complet: 'Koné Aminata' } }),
  ),
}));

import EleveMessagesPage from '@/app/(app)/eleve/messages/page';
import EleveMessageThreadPage from '@/app/(app)/eleve/messages/[id]/page';

describe('Élève Messages', () => {
  it('affiche la liste des conversations', () => {
    render(<EleveMessagesPage />);
    expect(screen.getByText('M. Bamba')).toBeInTheDocument();
  });

  it('affiche le badge non lus', () => {
    render(<EleveMessagesPage />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('affiche les messages dans le thread', async () => {
    render(<EleveMessageThreadPage />);
    await waitFor(() => expect(screen.getByText('Bonjour monsieur')).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/eleve/messages.test.tsx
```

- [ ] **Step 3: Create `app/(app)/eleve/messages/page.tsx`**

Identical to enseignant messages page but with `/eleve/messages` base path:

```tsx
'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useMessagesStore } from '@/stores/messages.store';
import { PageHeader } from '@/components/admin/page-header';
import { getInitiales, formatHeure } from '@/lib/format';

export default function EleveMessagesPage() {
  const { conversations, isLoading, fetchConversations } = useMessagesStore((s) => ({
    conversations: s.conversations,
    isLoading: s.isLoading,
    fetchConversations: s.fetchConversations,
  }));

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  return (
    <div>
      <PageHeader title="Messages" />
      <div role="list" aria-label="Conversations">
        {isLoading && conversations.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">Aucune conversation</p>
          </div>
        ) : (
          conversations.map(conv => (
            <Link
              key={conv.user_id}
              href={`/eleve/messages/${conv.user_id}`}
              role="listitem"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
              aria-label={`Conversation avec ${conv.nom}${conv.non_lus > 0 ? `, ${conv.non_lus} messages non lus` : ''}`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center" aria-hidden="true">
                  <span className="text-base font-semibold text-[#2B3D88]">{getInitiales(conv.nom)}</span>
                </div>
                {conv.non_lus > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1" aria-hidden="true">
                    {conv.non_lus > 9 ? '9+' : conv.non_lus}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-sm truncate ${conv.non_lus > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {conv.nom}
                  </span>
                  <span className="text-[11px] text-gray-400 shrink-0">{formatHeure(conv.dernier_at)}</span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${conv.non_lus > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                  {conv.dernier_message}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `app/(app)/eleve/messages/[id]/page.tsx`**

Identical to enseignant thread page but with `backHref="/eleve/messages"`:

```tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Send } from 'lucide-react';
import { useMessagesStore } from '@/stores/messages.store';
import { useAuthStore } from '@/stores/auth.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { subscriberMessages } from '@/lib/pusher';
import { tokenStorage } from '@/services/api';
import { cn } from '@/lib/utils';

export default function EleveMessageThreadPage() {
  const params = useParams();
  const userId = Number(params.id);
  const { messages, convMeta, isSending, fetchConversation, loadMore, envoyer } = useMessagesStore((s) => ({
    messages: s.messages,
    convMeta: s.convMeta,
    isSending: s.isSending,
    fetchConversation: s.fetchConversation,
    loadMore: s.loadMore,
    envoyer: s.envoyer,
  }));
  const myUser = useAuthStore((s) => s.user);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const thread = messages[userId] ?? [];
  const meta = convMeta[userId];

  useEffect(() => {
    if (!isNaN(userId)) fetchConversation(userId);
  }, [fetchConversation, userId]);

  useEffect(() => {
    if (!myUser?.id || isNaN(userId)) return;
    const token = tokenStorage.get() ?? '';
    let unsub: (() => void) | undefined;
    subscriberMessages(myUser.id, token, () => { fetchConversation(userId); }).then(fn => { unsub = fn; });
    return () => { unsub?.(); };
  }, [myUser?.id, userId, fetchConversation]);

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || isSending) return;
    setText('');
    await envoyer(userId, content);
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Conversation" backHref="/eleve/messages" />
      {meta?.hasMore && (
        <div className="text-center p-2 border-b border-gray-100">
          <Button variant="ghost" size="sm" onClick={() => loadMore(userId)}>
            Voir les messages précédents
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20" role="log" aria-live="polite" aria-label="Messages">
        {thread.map(msg => (
          <div key={msg.id} className={cn('flex', msg.envoyeur ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[75%] px-3 py-2 rounded-2xl text-sm break-words',
              msg.envoyeur
                ? 'bg-[#2B3D88] text-white rounded-br-sm'
                : 'bg-white text-gray-900 shadow-sm rounded-bl-sm',
            )}>
              <p className="whitespace-pre-wrap">{msg.contenu}</p>
              <p className={cn('text-[10px] mt-1 text-right', msg.envoyeur ? 'text-blue-200' : 'text-gray-400')}>
                {msg.heure}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 flex items-center gap-2 px-3 py-2"
      >
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Écrire un message…"
          className="flex-1"
          autoComplete="off"
          aria-label="Message à envoyer"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!text.trim() || isSending}
          className="bg-[#2B3D88] hover:bg-[#1a255e] shrink-0"
          aria-label="Envoyer"
        >
          <Send size={16} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

```
npx vitest run __tests__/eleve/messages.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 6: Commit**

```bash
git add app/(app)/eleve/messages/page.tsx "app/(app)/eleve/messages/[id]/page.tsx" __tests__/eleve/messages.test.tsx
git commit -m "feat(eleve): messages list and thread pages"
```

---

### Task 7: Parent — Bottom nav + layout + menu

**Files:**
- Create: `components/parent/bottom-nav.tsx`
- Create: `app/(app)/parent/layout.tsx`
- Create: `app/(app)/parent/menu/page.tsx`
- Test: `__tests__/parent/layout-menu.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/parent/layout-menu.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/parent/accueil',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 1, nom_complet: 'Coulibaly Jean', email: 'j@test.ci' }, logout: vi.fn() }),
  ),
}));
vi.mock('@/stores/parent.store', () => ({
  useParentStore: vi.fn((sel) =>
    sel({ enfants: [{ id: 1, nom_complet: 'Coulibaly Marie', matricule: 'E001', avatar_url: null, classe: '3ème A', departement: null, nb_absences: 0, lien: 'Père' }] }),
  ),
}));

import ParentBottomNav from '@/components/parent/bottom-nav';
import ParentMenuPage from '@/app/(app)/parent/menu/page';

describe('Parent Layout & Menu', () => {
  it('affiche les 4 onglets de navigation', () => {
    render(<ParentBottomNav />);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Paiements')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('affiche le nom du parent dans le menu', () => {
    render(<ParentMenuPage />);
    expect(screen.getByText('Coulibaly Jean')).toBeInTheDocument();
  });

  it('affiche le bouton de déconnexion', () => {
    render(<ParentMenuPage />);
    expect(screen.getByRole('button', { name: /déconnecter/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/parent/layout-menu.test.tsx
```

- [ ] **Step 3: Create `components/parent/bottom-nav.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, MessageCircle, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/parent/accueil',    icon: Home,          label: 'Accueil'    },
  { href: '/parent/paiements',  icon: CreditCard,    label: 'Paiements'  },
  { href: '/parent/messages',   icon: MessageCircle, label: 'Messages'   },
  { href: '/parent/menu',       icon: Menu,          label: 'Menu'       },
];

export default function ParentBottomNav() {
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

- [ ] **Step 4: Create `app/(app)/parent/layout.tsx`**

```tsx
import ParentBottomNav from '@/components/parent/bottom-nav';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 max-w-lg mx-auto">
      {children}
      <ParentBottomNav />
    </div>
  );
}
```

- [ ] **Step 5: Create `app/(app)/parent/menu/page.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { LogOut, Users, CreditCard, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useParentStore } from '@/stores/parent.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { getInitiales } from '@/lib/format';

const QUICK_LINKS = [
  { href: '/parent/accueil',   icon: Users,         label: 'Mes enfants'  },
  { href: '/parent/paiements', icon: CreditCard,    label: 'Paiements'    },
  { href: '/parent/messages',  icon: MessageCircle, label: 'Messages'     },
];

export default function ParentMenuPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const enfants = useParentStore((s) => s.enfants);

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
              {enfants.length} enfant{enfants.length !== 1 ? 's' : ''}
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
```

- [ ] **Step 6: Run test to verify it passes**

```
npx vitest run __tests__/parent/layout-menu.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 7: Commit**

```bash
git add components/parent/bottom-nav.tsx app/(app)/parent/layout.tsx app/(app)/parent/menu/page.tsx __tests__/parent/layout-menu.test.tsx
git commit -m "feat(parent): bottom nav, layout, menu page"
```

---

### Task 8: Parent — Accueil + Enfant detail

**Files:**
- Create: `app/(app)/parent/accueil/page.tsx`
- Create: `app/(app)/parent/enfant/[id]/page.tsx`
- Test: `__tests__/parent/accueil-enfant.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/parent/accueil-enfant.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { mockJustifier } = vi.hoisted(() => ({
  mockJustifier: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 1, nom_complet: 'Coulibaly Jean', prenom: 'Jean' } }),
  ),
}));
vi.mock('@/stores/parent.store', () => ({
  useParentStore: vi.fn((sel) =>
    sel({
      enfants: [{ id: 1, nom_complet: 'Coulibaly Marie', matricule: 'E001', avatar_url: null, classe: '3ème A', departement: null, nb_absences: 2, lien: 'Père' }],
      enfantSelectionne: {
        id: 1, nom_complet: 'Coulibaly Marie', matricule: 'E001', classe: '3ème A',
        notes: [{ matiere_id: 1, matiere: 'Maths', coefficient: 3, periodes: [{ periode: 'trimestre1', notes: [], moyenne: 13.5 }] }],
        absences: [{ id: 10, date: '2026-05-10', type: 'absence', justifiee: false, justification: null, matiere: 'Français' }],
        cours: [],
      },
      isLoadingEnfants: false,
      isLoadingDetail: false,
      isJustifiant: false,
      fetchEnfants: vi.fn(),
      fetchEnfantDetail: vi.fn(),
      justifierAbsence: mockJustifier,
      deselectionnerEnfant: vi.fn(),
    }),
  ),
}));

import ParentAccueilPage from '@/app/(app)/parent/accueil/page';
import ParentEnfantDetailPage from '@/app/(app)/parent/enfant/[id]/page';

describe('Parent Accueil & Enfant Detail', () => {
  it('affiche la liste des enfants', () => {
    render(<ParentAccueilPage />);
    expect(screen.getByText('Coulibaly Marie')).toBeInTheDocument();
  });

  it('affiche les notes de l\'enfant', async () => {
    render(<ParentEnfantDetailPage />);
    await waitFor(() => expect(screen.getByText('Maths')).toBeInTheDocument());
    expect(screen.getByText(/13\.5/)).toBeInTheDocument();
  });

  it('justifie une absence', async () => {
    render(<ParentEnfantDetailPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: /justifier/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /justifier/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() => expect(mockJustifier).toHaveBeenCalledWith(10, ''));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/parent/accueil-enfant.test.tsx
```

- [ ] **Step 3: Create `app/(app)/parent/accueil/page.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { useParentStore } from '@/stores/parent.store';
import { PageHeader } from '@/components/admin/page-header';
import { getInitiales } from '@/lib/format';

export default function ParentAccueilPage() {
  const user = useAuthStore((s) => s.user);
  const { enfants, isLoadingEnfants, fetchEnfants } = useParentStore((s) => ({
    enfants: s.enfants,
    isLoadingEnfants: s.isLoadingEnfants,
    fetchEnfants: s.fetchEnfants,
  }));

  useEffect(() => { fetchEnfants(); }, [fetchEnfants]);

  const totalAbsences = enfants.reduce((sum, e) => sum + e.nb_absences, 0);

  return (
    <div>
      <PageHeader title={`Bonjour, ${user?.prenom ?? 'Parent'}`} />
      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className="bg-white rounded-xl p-4 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{enfants.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Enfant{enfants.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-[#2B3D88] rounded-xl p-4 flex-1 shadow-sm text-center">
            <p className="text-2xl font-bold text-white">{totalAbsences}</p>
            <p className="text-xs text-blue-200 mt-0.5">Absence{totalAbsences !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {isLoadingEnfants && enfants.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Mes enfants</p>
            {enfants.map((e) => (
              <Link
                key={e.id}
                href={`/parent/enfant/${e.id}`}
                className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors block"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0" aria-hidden="true">
                  <span className="text-base font-bold text-[#2B3D88]">{getInitiales(e.nom_complet)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{e.nom_complet}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.classe ?? 'Classe inconnue'}</p>
                  {e.lien && <p className="text-xs text-gray-400">{e.lien}</p>}
                </div>
                {e.nb_absences > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {e.nb_absences} abs.
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `app/(app)/parent/enfant/[id]/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useParentStore } from '@/stores/parent.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/format';
import type { AbsenceEleve } from '@/types/eleve';

const PERIODE_LABELS: Record<string, string> = {
  trimestre1: 'T1', trimestre2: 'T2', trimestre3: 'T3',
};

type Tab = 'notes' | 'absences' | 'cours';

export default function ParentEnfantDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { enfantSelectionne, isLoadingDetail, isJustifiant, fetchEnfantDetail, justifierAbsence, deselectionnerEnfant } = useParentStore((s) => ({
    enfantSelectionne: s.enfantSelectionne,
    isLoadingDetail: s.isLoadingDetail,
    isJustifiant: s.isJustifiant,
    fetchEnfantDetail: s.fetchEnfantDetail,
    justifierAbsence: s.justifierAbsence,
    deselectionnerEnfant: s.deselectionnerEnfant,
  }));
  const [tab, setTab] = useState<Tab>('notes');
  const [selectedAbsence, setSelectedAbsence] = useState<AbsenceEleve | null>(null);
  const [justification, setJustification] = useState('');

  useEffect(() => {
    if (!isNaN(id)) fetchEnfantDetail(id);
    return () => { deselectionnerEnfant(); };
  }, [id, fetchEnfantDetail, deselectionnerEnfant]);

  const handleJustifier = async () => {
    if (!selectedAbsence) return;
    const ok = await justifierAbsence(selectedAbsence.id, justification);
    if (ok) {
      toast.success('Absence justifiée');
      setSelectedAbsence(null);
      setJustification('');
    } else {
      toast.error('Erreur lors de la justification');
    }
  };

  if (isLoadingDetail) {
    return (
      <div>
        <PageHeader title="Détail élève" backHref="/parent/accueil" />
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
        </div>
      </div>
    );
  }

  if (!enfantSelectionne) {
    return (
      <div>
        <PageHeader title="Élève" backHref="/parent/accueil" />
        <p className="text-center text-sm text-gray-400 py-16">Élève introuvable</p>
      </div>
    );
  }

  const e = enfantSelectionne;

  return (
    <div>
      <PageHeader title={e.nom_complet} backHref="/parent/accueil" subtitle={e.classe ?? undefined} />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
        {(['notes', 'absences', 'cours'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${
              tab === t ? 'text-[#2B3D88] border-b-2 border-[#2B3D88]' : 'text-gray-400'
            }`}
            aria-selected={tab === t}
          >
            {t === 'notes' ? 'Notes' : t === 'absences' ? 'Absences' : 'Cours'}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'notes' && (
          <div className="space-y-3">
            {e.notes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucune note</p>
            ) : e.notes.map((nm) => (
              <div key={nm.matiere_id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">{nm.matiere}</span>
                  <span className="text-xs text-gray-400">Coef. {nm.coefficient}</span>
                </div>
                {nm.periodes.map((p) => (
                  <div key={p.periode} className="flex items-center justify-between px-4 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-600">{PERIODE_LABELS[p.periode] ?? p.periode}</span>
                    {p.moyenne !== null && (
                      <span className={`text-sm font-bold ${p.moyenne >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                        {p.moyenne}/20
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === 'absences' && (
          <div className="space-y-2">
            {e.absences.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucune absence</p>
            ) : e.absences.map((a) => (
              <div key={a.id} className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{formatDate(a.date)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.type === 'retard' ? 'Retard' : 'Absence'}
                    {a.matiere && ` · ${a.matiere}`}
                  </p>
                </div>
                {a.justifiee ? (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">Justifiée</span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[#2B3D88] border-[#2B3D88] shrink-0"
                    onClick={() => { setSelectedAbsence(a); setJustification(''); }}
                    aria-label={`Justifier l'absence du ${a.date}`}
                  >
                    Justifier
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'cours' && (
          <div className="space-y-2">
            {e.cours.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucun cours</p>
            ) : e.cours.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-start gap-3">
                <div className="text-center min-w-[48px]">
                  <p className="text-xs font-medium text-gray-900">{c.heure_debut}</p>
                  <p className="text-[10px] text-gray-400">{c.heure_fin}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.matiere}</p>
                  <p className="text-xs text-gray-400">{c.jour}{c.salle ? ` · ${c.salle}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedAbsence} onOpenChange={(open) => { if (!open) setSelectedAbsence(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justifier l'absence</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Motif de l'absence (optionnel)…"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={4}
            aria-label="Justification de l'absence"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAbsence(null)}>Annuler</Button>
            <Button
              className="bg-[#2B3D88] hover:bg-[#1a255e]"
              onClick={handleJustifier}
              disabled={isJustifiant}
              aria-label="Confirmer la justification"
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

```
npx vitest run __tests__/parent/accueil-enfant.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 6: Commit**

```bash
git add app/(app)/parent/accueil/page.tsx "app/(app)/parent/enfant/[id]/page.tsx" __tests__/parent/accueil-enfant.test.tsx
git commit -m "feat(parent): accueil and enfant detail pages"
```

---

### Task 9: Parent — Paiements

**Files:**
- Create: `app/(app)/parent/paiements/page.tsx`
- Test: `__tests__/parent/paiements.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/parent/paiements.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/stores/parent.store', () => ({
  useParentStore: vi.fn((sel) =>
    sel({
      paiements: [
        { id: 1, eleve: 'Coulibaly Marie', type: 'Scolarité', montant: 50000, methode: 'Mobile Money', statut: 'valide', reference: 'REF001', periode: 'Trimestre 1', date: '2026-01-15' },
        { id: 2, eleve: 'Coulibaly Marie', type: 'Cantine', montant: 15000, methode: 'Espèces', statut: 'en_attente', reference: null, periode: null, date: '2026-05-01' },
      ],
      totalPaye: 65000,
      isLoadingPaiements: false,
      fetchPaiements: vi.fn(),
    }),
  ),
}));

import ParentPaiementsPage from '@/app/(app)/parent/paiements/page';

describe('Parent Paiements', () => {
  it('affiche la liste des paiements', () => {
    render(<ParentPaiementsPage />);
    expect(screen.getByText('Scolarité')).toBeInTheDocument();
    expect(screen.getByText('Cantine')).toBeInTheDocument();
  });

  it('affiche le total payé formaté', () => {
    render(<ParentPaiementsPage />);
    expect(screen.getByText(/65 000|65000/)).toBeInTheDocument();
  });

  it('affiche le statut des paiements', () => {
    render(<ParentPaiementsPage />);
    expect(screen.getByText(/valid/i)).toBeInTheDocument();
    expect(screen.getByText(/attente/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/parent/paiements.test.tsx
```

- [ ] **Step 3: Create `app/(app)/parent/paiements/page.tsx`**

```tsx
'use client';
import { useEffect } from 'react';
import { useParentStore } from '@/stores/parent.store';
import { PageHeader } from '@/components/admin/page-header';
import { formatMontant, formatDate } from '@/lib/format';

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  valide: 'Validé',
  echec: 'Échec',
  rembourse: 'Remboursé',
};

const STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  valide: 'bg-green-100 text-green-700',
  echec: 'bg-red-100 text-red-600',
  rembourse: 'bg-blue-100 text-blue-700',
};

export default function ParentPaiementsPage() {
  const { paiements, totalPaye, isLoadingPaiements, fetchPaiements } = useParentStore((s) => ({
    paiements: s.paiements,
    totalPaye: s.totalPaye,
    isLoadingPaiements: s.isLoadingPaiements,
    fetchPaiements: s.fetchPaiements,
  }));

  useEffect(() => { fetchPaiements(); }, [fetchPaiements]);

  return (
    <div>
      <PageHeader title="Paiements" />
      <div className="p-4 space-y-4">
        <div className="bg-[#2B3D88] rounded-xl p-4 shadow-sm">
          <p className="text-xs text-blue-200 mb-1">Total payé</p>
          <p className="text-2xl font-bold text-white">{formatMontant(totalPaye)}</p>
        </div>

        {isLoadingPaiements && paiements.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" role="status" aria-label="Chargement" />
          </div>
        ) : paiements.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">Aucun paiement</p>
        ) : (
          <div className="space-y-2">
            {paiements.map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{p.type}</p>
                    {p.eleve && <p className="text-xs text-gray-400 mt-0.5">{p.eleve}</p>}
                    <p className="text-xs text-gray-400">{formatDate(p.date)} · {p.methode}</p>
                    {p.periode && <p className="text-xs text-gray-400">{p.periode}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{formatMontant(p.montant)}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${STATUT_COLORS[p.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUT_LABELS[p.statut] ?? p.statut}
                    </span>
                  </div>
                </div>
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
npx vitest run __tests__/parent/paiements.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 5: Commit**

```bash
git add app/(app)/parent/paiements/page.tsx __tests__/parent/paiements.test.tsx
git commit -m "feat(parent): paiements page"
```

---

### Task 10: Parent — Messages

**Files:**
- Create: `app/(app)/parent/messages/page.tsx`
- Create: `app/(app)/parent/messages/[id]/page.tsx`
- Test: `__tests__/parent/messages.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/parent/messages.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '3' }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock('@/lib/pusher', () => ({
  subscriberMessages: vi.fn().mockResolvedValue(() => {}),
}));
vi.mock('@/services/api', () => ({
  tokenStorage: { get: vi.fn().mockReturnValue('token') },
}));
vi.mock('@/stores/messages.store', () => ({
  useMessagesStore: vi.fn((sel) =>
    sel({
      conversations: [
        { user_id: 3, nom: 'Mme Sanogo', avatar_url: null, dernier_message: 'Votre enfant...', dernier_at: '2026-05-24', non_lus: 0 },
      ],
      messages: {
        3: [{ id: 1, contenu: 'Votre enfant est absent', type: 'texte', fichier_url: null, fichier_nom: null, envoyeur: false, lu: true, heure: '14:00', full_date: '2026-05-24' }],
      },
      convMeta: { 3: { currentPage: 1, hasMore: false } },
      isLoading: false,
      isSending: false,
      fetchConversations: vi.fn(),
      fetchConversation: vi.fn(),
      loadMore: vi.fn(),
      envoyer: vi.fn(),
    }),
  ),
}));
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn((sel) =>
    sel({ user: { id: 1, nom_complet: 'Coulibaly Jean' } }),
  ),
}));

import ParentMessagesPage from '@/app/(app)/parent/messages/page';
import ParentMessageThreadPage from '@/app/(app)/parent/messages/[id]/page';

describe('Parent Messages', () => {
  it('affiche la liste des conversations', () => {
    render(<ParentMessagesPage />);
    expect(screen.getByText('Mme Sanogo')).toBeInTheDocument();
  });

  it('affiche le dernier message', () => {
    render(<ParentMessagesPage />);
    expect(screen.getByText('Votre enfant...')).toBeInTheDocument();
  });

  it('affiche les messages dans le thread', async () => {
    render(<ParentMessageThreadPage />);
    await waitFor(() => expect(screen.getByText('Votre enfant est absent')).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```
npx vitest run __tests__/parent/messages.test.tsx
```

- [ ] **Step 3: Create `app/(app)/parent/messages/page.tsx`**

Identical pattern to enseignant messages, base path `/parent/messages`:

```tsx
'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useMessagesStore } from '@/stores/messages.store';
import { PageHeader } from '@/components/admin/page-header';
import { getInitiales, formatHeure } from '@/lib/format';

export default function ParentMessagesPage() {
  const { conversations, isLoading, fetchConversations } = useMessagesStore((s) => ({
    conversations: s.conversations,
    isLoading: s.isLoading,
    fetchConversations: s.fetchConversations,
  }));

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  return (
    <div>
      <PageHeader title="Messages" />
      <div role="list" aria-label="Conversations">
        {isLoading && conversations.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 rounded-full border-2 border-[#2B3D88] border-t-transparent animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">Aucune conversation</p>
          </div>
        ) : (
          conversations.map(conv => (
            <Link
              key={conv.user_id}
              href={`/parent/messages/${conv.user_id}`}
              role="listitem"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
              aria-label={`Conversation avec ${conv.nom}`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center" aria-hidden="true">
                  <span className="text-base font-semibold text-[#2B3D88]">{getInitiales(conv.nom)}</span>
                </div>
                {conv.non_lus > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1" aria-hidden="true">
                    {conv.non_lus > 9 ? '9+' : conv.non_lus}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-sm truncate ${conv.non_lus > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {conv.nom}
                  </span>
                  <span className="text-[11px] text-gray-400 shrink-0">{formatHeure(conv.dernier_at)}</span>
                </div>
                <p className={`text-xs truncate mt-0.5 ${conv.non_lus > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                  {conv.dernier_message}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `app/(app)/parent/messages/[id]/page.tsx`**

Identical to enseignant thread, base path `/parent/messages`:

```tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Send } from 'lucide-react';
import { useMessagesStore } from '@/stores/messages.store';
import { useAuthStore } from '@/stores/auth.store';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { subscriberMessages } from '@/lib/pusher';
import { tokenStorage } from '@/services/api';
import { cn } from '@/lib/utils';

export default function ParentMessageThreadPage() {
  const params = useParams();
  const userId = Number(params.id);
  const { messages, convMeta, isSending, fetchConversation, loadMore, envoyer } = useMessagesStore((s) => ({
    messages: s.messages,
    convMeta: s.convMeta,
    isSending: s.isSending,
    fetchConversation: s.fetchConversation,
    loadMore: s.loadMore,
    envoyer: s.envoyer,
  }));
  const myUser = useAuthStore((s) => s.user);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const thread = messages[userId] ?? [];
  const meta = convMeta[userId];

  useEffect(() => {
    if (!isNaN(userId)) fetchConversation(userId);
  }, [fetchConversation, userId]);

  useEffect(() => {
    if (!myUser?.id || isNaN(userId)) return;
    const token = tokenStorage.get() ?? '';
    let unsub: (() => void) | undefined;
    subscriberMessages(myUser.id, token, () => { fetchConversation(userId); }).then(fn => { unsub = fn; });
    return () => { unsub?.(); };
  }, [myUser?.id, userId, fetchConversation]);

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || isSending) return;
    setText('');
    await envoyer(userId, content);
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="Conversation" backHref="/parent/messages" />
      {meta?.hasMore && (
        <div className="text-center p-2 border-b border-gray-100">
          <Button variant="ghost" size="sm" onClick={() => loadMore(userId)}>
            Voir les messages précédents
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20" role="log" aria-live="polite" aria-label="Messages">
        {thread.map(msg => (
          <div key={msg.id} className={cn('flex', msg.envoyeur ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[75%] px-3 py-2 rounded-2xl text-sm break-words',
              msg.envoyeur
                ? 'bg-[#2B3D88] text-white rounded-br-sm'
                : 'bg-white text-gray-900 shadow-sm rounded-bl-sm',
            )}>
              <p className="whitespace-pre-wrap">{msg.contenu}</p>
              <p className={cn('text-[10px] mt-1 text-right', msg.envoyeur ? 'text-blue-200' : 'text-gray-400')}>
                {msg.heure}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 flex items-center gap-2 px-3 py-2"
      >
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Écrire un message…"
          className="flex-1"
          autoComplete="off"
          aria-label="Message à envoyer"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!text.trim() || isSending}
          className="bg-[#2B3D88] hover:bg-[#1a255e] shrink-0"
          aria-label="Envoyer"
        >
          <Send size={16} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

```
npx vitest run __tests__/parent/messages.test.tsx
```
Expected: 3/3 PASS

- [ ] **Step 6: Commit**

```bash
git add app/(app)/parent/messages/page.tsx "app/(app)/parent/messages/[id]/page.tsx" __tests__/parent/messages.test.tsx
git commit -m "feat(parent): messages list and thread pages"
```

---

## Post-implementation checklist

- [ ] Run all élève tests: `npx vitest run __tests__/eleve/`
- [ ] Run all parent tests: `npx vitest run __tests__/parent/`
- [ ] Verify TypeScript: `npx tsc --noEmit`
- [ ] Verify `app/(app)/page.tsx` routes correctly to `/(app)/[role]/accueil` based on auth user role
- [ ] Confirm `Textarea` component is imported from `@/components/ui/textarea` (shadcn/ui)

## Notes for implementer

- **OOM warning**: Running all tests together on Windows may cause heap exhaustion. Run per-file: `npx vitest run __tests__/eleve/devoirs.test.tsx`. Individual files all pass.
- **`Textarea` import**: Make sure shadcn `textarea` component exists at `components/ui/textarea.tsx`. If missing, add it with `npx shadcn@latest add textarea`.
- **`Dialog` + `Textarea` together**: The devoirs page and enfant detail page both use `Dialog` with `Textarea`. Test by clicking the dialog trigger button then the confirm button.
- **`deselectionnerEnfant` cleanup**: The enfant detail page calls `deselectionnerEnfant()` on unmount to avoid showing stale data when navigating between children.
- **Tab state**: The enfant detail page uses local `tab` state (`'notes' | 'absences' | 'cours'`) — no router params needed.
