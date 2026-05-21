# 🎵 SoundWave — Clone Spotify

> Application web de streaming musical | React 18 + Vite + Supabase | Projet scolaire — Équipe de 8

---

## 📌 Table des matières

1. [Présentation du projet](#-présentation-du-projet)
2. [Stack technique](#-stack-technique)
3. [Fonctionnalités](#-fonctionnalités)
4. [Architecture du projet](#-architecture-du-projet)
5. [Schéma de la base de données](#-schéma-de-la-base-de-données)
6. [Organisation de l'équipe](#-organisation-de-léquipe)
7. [Guide de démarrage](#-guide-de-démarrage)
8. [Conventions Git](#-conventions-git)
9. [Règles de collaboration](#-règles-de-collaboration)
10. [Variables d'environnement](#-variables-denvironnement)

---

## 🎯 Présentation du projet

**SoundWave** est une application web responsive de streaming musical, développée dans le cadre d'un projet scolaire. Elle reprend les fonctionnalités clés de Spotify :

- 🎧 Écoute de musique en streaming
- 📂 Gestion de playlists personnalisées
- 🔍 Recherche et découverte de musique
- 👤 Profils utilisateurs avec authentification
- 📱 Interface responsive (mobile, tablette, desktop)
- 🌙 Thème sombre

---

## 🛠 Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Base de données | Supabase (PostgreSQL) |
| Authentification | Supabase Auth |
| Stockage fichiers audio/images | Supabase Storage |
| Routage | React Router v6 |
| État global | Zustand |
| Requêtes API | TanStack Query (React Query) |

---

## ✨ Fonctionnalités

### Authentification
- [ ] Inscription / Connexion par email
- [ ] Connexion via Google (OAuth)
- [ ] Déconnexion
- [ ] Profil utilisateur (photo, nom, bio)

### Lecteur de musique
- [ ] Lecture / Pause
- [ ] Piste suivante / précédente
- [ ] Barre de progression cliquable
- [ ] Contrôle du volume
- [ ] Mode aléatoire (shuffle)
- [ ] Répétition (repeat)
- [ ] Mini-player persistant en bas de page

### Bibliothèque & Playlists
- [ ] Créer / modifier / supprimer une playlist
- [ ] Ajouter / retirer une chanson d'une playlist
- [ ] Afficher ses playlists dans la sidebar
- [ ] Chansons likées (❤️)

### Découverte & Recherche
- [ ] Page d'accueil avec recommandations
- [ ] Barre de recherche (artistes, titres, albums)
- [ ] Page artiste avec discographie
- [ ] Page album

### Interface
- [ ] Design responsive (mobile-first)
- [ ] Sidebar de navigation (desktop)
- [ ] Navigation par onglets (mobile)
- [ ] Thème sombre

---

## 🗂 Architecture du projet

```
soundwave/
├── public/
├── src/
│   ├── assets/                  # Images, icônes statiques
│   ├── components/
│   │   ├── ui/                  # Boutons, inputs, modals, loaders...
│   │   ├── auth/                # PrivateRoute, formulaires auth
│   │   ├── layout/              # Layout général, Header
│   │   ├── sidebar/             # Navigation latérale
│   │   ├── player/              # Lecteur musical
│   │   ├── playlist/            # Cards playlist, liste de titres
│   │   └── search/              # Barre de recherche, résultats
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Search.jsx
│   │   ├── Library.jsx
│   │   ├── Playlist.jsx
│   │   ├── Artist.jsx
│   │   ├── Album.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Profile.jsx
│   ├── hooks/                   # Custom hooks React
│   │   ├── useAuth.js
│   │   ├── usePlayer.js
│   │   └── useSearch.js
│   ├── store/                   # État global Zustand
│   │   ├── playerStore.js
│   │   └── authStore.js
│   ├── services/                # Appels Supabase
│   │   ├── supabase.js          # Client Supabase
│   │   ├── authService.js
│   │   ├── songsService.js
│   │   ├── playlistService.js
│   │   ├── artistsService.js
│   │   └── userService.js
│   ├── utils/                   # Fonctions utilitaires
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🗃 Schéma de la base de données

### Table `profiles`
```sql
id          uuid      FK → auth.users (PRIMARY KEY)
username    text      UNIQUE NOT NULL
full_name   text
avatar_url  text
created_at  timestamp DEFAULT NOW()
```

### Table `artists`
```sql
id         uuid  DEFAULT gen_random_uuid() PRIMARY KEY
name       text  NOT NULL
bio        text
image_url  text
```

### Table `albums`
```sql
id           uuid     DEFAULT gen_random_uuid() PRIMARY KEY
title        text     NOT NULL
artist_id    uuid     FK → artists
cover_url    text
release_year integer
```

### Table `songs`
```sql
id         uuid     DEFAULT gen_random_uuid() PRIMARY KEY
title      text     NOT NULL
artist_id  uuid     FK → artists
album_id   uuid     FK → albums
duration   integer  (en secondes)
audio_url  text     NOT NULL
cover_url  text
genre      text
plays      integer  DEFAULT 0
created_at timestamp DEFAULT NOW()
```

### Table `playlists`
```sql
id          uuid     DEFAULT gen_random_uuid() PRIMARY KEY
name        text     NOT NULL
description text
cover_url   text
user_id     uuid     FK → profiles
is_public   boolean  DEFAULT true
created_at  timestamp DEFAULT NOW()
```

### Table `playlist_songs`
```sql
id          uuid      DEFAULT gen_random_uuid() PRIMARY KEY
playlist_id uuid      FK → playlists ON DELETE CASCADE
song_id     uuid      FK → songs ON DELETE CASCADE
position    integer
added_at    timestamp DEFAULT NOW()
```

### Table `liked_songs`
```sql
user_id  uuid      FK → profiles
song_id  uuid      FK → songs
liked_at timestamp DEFAULT NOW()
PRIMARY KEY (user_id, song_id)
```

> 🗄 **Supabase Storage** : créer deux buckets → `audio` (fichiers .mp3) et `covers` (images de couverture)

---

## 👥 Organisation de l'équipe

Chaque membre est **seul responsable** de son domaine. Pas de doublon, pas de confusion.

---

### 👤 Membre 1 — Chef de projet & Configuration Supabase
**Branche :** `feature/setup`

**Tâches :**
- [ ] Initialiser le projet Vite + installer toutes les dépendances (`react-router-dom`, `zustand`, `@tanstack/react-query`, `@supabase/supabase-js`, `tailwindcss`)
- [ ] Créer et configurer le projet Supabase (tables SQL, RLS policies, buckets Storage)
- [ ] Configurer `src/services/supabase.js` (client Supabase)
- [ ] Créer le fichier `.env.example`
- [ ] Gérer les branches Git, faire les merges vers `develop`
- [ ] S'assurer que tout le monde peut lancer le projet

**Fichiers principaux :**
```
src/services/supabase.js
.env.example
package.json
vite.config.js
tailwind.config.js
```

---

### 👤 Membre 2 — Authentification
**Branche :** `feature/auth`

**Tâches :**
- [ ] Page Login (`src/pages/Login.jsx`) — connexion email/password
- [ ] Page Register (`src/pages/Register.jsx`) — inscription
- [ ] Connexion via Google (OAuth Supabase)
- [ ] Déconnexion
- [ ] Composant `PrivateRoute` pour protéger les pages
- [ ] Hook `useAuth.js` + store `authStore.js`
- [ ] Service `authService.js`

**Fichiers principaux :**
```
src/pages/Login.jsx
src/pages/Register.jsx
src/components/auth/PrivateRoute.jsx
src/hooks/useAuth.js
src/store/authStore.js
src/services/authService.js
```

---

### 👤 Membre 3 — Layout & Navigation
**Branche :** `feature/layout`

**Tâches :**
- [ ] Layout principal de l'app (sidebar + zone contenu + player en bas)
- [ ] Sidebar desktop avec liens de navigation
- [ ] Navigation mobile (barre d'onglets en bas)
- [ ] Header responsive
- [ ] Toutes les routes dans `App.jsx` (React Router v6)

**Fichiers principaux :**
```
src/App.jsx
src/components/layout/MainLayout.jsx
src/components/layout/Header.jsx
src/components/sidebar/Sidebar.jsx
src/components/sidebar/MobileNav.jsx
```

---

### 👤 Membre 4 — Lecteur de musique
**Branche :** `feature/player`

**Tâches :**
- [ ] Barre de lecture persistante en bas de page
- [ ] Boutons play / pause / suivant / précédent
- [ ] Barre de progression cliquable
- [ ] Contrôle du volume
- [ ] Mode shuffle et repeat
- [ ] État global du player avec Zustand (`playerStore.js`)
- [ ] Hook `usePlayer.js`
- [ ] Intégration HTML5 `<audio>`

**Fichiers principaux :**
```
src/components/player/PlayerBar.jsx
src/components/player/ProgressBar.jsx
src/components/player/VolumeControl.jsx
src/store/playerStore.js
src/hooks/usePlayer.js
```

---

### 👤 Membre 5 — Page d'accueil & Découverte
**Branche :** `feature/home`

**Tâches :**
- [ ] Page Home avec sections (Tendances, Nouveautés, Recommandations)
- [ ] Carrousels horizontaux d'albums et d'artistes
- [ ] Cards de chansons, albums, playlists
- [ ] Récupération des données depuis Supabase (`songsService.js`)
- [ ] Composant `Card.jsx` réutilisable

**Fichiers principaux :**
```
src/pages/Home.jsx
src/components/ui/Card.jsx
src/components/ui/Carousel.jsx
src/services/songsService.js
src/services/artistsService.js
```

---

### 👤 Membre 6 — Recherche, Artiste & Album
**Branche :** `feature/search`

**Tâches :**
- [ ] Page Search avec barre de recherche
- [ ] Recherche en temps réel avec debounce
- [ ] Filtres par catégorie (chansons / artistes / albums)
- [ ] Page Artiste (bio, discographie, chansons populaires)
- [ ] Page Album (liste des titres, infos)
- [ ] Hook `useSearch.js`

**Fichiers principaux :**
```
src/pages/Search.jsx
src/pages/Artist.jsx
src/pages/Album.jsx
src/hooks/useSearch.js
src/components/search/SearchBar.jsx
src/components/search/SearchResults.jsx
```

---

### 👤 Membre 7 — Playlists & Bibliothèque
**Branche :** `feature/playlists`

**Tâches :**
- [ ] Page Library (liste de toutes les playlists de l'utilisateur)
- [ ] Page Playlist (contenu détaillé d'une playlist)
- [ ] Créer / modifier / supprimer une playlist
- [ ] Ajouter / retirer une chanson d'une playlist
- [ ] Système de like sur les chansons (❤️)
- [ ] Service `playlistService.js`

**Fichiers principaux :**
```
src/pages/Library.jsx
src/pages/Playlist.jsx
src/components/playlist/PlaylistCard.jsx
src/components/playlist/SongRow.jsx
src/services/playlistService.js
```

---

### 👤 Membre 8 — Profil utilisateur & Composants UI
**Branche :** `feature/profile-ui`

**Tâches :**
- [ ] Page Profil (modifier nom, avatar, bio)
- [ ] Upload d'avatar via Supabase Storage
- [ ] Composants UI réutilisables : `Button`, `Modal`, `Toast`, `Input`, `Loader`, `Avatar`
- [ ] Vérification du responsive sur toutes les tailles d'écran
- [ ] Configuration du thème sombre (Tailwind + variables CSS)
- [ ] Service `userService.js`

**Fichiers principaux :**
```
src/pages/Profile.jsx
src/components/ui/Button.jsx
src/components/ui/Modal.jsx
src/components/ui/Toast.jsx
src/components/ui/Input.jsx
src/components/ui/Loader.jsx
src/services/userService.js
```

---

## 🚀 Guide de démarrage

### 1. Cloner le dépôt
```bash
git clone https://github.com/VOTRE_USERNAME/soundwave.git
cd soundwave
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement
```bash
cp .env.example .env
```
Ouvre `.env` et remplis avec tes clés Supabase :
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ta_clé_anon_publique
```
> 🔑 Ces clés se trouvent dans **Supabase → Project Settings → API**

### 4. Lancer l'application
```bash
npm run dev
```
L'app sera disponible sur `http://localhost:5173`

---

## 🌿 Conventions Git

### Structure des branches
```
main        → code stable (livraison finale)
develop     → branche d'intégration
feature/xxx → développement d'une fonctionnalité
fix/xxx     → correction de bug
```

### Workflow à suivre par chaque membre
```bash
# 1. Se placer sur develop et récupérer les dernières modifications
git checkout develop
git pull origin develop

# 2. Créer sa branche de travail
git checkout -b feature/ma-fonctionnalite

# 3. Travailler, puis committer régulièrement
git add .
git commit -m "feat: description de ce que j'ai fait"

# 4. Pousser sa branche sur GitHub
git push origin feature/ma-fonctionnalite

# 5. Ouvrir une Pull Request sur GitHub : feature/xxx → develop
```

### Format des messages de commit
```
feat:     nouvelle fonctionnalité
fix:      correction de bug
style:    changements CSS/UI sans logique
refactor: restructuration du code
docs:     documentation uniquement
chore:    config, dépendances, setup
```

**Exemples concrets :**
```
feat: ajout du composant PlayerBar avec play/pause
fix: correction de la déconnexion sur mobile
style: amélioration du responsive de la sidebar
docs: mise à jour du README
chore: ajout de tailwindcss et configuration
```

---

## 📏 Règles de collaboration

1. ❌ **Ne jamais pusher directement sur `main` ou `develop`** — toujours passer par une Pull Request
2. ✅ **Une Pull Request = une fonctionnalité** — ne pas mélanger plusieurs sujets
3. ✅ **Toujours faire `git pull origin develop`** avant de commencer à coder
4. ✅ **Au moins 1 autre membre relit** avant de merger une PR
5. ❌ **Ne jamais committer le fichier `.env`** — il est dans `.gitignore`
6. ✅ **Nommer les composants en PascalCase** : `PlayerBar.jsx`, `SongCard.jsx`
7. ✅ **Nommer les fonctions/variables en camelCase** : `fetchSongs`, `isPlaying`
8. ✅ **Tester sur mobile ET desktop** avant d'ouvrir une Pull Request
9. ✅ **Commenter le code** quand la logique est complexe

---

## 🔐 Variables d'environnement

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | URL de ton projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé publique anonyme Supabase |

> ⚠️ Le fichier `.env` ne doit **jamais** être commité. Seul `.env.example` (sans vraies valeurs) va sur Git.

---

## 📞 Contact & coordination

> Complétez ici : noms des membres, lien Discord/WhatsApp, lien Notion/Trello pour le suivi des tâches.

---

*Projet réalisé dans le cadre d'un cours — SoundWave n'est pas affilié à Spotify. Aucune œuvre musicale protégée ne doit être uploadée.*
