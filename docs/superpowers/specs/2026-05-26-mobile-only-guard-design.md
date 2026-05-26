---
title: Mobile-Only Guard — Scolarix
date: 2026-05-26
status: approved
---

## Objectif

Bloquer l'accès à toute l'application Scolarix sur les appareils desktop et afficher une page dédiée invitant l'utilisateur à scanner un QR code pour ouvrir l'app sur mobile.

## Portée

- **Toutes les routes** de l'application (auth + app) sont bloquées sur desktop.
- Seuil de détection : `window.innerWidth < 768px` = mobile autorisé.
- Aucune exception (pas de bypass admin, pas de lien "retourner au site").

## Approche retenue

**Hook client-side `useIsMobile`** dans le root layout (`app/layout.tsx`).

- Détection basée sur `window.innerWidth` (pixels réels, pas User-Agent).
- Pendant le rendu SSR / avant l'hydratation : on considère que c'est mobile par défaut (pas de flash de la page bloquée sur mobile).
- Si desktop détecté après hydratation : le root layout remplace `{children}` par le composant `<MobileOnlyScreen />`.

## Composants

### `hooks/use-is-mobile.ts`

```ts
// Retourne true si la largeur < 768px, null pendant le SSR
```

- Écoute `window.resize` pour gérer le redimensionnement.
- Valeur initiale `null` (indéterminée) jusqu'à l'hydratation.
- Pendant `null` → affiche les enfants (évite le flash sur mobile).

### `components/mobile-only-screen.tsx`

Page affichée aux utilisateurs desktop. Contient :
- Logo (`/logo.png`) centré en haut
- Titre : "Application mobile uniquement"
- Texte : "Scolarix est optimisé exclusivement pour les smartphones afin de vous offrir la meilleure expérience possible."
- Bloc QR code avec caption "Scannez ce code QR pour ouvrir Scolarix sur votre mobile."
- Couleur principale : `#2B3D88`

### QR Code

- Généré via la librairie `qrcode.react` (à installer).
- Valeur : `window.location.href` (URL actuelle de l'app, dynamique).
- Taille : 160×160px sur mobile-like, 130×130px sur desktop.

### `app/layout.tsx` (modification)

Wrap `{children}` avec la logique :

```tsx
const isMobile = useIsMobile()
if (isMobile === false) return <MobileOnlyScreen />
return <>{children}</>
```

## Design visuel

- Fond blanc, layout centré verticalement.
- Logo carré arrondi (logo.png, 80px).
- Bloc QR dans un encadré gris clair (`#f8fafc`, border `#e2e8f0`, border-radius 16px).
- Sur desktop (écran large) : QR code + texte d'instructions en disposition horizontale.
- Sur mobile (vérification simulée en devtools) : layout colonne, QR centré.
- Typographie Geist (déjà installée dans le projet).

## Librairies

| Librairie | Usage | Action |
|---|---|---|
| `qrcode.react` | Génération du QR code côté client | À installer |

## Fichiers à créer / modifier

| Fichier | Action |
|---|---|
| `hooks/use-is-mobile.ts` | Créer |
| `components/mobile-only-screen.tsx` | Créer |
| `app/layout.tsx` | Modifier (ajout du hook + conditional render) |
| `package.json` | Modifier (ajout `qrcode.react`) |

## Critères de succès

- Un utilisateur desktop voit la page mobile-only sur **toutes** les routes.
- Un utilisateur mobile (ou devtools responsive < 768px) accède normalement à l'app.
- Le QR code scanné ouvre l'URL correcte de l'app.
- Aucun flash de contenu (FOUC) sur mobile au chargement.
- Le redimensionnement de fenêtre bascule correctement entre les deux états.
