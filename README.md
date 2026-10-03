# RESERVITE — Web (Next.js)

Application web de RESERVITE, branchée sur l'API NestJS (`reservite-backend`). Une seule application, deux usages selon le rôle :

- **Espace Compagnie** : Admin Compagnie, Gérant de gare, Caissier, Agent colis & bagages.
- **Back-office RESERVITE** : SuperAdmin (création des compagnies, personnel, clients, réclamations).

Les **contrôleurs** (scan des billets) et les **clients** utilisent l'application mobile (`reservite-mobile-app`), pas ce site.

**Stack** : Next.js 15 (App Router), React 19, TypeScript. Aucune autre dépendance d'exécution.

## Démarrer

L'API doit tourner (voir le README de `reservite-backend`).

```bash
cp .env.example .env      # NEXT_PUBLIC_API_URL = adresse de l'API
npm install
npm run dev               # http://localhost:3000
```

Comptes de démonstration : voir le README du backend (ex. `yao.kouadio@utb.ci` / `utb2024`).

## Ce qui est disponible, par rôle

| Page | SuperAdmin | Admin Compagnie | Gérant de gare | Caissier | Agent colis |
|---|:-:|:-:|:-:|:-:|:-:|
| Tableau de bord | ✓ | ✓ | ✓ | ✓ | ✓ |
| Compagnies (création avec son admin) | ✓ | | | | |
| Voyages (création, publication, passagers, annulation) | | ✓ | ✓ | ✓ (sans annulation) | |
| Vente guichet (espèces, billets avec code) | | ✓ | ✓ | ✓ | |
| Trajets, Gares, Véhicules | | ✓ | | | |
| Colis & bagages (enregistrement, statuts, SMS) | | ✓ | ✓ | | ✓ |
| Locations (offres, flotte de location) | | ✓ | | | |
| Personnel (création des rôles) | ✓ | ✓ | lecture | | |
| Clients | ✓ | ✓ | ✓ | ✓ | |
| Réclamations | ✓ | ✓ | ✓ | | |
| Suivi public d'un colis (`/suivi`, sans connexion) | ✓ | ✓ | ✓ | ✓ | ✓ |

⚠️ Le menu est adapté au rôle pour alléger l'écran, mais **la sécurité est assurée par l'API** : chaque route y vérifie le rôle
et la compagnie. Cacher un bouton n'est jamais une protection.

## Session

Le jeton d'accès (1 h) et le jeton de rafraîchissement (30 jours, usage unique) sont conservés dans le navigateur (`localStorage`)
et renouvelés automatiquement. Une session expirée ramène à la page de connexion.

## Déployer

```bash
NEXT_PUBLIC_API_URL="https://votre-api.example.com" npm run build
```

Hébergement conseillé : Vercel (déploiement Next.js natif). `NEXT_PUBLIC_API_URL` est lue **au moment du build** : définissez-la
dans les variables du projet avant de construire. Côté API, ajoutez l'adresse du site à `CORS_ORIGIN`.

## Structure

```
src/app/login        connexion          src/app/suivi       suivi public d'un colis
src/app/(app)/...    pages protégées    src/components     tableaux, formulaires, fenêtres
src/lib/api.ts       client HTTP + jetons        src/lib/nav.ts   menu par rôle
```
