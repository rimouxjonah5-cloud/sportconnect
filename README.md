# Sport Connect

Application mobile-first (React + Vite + TypeScript + Tailwind CSS) pour se connecter
avec des sportifs près de chez soi, organiser des matchs et gérer ses séances
d'entraînement. Design sombre et moderne, accent émeraude.

## Fonctionnalités

- **Recherche** en haut de l'app avec deux onglets : Amis (profils) et Complexes (lieux).
- **Accueil** : alertes sport en cours/urgentes, tournois actuels, joueurs près de toi
  (suivre / message).
- **Plan** : carte sombre (Leaflet) avec les complexes sportifs et les amis suivis en
  temps réel, géolocalisation live, fiche complexe avec itinéraire GPS.
- **Planning** : calendrier mensuel, création d'évènements (séance/match/tournoi/sortie),
  liste des évènements du jour.
- **Avis** : notation et retours sur les complexes sportifs.
- **Messages** : messagerie en temps réel avec les sportifs suivis.
- **Profil** : photo, stats, trophées, paramètres (rayon, notifications), sports
  pratiqués.
- **Boutique** : boost de profil, badge de certification, boost d'évènement (paiement
  non connecté, activation directe pour la démo).
- **Onboarding** en 3 étapes obligatoires avant l'accès à l'application.

## Backend

L'application utilise **Supabase** (Postgres + Auth + Realtime + Storage). Le schéma
complet (tables, RLS, fonctions, données de démo) se trouve dans `supabase/schema.sql` —
à exécuter une fois dans l'éditeur SQL du projet Supabase.

Sans configuration Supabase (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` absents),
les écrans nécessitant des données afficheront une erreur de connexion : configure ces
variables (voir `.env.example`) pour une expérience complète.

## Installation sur téléphone (PWA)

L'application est une **Progressive Web App** : une fois déployée sur une URL accessible
en HTTPS, n'importe qui peut l'installer sur son téléphone sans passer par un store.

- **Android (Chrome)** : ouvrir le lien → menu ⋮ → "Ajouter à l'écran d'accueil" /
  "Installer l'application".
- **iPhone (Safari)** : ouvrir le lien → bouton Partager → "Sur l'écran d'accueil".

## Démarrer

```bash
npm install
cp .env.example .env   # renseigner VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev
```

## Build de production

```bash
npm run build
npm run preview
```
