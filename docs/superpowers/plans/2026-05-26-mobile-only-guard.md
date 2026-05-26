# Mobile-Only Guard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher une page "Application mobile uniquement" avec QR code à tous les utilisateurs desktop, sur toutes les routes de Scolarix.

**Architecture:** Un hook `useIsMobile` détecte la largeur de fenêtre côté client (seuil 768px). Un composant client `MobileGuard` wraps `{children}` dans le root layout : si desktop (`isMobile === false`), il affiche `MobileOnlyScreen` à la place ; sinon, il rend les enfants normalement. L'état `null` (SSR / avant hydratation) laisse passer les enfants pour éviter tout flash sur mobile.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, qrcode.react, Vitest + Testing Library

---

## Structure des fichiers

| Fichier | Action | Rôle |
|---|---|---|
| `hooks/use-is-mobile.ts` | Créer | Hook qui retourne `true/false/null` selon `window.innerWidth` |
| `components/mobile-only-screen.tsx` | Créer | Page bloquante desktop avec logo + QR code |
| `components/mobile-guard.tsx` | Créer | Wrapper client qui choisit entre enfants et MobileOnlyScreen |
| `app/layout.tsx` | Modifier | Wrap `{children}` avec `<MobileGuard>` |
| `hooks/use-is-mobile.test.ts` | Créer | Tests du hook |
| `components/mobile-only-screen.test.tsx` | Créer | Tests du composant |
| `components/mobile-guard.test.tsx` | Créer | Tests du guard |

---

## Task 1 : Setup — installer qrcode.react et mettre à jour .gitignore

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1 : Installer qrcode.react**

```bash
npm install qrcode.react
```

Résultat attendu : `qrcode.react` apparaît dans `dependencies` de `package.json`.

- [ ] **Step 2 : Ajouter .superpowers/ au .gitignore**

Ouvrir `.gitignore` et ajouter à la fin :

```
# Superpowers brainstorm sessions
.superpowers/
```

- [ ] **Step 3 : Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: install qrcode.react, ignore .superpowers/"
```

---

## Task 2 : Hook `useIsMobile`

**Files:**
- Create: `hooks/use-is-mobile.ts`
- Create: `hooks/use-is-mobile.test.ts`

- [ ] **Step 1 : Écrire le test (qui doit échouer)**

Créer `hooks/use-is-mobile.test.ts` :

```ts
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-is-mobile';

const setWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe('useIsMobile', () => {
  it('retourne true quand la largeur est < 768px', () => {
    setWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('retourne false quand la largeur est >= 768px', () => {
    setWidth(1280);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('retourne false exactement à 768px (seuil exclusif)', () => {
    setWidth(768);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('se met à jour lors du resize', () => {
    setWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    act(() => {
      setWidth(1280);
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2 : Vérifier que le test échoue**

```bash
npx vitest run hooks/use-is-mobile.test.ts
```

Résultat attendu : FAIL — `Cannot find module '@/hooks/use-is-mobile'`

- [ ] **Step 3 : Implémenter le hook**

Créer `hooks/use-is-mobile.ts` :

```ts
'use client';
import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
npx vitest run hooks/use-is-mobile.test.ts
```

Résultat attendu : PASS (4 tests)

- [ ] **Step 5 : Commit**

```bash
git add hooks/use-is-mobile.ts hooks/use-is-mobile.test.ts
git commit -m "feat: add useIsMobile hook with resize support"
```

---

## Task 3 : Composant `MobileOnlyScreen`

**Files:**
- Create: `components/mobile-only-screen.tsx`
- Create: `components/mobile-only-screen.test.tsx`

- [ ] **Step 1 : Écrire le test (qui doit échouer)**

Créer `components/mobile-only-screen.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react';
import { MobileOnlyScreen } from '@/components/mobile-only-screen';

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ 'aria-label': ariaLabel }: { 'aria-label'?: string }) => (
    <svg aria-label={ariaLabel} data-testid="qr-code" />
  ),
}));

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

describe('MobileOnlyScreen', () => {
  it('affiche le titre', () => {
    render(<MobileOnlyScreen />);
    expect(
      screen.getByText('Application mobile uniquement')
    ).toBeInTheDocument();
  });

  it('affiche le sous-titre', () => {
    render(<MobileOnlyScreen />);
    expect(
      screen.getByText(/Scolarix est optimisé exclusivement/)
    ).toBeInTheDocument();
  });

  it('affiche la légende du QR code', () => {
    render(<MobileOnlyScreen />);
    expect(
      screen.getByText(/Scannez ce code QR/)
    ).toBeInTheDocument();
  });

  it('affiche le logo', () => {
    render(<MobileOnlyScreen />);
    expect(screen.getByAltText('Scolarix')).toBeInTheDocument();
  });

  it('affiche le QR code', () => {
    render(<MobileOnlyScreen />);
    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2 : Vérifier que le test échoue**

```bash
npx vitest run components/mobile-only-screen.test.tsx
```

Résultat attendu : FAIL — `Cannot find module '@/components/mobile-only-screen'`

- [ ] **Step 3 : Implémenter le composant**

Créer `components/mobile-only-screen.tsx` :

```tsx
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

export function MobileOnlyScreen() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-8 py-12">
      <Image
        src="/logo.png"
        alt="Scolarix"
        width={80}
        height={80}
        className="mb-7 rounded-2xl"
        priority
      />
      <h1 className="text-2xl font-bold text-slate-900 text-center mb-3 leading-snug">
        Application mobile uniquement
      </h1>
      <p className="text-sm text-slate-500 text-center leading-relaxed mb-9 max-w-xs">
        Scolarix est optimisé exclusivement pour les smartphones afin de vous
        offrir la meilleure expérience possible.
      </p>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center gap-3 w-full max-w-xs">
        {url && (
          <QRCodeSVG
            value={url}
            size={160}
            aria-label="QR Code Scolarix"
          />
        )}
        <p className="text-xs text-slate-400 text-center leading-relaxed">
          Scannez ce code QR pour ouvrir Scolarix et afficher
          l&apos;application sur votre mobile.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
npx vitest run components/mobile-only-screen.test.tsx
```

Résultat attendu : PASS (5 tests)

- [ ] **Step 5 : Commit**

```bash
git add components/mobile-only-screen.tsx components/mobile-only-screen.test.tsx
git commit -m "feat: add MobileOnlyScreen component with QR code"
```

---

## Task 4 : Composant `MobileGuard`

**Files:**
- Create: `components/mobile-guard.tsx`
- Create: `components/mobile-guard.test.tsx`

- [ ] **Step 1 : Écrire le test (qui doit échouer)**

Créer `components/mobile-guard.test.tsx` :

```tsx
import { render, screen } from '@testing-library/react';
import { MobileGuard } from '@/components/mobile-guard';
import * as useMobileModule from '@/hooks/use-is-mobile';

vi.mock('@/hooks/use-is-mobile');
vi.mock('@/components/mobile-only-screen', () => ({
  MobileOnlyScreen: () => <div>Application mobile uniquement</div>,
}));

describe('MobileGuard', () => {
  it('affiche les enfants quand isMobile est true', () => {
    vi.mocked(useMobileModule.useIsMobile).mockReturnValue(true);
    render(<MobileGuard><div>Contenu app</div></MobileGuard>);
    expect(screen.getByText('Contenu app')).toBeInTheDocument();
    expect(screen.queryByText('Application mobile uniquement')).not.toBeInTheDocument();
  });

  it('affiche les enfants quand isMobile est null (SSR)', () => {
    vi.mocked(useMobileModule.useIsMobile).mockReturnValue(null);
    render(<MobileGuard><div>Contenu app</div></MobileGuard>);
    expect(screen.getByText('Contenu app')).toBeInTheDocument();
  });

  it('affiche MobileOnlyScreen quand isMobile est false (desktop)', () => {
    vi.mocked(useMobileModule.useIsMobile).mockReturnValue(false);
    render(<MobileGuard><div>Contenu app</div></MobileGuard>);
    expect(screen.getByText('Application mobile uniquement')).toBeInTheDocument();
    expect(screen.queryByText('Contenu app')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2 : Vérifier que le test échoue**

```bash
npx vitest run components/mobile-guard.test.tsx
```

Résultat attendu : FAIL — `Cannot find module '@/components/mobile-guard'`

- [ ] **Step 3 : Implémenter le composant**

Créer `components/mobile-guard.tsx` :

```tsx
'use client';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { MobileOnlyScreen } from '@/components/mobile-only-screen';

export function MobileGuard({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  if (isMobile === false) return <MobileOnlyScreen />;
  return <>{children}</>;
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
npx vitest run components/mobile-guard.test.tsx
```

Résultat attendu : PASS (3 tests)

- [ ] **Step 5 : Commit**

```bash
git add components/mobile-guard.tsx components/mobile-guard.test.tsx
git commit -m "feat: add MobileGuard wrapper component"
```

---

## Task 5 : Modifier `app/layout.tsx`

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1 : Lire le fichier actuel**

Lire `app/layout.tsx`. Le contenu actuel retourne :

```tsx
<html lang="fr" className={...}>
  <body className="min-h-full flex flex-col">
    {children}
    <Toaster richColors />
  </body>
</html>
```

- [ ] **Step 2 : Ajouter l'import et wrapper MobileGuard**

Modifier `app/layout.tsx` pour importer `MobileGuard` et wraper `{children}` :

```tsx
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { MobileGuard } from '@/components/mobile-guard';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Scolarix',
  description: 'Plateforme de gestion scolaire',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Scolarix',
  },
};

export const viewport: Viewport = {
  themeColor: '#2B3D88',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MobileGuard>
          {children}
        </MobileGuard>
        <Toaster richColors />
      </body>
    </html>
  );
}
```

- [ ] **Step 3 : Lancer la suite de tests complète**

```bash
npx vitest run
```

Résultat attendu : tous les tests passent.

- [ ] **Step 4 : Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wrap root layout with MobileGuard to block desktop access"
```

---

## Task 6 : Vérification manuelle

**Files:** aucun

- [ ] **Step 1 : Démarrer le serveur de dev**

```bash
npm run dev
```

Ouvrir `http://localhost:3003` dans le navigateur.

- [ ] **Step 2 : Vérifier le comportement desktop**

Avec une fenêtre de navigateur > 768px de large : la page "Application mobile uniquement" s'affiche avec le logo et le QR code.

- [ ] **Step 3 : Vérifier le comportement mobile**

Ouvrir les DevTools → mode responsive → sélectionner un preset mobile (ex: iPhone 14, 390px). L'app normale s'affiche (page de login ou d'accueil).

- [ ] **Step 4 : Vérifier le QR code**

Agrandir la fenêtre pour voir le QR code. Scanner avec un smartphone — il doit ouvrir `http://localhost:3003` (ou l'URL de prod si déployé).

- [ ] **Step 5 : Vérifier le resize dynamique**

Partir en mode desktop (QR visible) → réduire la fenêtre en dessous de 768px → le contenu de l'app s'affiche sans rechargement.
