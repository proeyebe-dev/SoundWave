import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Composant Card réutilisable
 *
 * Props :
 * @param {'song' | 'album' | 'playlist' | 'artist'} type - Type de carte
 * @param {object} item - Données de l'élément
 * @param {function} onPlay - Callback appelé au clic sur le bouton play
 */
export default function Card({ type = 'song', item, onPlay }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!item) return null;

  // --- Helpers ----------------------------------------------------------------

  const coverUrl = item.cover_url ?? item.image_url ?? null;
  const isArtist = type === 'artist';

  /** Retourne le lien de navigation selon le type de carte */
  function getLink() {
    switch (type) {
      case 'song':
        return `/album/${item.album_id ?? ''}`;
      case 'album':
        return `/album/${item.id}`;
      case 'playlist':
        return `/playlist/${item.id}`;
      case 'artist':
        return `/artist/${item.id}`;
      default:
        return '#';
    }
  }

  /** Retourne le sous-titre affiché sous le nom */
  function getSubtitle() {
    switch (type) {
      case 'song':
        return item.artists?.name ?? 'Artiste inconnu';
      case 'album':
        return item.release_year ? `Album · ${item.release_year}` : 'Album';
      case 'playlist':
        return item.description ?? 'Playlist';
      case 'artist':
        return 'Artiste';
      default:
        return '';
    }
  }

  /** Formate une durée en secondes → "m:ss" */
  function formatDuration(seconds) {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // --- Handlers ---------------------------------------------------------------

  function handlePlayClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (onPlay) onPlay(item);
  }

  // --- Render -----------------------------------------------------------------

  return (
    <Link
      to={getLink()}
      className="group flex flex-col gap-3 p-3 rounded-lg cursor-pointer
                 bg-white/5 hover:bg-white/10
                 transition-colors duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Ouvrir ${item.title ?? item.name}`}
    >
      {/* Cover / Avatar */}
      <div className="relative w-full aspect-square overflow-hidden shadow-lg
                      flex-shrink-0"
           style={{ borderRadius: isArtist ? '50%' : '8px' }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={item.title ?? item.name}
            className="w-full h-full object-cover transition-transform duration-300
                       group-hover:scale-105"
          />
        ) : (
          // Placeholder si pas d'image
          <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
            <PlaceholderIcon type={type} />
          </div>
        )}

        {/* Bouton Play (affiché au survol, sauf pour artiste) */}
        {!isArtist && (
          <button
            onClick={handlePlayClick}
            className={`absolute bottom-2 right-2
                        w-10 h-10 rounded-full
                        bg-green-500 hover:bg-green-400 hover:scale-105
                        flex items-center justify-center shadow-xl
                        transition-all duration-200
                        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            aria-label="Lire"
          >
            <PlayIcon />
          </button>
        )}
      </div>

      {/* Texte */}
      <div className="min-w-0">
        <p className="text-white font-semibold text-sm truncate">
          {item.title ?? item.name ?? 'Sans titre'}
        </p>
        <p className="text-neutral-400 text-xs truncate mt-0.5">
          {getSubtitle()}
        </p>
        {/* Durée pour les chansons */}
        {type === 'song' && item.duration && (
          <p className="text-neutral-500 text-xs mt-0.5">
            {formatDuration(item.duration)}
          </p>
        )}
      </div>
    </Link>
  );
}

// --- Icônes inline légères ---------------------------------------------------

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-black ml-0.5">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PlaceholderIcon({ type }) {
  if (type === 'artist') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-neutral-600">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    );
  }
  if (type === 'playlist') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-neutral-600">
        <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
      </svg>
    );
  }
  // song / album
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-neutral-600">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}