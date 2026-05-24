import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Carousel from '../components/ui/Carousel';
import { getTrendingSongs, getNewSongs, getRecommendedSongs } from '../services/songsService';
import { getPopularArtists } from '../services/artistsService';
import usePlayerStore from '../store/playerStore';

export default function Home() {
  const [greeting, setGreeting] = useState('');
  const playSong = usePlayerStore((s) => s.playSong);

  // --- Greeting dynamique selon l'heure ----------------------------------------
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');
  }, []);

  // --- Requêtes Supabase via React Query ---------------------------------------

  const {
    data: trending,
    isLoading: loadingTrending,
    isError: errorTrending,
  } = useQuery({
    queryKey: ['songs', 'trending'],
    queryFn: () => getTrendingSongs(12),
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const {
    data: newSongs,
    isLoading: loadingNew,
    isError: errorNew,
  } = useQuery({
    queryKey: ['songs', 'new'],
    queryFn: () => getNewSongs(12),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: recommended,
    isLoading: loadingRecommended,
    isError: errorRecommended,
  } = useQuery({
    queryKey: ['songs', 'recommended'],
    queryFn: () => getRecommendedSongs(12),
    staleTime: 2 * 60 * 1000, // 2 min
  });

  const {
    data: popularArtists,
    isLoading: loadingArtists,
    isError: errorArtists,
  } = useQuery({
    queryKey: ['artists', 'popular'],
    queryFn: () => getPopularArtists(12),
    staleTime: 10 * 60 * 1000, // 10 min
  });

  // --- Handler play -----------------------------------------------------------

  function handlePlaySong(song) {
    playSong(song);
  }

  // --- Render -----------------------------------------------------------------

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-neutral-900 to-black px-6 pt-6 pb-32">

      {/* ── Hero Greeting ── */}
      <section className="mb-8">
        <h1 className="text-white text-3xl font-extrabold tracking-tight mb-6">
          {greeting} 👋
        </h1>

        {/* Raccourcis rapides vers les playlists likées etc. */}
        <QuickShortcuts />
      </section>

      {/* ── Tendances ── */}
      <Carousel
        title="🔥 Tendances"
        seeAllLink="/search"
        isLoading={loadingTrending}
      >
        {errorTrending ? (
          <SectionError message="Impossible de charger les tendances." />
        ) : (
          trending?.map((song) => (
            <div key={song.id} className="flex-shrink-0 w-40">
              <Card type="song" item={song} onPlay={handlePlaySong} />
            </div>
          ))
        )}
      </Carousel>

      {/* ── Artistes populaires ── */}
      <Carousel
        title="⭐ Artistes populaires"
        seeAllLink="/search"
        isLoading={loadingArtists}
      >
        {errorArtists ? (
          <SectionError message="Impossible de charger les artistes." />
        ) : (
          popularArtists?.map((artist) => (
            <div key={artist.id} className="flex-shrink-0 w-40">
              <Card type="artist" item={artist} />
            </div>
          ))
        )}
      </Carousel>

      {/* ── Nouveautés ── */}
      <Carousel
        title="✨ Nouveautés"
        seeAllLink="/search"
        isLoading={loadingNew}
      >
        {errorNew ? (
          <SectionError message="Impossible de charger les nouveautés." />
        ) : (
          newSongs?.map((song) => (
            <div key={song.id} className="flex-shrink-0 w-40">
              <Card type="song" item={song} onPlay={handlePlaySong} />
            </div>
          ))
        )}
      </Carousel>

      {/* ── Recommandations ── */}
      <Carousel
        title="💡 Recommandations pour toi"
        isLoading={loadingRecommended}
      >
        {errorRecommended ? (
          <SectionError message="Impossible de charger les recommandations." />
        ) : (
          recommended?.map((song) => (
            <div key={song.id} className="flex-shrink-0 w-40">
              <Card type="song" item={song} onPlay={handlePlaySong} />
            </div>
          ))
        )}
      </Carousel>

      {/* ── Message si aucune donnée ── */}
      {!loadingTrending && !trending?.length && (
        <EmptyState />
      )}
    </main>
  );
}

// --- Sous-composants ---------------------------------------------------------

/**
 * Raccourcis rapides en haut de la page (accès à la bibliothèque, aux likés, etc.)
 */
function QuickShortcuts() {
  const shortcuts = [
    { label: '❤️ Titres likés', to: '/playlist/liked' },
    { label: '📂 Ma bibliothèque', to: '/library' },
    { label: '🔍 Découvrir', to: '/search' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {shortcuts.map((s) => (
        <Link
          key={s.to}
          to={s.to}
          className="flex items-center gap-3 bg-white/10 hover:bg-white/20
                     rounded-md px-4 py-3
                     text-white text-sm font-semibold
                     transition-colors duration-150"
        >
          {s.label}
        </Link>
      ))}
    </div>
  );
}

/** Message d'erreur inline dans un carrousel */
function SectionError({ message }) {
  return (
    <p className="text-neutral-500 text-sm italic py-4 px-2">{message}</p>
  );
}

/** Écran vide si Supabase ne retourne aucune chanson */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4">🎵</span>
      <h2 className="text-white text-xl font-bold mb-2">
        Aucune musique pour l'instant
      </h2>
      <p className="text-neutral-400 text-sm max-w-xs">
        La bibliothèque est vide. Demande au Membre 1 d'importer des données
        de test dans Supabase.
      </p>
    </div>
  );
}