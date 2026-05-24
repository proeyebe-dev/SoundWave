import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPlaylistById,
  getLikedSongIds,
  toggleLikeSong,
  deletePlaylist,
  updatePlaylist,
  uploadPlaylistCover,
  addSongToPlaylist,
  formatDuration,
  formatTotalDuration,
  getTotalDuration,
} from '../services/playlistService';
import SongRow from '../components/playlist/SongRow';

// ─── ICÔNES ───────────────────────────────────────────────────────────────────
const PlayIcon = ({ size = 6 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`w-${size} h-${size}`}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ShuffleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);

const DotsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// ─── MODAL ÉDITION PLAYLIST ───────────────────────────────────────────────────
function EditModal({ playlist, onClose, onSaved }) {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description ?? '');
  const [isPublic, setIsPublic] = useState(playlist.is_public ?? false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(playlist.cover_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCover = (e) => {
    const file = e.target.files?.[0];
    if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Le nom est requis'); return; }
    setSaving(true); setError('');
    try {
      let updated = await updatePlaylist(playlist.id, { name: name.trim(), description: description.trim(), isPublic });
      if (coverFile) {
        const coverUrl = await uploadPlaylistCover(playlist.id, coverFile);
        updated = await updatePlaylist(playlist.id, { coverUrl });
      }
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl bg-sw-popup border border-white/10 shadow-2xl p-6 flex flex-col gap-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-sw-text">Modifier la playlist</h2>
          <button onClick={onClose} className="text-sw-muted hover:text-sw-text transition-colors p-1">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            <label className="relative w-24 h-24 rounded-xl overflow-hidden bg-sw-surface border-2 border-dashed border-white/20 hover:border-sw-green/50 transition-colors cursor-pointer flex-shrink-0 group">
              {coverPreview
                ? <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-sw-muted group-hover:text-sw-green transition-colors">
                    <UploadIcon /><span className="text-xs">Photo</span>
                  </div>
              }
              <input type="file" accept="image/*" onChange={handleCover} className="sr-only" />
            </label>
            <div className="flex-1 flex flex-col gap-3">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nom de la playlist" maxLength={100}
                className="w-full bg-sw-surface border border-white/10 rounded-lg px-3 py-2.5 text-sw-text placeholder:text-sw-muted text-sm focus:outline-none focus:border-sw-green/60 transition-colors" autoFocus />
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" maxLength={300} rows={2}
                className="w-full bg-sw-surface border border-white/10 rounded-lg px-3 py-2.5 text-sw-text placeholder:text-sw-muted text-sm resize-none focus:outline-none focus:border-sw-green/60 transition-colors" />
            </div>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-sw-text">Rendre publique</span>
            <button type="button" onClick={() => setIsPublic(v => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${isPublic ? 'bg-sw-green' : 'bg-sw-surface-hover'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>

          {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-white/20 text-sw-text text-sm font-medium hover:bg-white/5 transition-colors">Annuler</button>
            <button type="submit" disabled={saving || !name.trim()} className="flex-1 py-2.5 rounded-full bg-sw-green text-black text-sm font-bold hover:bg-sw-green-light transition-colors disabled:opacity-50">
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── PAGE PLAYLIST ─────────────────────────────────────────────────────────────
export default function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentSongId, setCurrentSongId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedOverrides, setLikedOverrides] = useState({});

  // ── Requêtes ──────────────────────────────────────────────────────────────
  const { data: playlist, isLoading, isError } = useQuery({
    queryKey: ['playlist', id],
    queryFn: () => getPlaylistById(id),
    enabled: !!id,
  });

  const { data: likedIds = [] } = useQuery({
    queryKey: ['likedSongIds'],
    queryFn: getLikedSongIds,
  });

  // ── Delete mutation ───────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: () => deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      navigate('/library');
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePlay = useCallback((song) => {
    if (currentSongId === song.id) {
      setIsPlaying(v => !v);
    } else {
      setCurrentSongId(song.id);
      setIsPlaying(true);
    }
    // TODO: connecter au store audio Zustand
  }, [currentSongId]);

  const handleLikeChange = useCallback((songId, nowLiked) => {
    setLikedOverrides(prev => ({ ...prev, [songId]: nowLiked }));
  }, []);

  const handleDelete = () => {
    setMenuOpen(false);
    if (window.confirm(`Supprimer la playlist « ${playlist?.name} » ?`)) {
      deleteMutation.mutate();
    }
  };

  const handleEditSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['playlist', id] });
    queryClient.invalidateQueries({ queryKey: ['playlists'] });
  };

  const isSongLiked = (songId) => {
    if (songId in likedOverrides) return likedOverrides[songId];
    return likedIds.includes(songId);
  };

  // ── Données dérivées ──────────────────────────────────────────────────────
  const songs = playlist?.playlist_songs ?? [];
  const filteredSongs = songs.filter(ps =>
    ps.songs?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ps.songs?.artists?.[0]?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalDuration = formatTotalDuration(getTotalDuration(songs));
  const coverUrl = playlist?.cover_url;

  // ── Rendu ─────────────────────────────────────────────────────────────────
  if (isLoading) return <PlaylistSkeleton />;

  if (isError || !playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-sw-muted">
        <p className="text-lg text-sw-text">Playlist introuvable</p>
        <button onClick={() => navigate('/library')} className="text-sm text-sw-green hover:underline">
          ← Retour à la bibliothèque
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* ── Hero ── */}
      <div className="relative">
        {/* Fond dégradé */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: coverUrl
              ? `linear-gradient(to bottom, rgba(30,30,40,0.7) 0%, var(--color-bg) 100%)`
              : `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, var(--color-bg) 100%)`,
          }}
        />

        <div className="relative flex flex-col sm:flex-row gap-6 px-6 pt-6 pb-8 items-end">
          {/* Bouton retour (mobile) */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 sm:hidden w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-sw-text"
          >
            <BackIcon />
          </button>

          {/* Cover */}
          <div className="w-44 h-44 sm:w-52 sm:h-52 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl mx-auto sm:mx-0 bg-sw-surface">
            {coverUrl ? (
              <img src={coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sw-surface to-sw-bg text-sw-muted text-5xl">
                ♪
              </div>
            )}
          </div>

          {/* Méta */}
          <div className="flex flex-col gap-2 min-w-0 text-center sm:text-left">
            <span className="text-xs uppercase tracking-widest text-sw-muted font-medium">
              {playlist.is_public ? 'Playlist publique' : 'Playlist privée'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-sw-text leading-tight truncate">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-sw-muted text-sm max-w-md line-clamp-2">{playlist.description}</p>
            )}
            <div className="text-xs text-sw-muted flex items-center gap-1.5 justify-center sm:justify-start">
              <span className="font-medium text-sw-text/80">
                {playlist.profiles?.username ?? 'Vous'}
              </span>
              <span>·</span>
              <span>{songs.length} titre{songs.length !== 1 ? 's' : ''}</span>
              <span>·</span>
              <span>{totalDuration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Barre d'actions ── */}
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Bouton Play principal */}
        <button
          onClick={() => songs[0] && handlePlay(songs[0].songs)}
          disabled={songs.length === 0}
          className="w-14 h-14 rounded-full bg-sw-green flex items-center justify-center text-black shadow-lg hover:scale-105 hover:bg-sw-green-light transition-all duration-200 disabled:opacity-40"
          aria-label="Lire la playlist"
        >
          <PlayIcon size={6} />
        </button>

        {/* Shuffle */}
        <button
          className="w-10 h-10 flex items-center justify-center text-sw-muted hover:text-sw-text transition-colors"
          aria-label="Lecture aléatoire"
        >
          <ShuffleIcon />
        </button>

        {/* Menu "…" */}
        <div className="relative ml-auto">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-10 h-10 flex items-center justify-center text-sw-muted hover:text-sw-text transition-colors"
            aria-label="Options"
          >
            <DotsIcon />
          </button>

          {menuOpen && (
            <div className="absolute top-full right-0 mt-1 z-50 w-48 rounded-xl bg-sw-popup border border-white/5 shadow-2xl overflow-hidden">
              <button
                onClick={() => { setEditOpen(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-sw-text hover:bg-white/10 transition-colors"
              >
                <EditIcon /> Modifier la playlist
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors"
                disabled={deleteMutation.isPending}
              >
                <TrashIcon /> {deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Recherche (si > 10 titres) ── */}
      {songs.length > 10 && (
        <div className="px-6 pb-4">
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sw-muted pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans cette playlist"
              className="w-full pl-9 pr-8 py-2 bg-sw-surface border border-white/10 rounded-full text-sm text-sw-text placeholder:text-sw-muted focus:outline-none focus:border-sw-green/50 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sw-muted hover:text-sw-text">
                <CloseIcon />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Header tableau ── */}
      {songs.length > 0 && (
        <div
          className="grid items-center gap-3 px-4 mx-6 mb-1 border-b border-white/10 pb-2"
          style={{ gridTemplateColumns: '28px 40px 1fr auto auto auto' }}
        >
          <span className="text-xs text-sw-muted text-center">#</span>
          <span />
          <span className="text-xs text-sw-muted uppercase tracking-wider">Titre</span>
          <span className="text-xs text-sw-muted uppercase tracking-wider hidden md:block">Album</span>
          <span />
          <span className="text-xs text-sw-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
        </div>
      )}

      {/* ── Liste des chansons ── */}
      <div className="flex flex-col px-6 pb-8">
        {songs.length === 0 ? (
          <EmptyPlaylist />
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-12 text-sw-muted text-sm">
            Aucun résultat pour « {searchQuery} »
          </div>
        ) : (
          filteredSongs.map((ps, idx) => (
            <SongRow
              key={ps.id}
              index={ps.position + 1}
              song={ps.songs}
              isLiked={isSongLiked(ps.songs?.id)}
              isPlaying={isPlaying && currentSongId === ps.songs?.id}
              isActive={currentSongId === ps.songs?.id}
              playlistId={id}
              showRemove
              onPlay={handlePlay}
              onLikeChange={handleLikeChange}
            />
          ))
        )}
      </div>

      {/* ── Modal édition ── */}
      {editOpen && (
        <EditModal playlist={playlist} onClose={() => setEditOpen(false)} onSaved={handleEditSaved} />
      )}
    </div>
  );
}

// ─── COMPOSANTS AUXILIAIRES ───────────────────────────────────────────────────

function EmptyPlaylist() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-sw-muted">
      <p className="text-sw-text font-medium">Cette playlist est vide</p>
      <p className="text-sm">Parcourez la bibliothèque et ajoutez des titres.</p>
    </div>
  );
}

function PlaylistSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex gap-6 items-end">
        <div className="w-52 h-52 rounded-xl bg-sw-surface animate-pulse flex-shrink-0" />
        <div className="flex flex-col gap-3 flex-1">
          <div className="h-3 w-20 rounded bg-sw-surface animate-pulse" />
          <div className="h-10 w-64 rounded bg-sw-surface animate-pulse" />
          <div className="h-3 w-40 rounded bg-sw-surface animate-pulse" />
          <div className="h-3 w-32 rounded bg-sw-surface animate-pulse" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-full bg-sw-surface animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-sw-surface animate-pulse" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2">
          <div className="w-6 h-3 rounded bg-sw-surface animate-pulse" />
          <div className="w-10 h-10 rounded bg-sw-surface animate-pulse" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3 w-36 rounded bg-sw-surface animate-pulse" />
            <div className="h-2.5 w-24 rounded bg-sw-surface animate-pulse" />
          </div>
          <div className="h-3 w-10 rounded bg-sw-surface animate-pulse" />
        </div>
      ))}
    </div>
  );
}
