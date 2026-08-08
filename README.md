# RESERVITE — Backoffice web (vraie application)

Connecté au vrai backend (`reservite-backend/`), pour les 5 rôles : SuperAdmin,
Admin Compagnie, Gérant de gare, Caissier, Agent colis & bagages. Le Contrôleur
utilise l'app mobile (`reservite-mobile-app/`), pas ce backoffice.

## Installation

```bash
cd reservite-backoffice-web
cp .env.example .env
npm install
npm run dev
```

Ouvrez `http://localhost:5174`. Le backend doit tourner (voir son README).

## Comptes de démonstration

Mêmes comptes que partout ailleurs dans le projet — voir `reservite-backend/README.md`.

## Déploiement

```bash
npm run build
```
Héberge le dossier `dist/` sur Vercel, Netlify, ou tout hébergement statique —
en pensant à renseigner `VITE_API_URL` vers votre backend déployé avant de builder.

## Ce qui est branché sur le vrai serveur

Tout : création de compagnies, gares, trajets, véhicules, voyages (avec places
calculées en temps réel), personnel (avec les 4 rôles créables), location de
véhicules (demandes, réponse, flotte), colis & bagages, réclamations.

Testé de bout en bout avec un serveur réel démarré : Admin crée une gare, un
trajet, un compte caissier → le caissier se connecte avec le bon rôle → crée
et publie un voyage → il apparaît immédiatement avec ses places disponibles.
