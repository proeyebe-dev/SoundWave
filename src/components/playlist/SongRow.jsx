import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLikeSong, removeSongFromPlaylist, formatDuration } from '../../services/playlistService';

// ─── ICÔNES ───────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const DotsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-sw-muted">
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);

// ─── COMPOSANT ────────────────────────────────────────────────────────────────
/**
 * @param {Object}   props
 * @param {number}   props.index          - Position dans la playlist (1-based)
 * @param {Object}   props.song           - Objet chanson (avec artists, albums)
 * @param {boolean}  props.isLiked        - Si la chanson est likée
 * @param {boolean}  props.isPlaying      - Si la chanson est en cours de lecture
 * @param {boolean}  props.isActive       - Si la chanson est sélectionnée/active
 * @param {string}   props.playlistId     - ID de la playlist parente (pour retrait)
 * @param {boolean}  props.showRemove     - Affiche le bouton "Retirer de la playlist"
 * @param {Function} props.onPlay         - Callback quand on clique sur Play
 * @param {Function} props.onLikeChange   - Callback quand le like change
 */
export default function SongRow({
  index,
  song,
  isLiked = false,
  isPlaying = false,
  isActive = false,
  playlistId,
  showRemove = false,
  onPlay,
  onLikeChange,
}) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const artist = song?.artists?.[0]?.name ?? 'Artiste inconnu';
  const album = song?.albums?.name ?? '';
  const cover = song?.cover_url || song?.albums?.cover_url;
  const duration = formatDuration(song?.duration);

  // ── Mutation like ──
  const likeMutation = useMutation({
    mutationFn: () => toggleLikeSong(song.id, isLiked),
    onSuccess: (nowLiked) => {
      onLikeChange?.(song.id, nowLiked);
      queryClient.invalidateQueries({ queryKey: ['likedSongs'] });
    },
  });

  // ── Mutation retirer de playlist ──
  const removeMutation = useMutation({
    mutationFn: () => removeSongFromPlaylist(playlistId, song.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
    },
  });

  const handleLike = (e) => {
    e.stopPropagation();
    if (!likeMutation.isPending) likeMutation.mutate();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    removeMutation.mutate();
  };

  return (
    <div
      className={`
        song-row group relative grid items-center gap-3 px-4 py-2 rounded-lg
        transition-colors duration-150 cursor-pointer select-none
        ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
      `}
      style={{ gridTemplateColumns: '28px 40px 1fr auto auto auto' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      onDoubleClick={() => onPlay?.(song)}
    >
      {/* Index / Play */}
      <div className="flex items-center justify-center w-7">
        {hovered ? (
          <button
            onClick={() => onPlay?.(song)}
            className="text-sw-text hover:text-white transition-colors"
            aria-label={`Lire ${song?.title}`}
          >
            <PlayIcon />
          </button>
        ) : isPlaying ? (
          <span className="flex gap-0.5 items-end h-4">
            {[1, 2, 3].map(i => (
              <span
                key={i}
                className="w-0.5 bg-sw-green rounded-full animate-equalizer"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        ) : (
          <span className={`text-sm font-medium tabular-nums ${isActive ? 'text-sw-green' : 'text-sw-muted'}`}>
            {index}
          </span>
        )}
      </div>

      {/* Cover */}
      <div className="w-10 h-10 rounded overflow-hidden bg-sw-surface flex-shrink-0">
        {cover ? (
          <img src={cover} alt={song?.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MusicIcon />
          </div>
        )}
      </div>

      {/* Titre + Artiste */}
      <div className="min-w-0">
        <p className={`text-sm font-medium truncate leading-tight ${isActive || isPlaying ? 'text-sw-green' : 'text-sw-text'}`}>
          {song?.title ?? 'Titre inconnu'}
        </p>
        <p className="text-xs text-sw-muted truncate mt-0.5">{artist}</p>
      </div>

      {/* Album */}
      <p className="text-xs text-sw-muted truncate hidden md:block max-w-[160px]">
        {album}
      </p>

      {/* Like */}
      <button
        onClick={handleLike}
        disabled={likeMutation.isPending}
        className={`
          transition-all duration-200 p-1 rounded
          ${isLiked ? 'text-sw-green opacity-100' : 'text-sw-muted opacity-0 group-hover:opacity-100 hover:text-sw-text'}
          ${likeMutation.isPending ? 'animate-pulse' : ''}
        `}
        aria-label={isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <HeartIcon filled={isLiked} />
      </button>

      {/* Durée */}
      <span className="text-xs text-sw-muted tabular-nums w-10 text-right">{duration}</span>

      {/* Menu "…" */}
      {showRemove && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
            className={`
              p-1 rounded text-sw-muted hover:text-sw-text transition-all duration-150
              ${hovered || menuOpen ? 'opacity-100' : 'opacity-0'}
            `}
            aria-label="Options"
          >
            <DotsIcon />
          </button>

          {menuOpen && (
            <div className="absolute bottom-full right-0 mb-1 z-50 w-48 rounded-xl bg-sw-popup shadow-2xl border border-white/5 overflow-hidden">
              <button
                onClick={handleRemove}
                disabled={removeMutation.isPending}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-white/10 transition-colors"
              >
                <TrashIcon />
                {removeMutation.isPending ? 'Retrait…' : 'Retirer de la playlist'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
