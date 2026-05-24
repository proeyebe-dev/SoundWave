import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserPlaylists, getLikedSongs, createPlaylist, updatePlaylist, uploadPlaylistCover } from '../services/playlistService';
import PlaylistCard from '../components/playlist/PlaylistCard';

// ─── ICÔNES ───────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// ─── MODAL CRÉER / MODIFIER ────────────────────────────────────────────────────
function PlaylistModal({ playlist, onClose, onSaved }) {
  const [name, setName] = useState(playlist?.name ?? '');
  const [description, setDescription] = useState(playlist?.description ?? '');
  const [isPublic, setIsPublic] = useState(playlist?.is_public ?? false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(playlist?.cover_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!playlist?.id;

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Le nom est requis'); return; }
    setSaving(true);
    setError('');

    try {
      let coverUrl = playlist?.cover_url ?? null;

      if (isEdit) {
        let updated = await updatePlaylist(playlist.id, { name: name.trim(), description: description.trim(), isPublic });
        if (coverFile) {
          coverUrl = await uploadPlaylistCover(playlist.id, coverFile);
          updated = await updatePlaylist(playlist.id, { coverUrl });
        }
        onSaved(updated);
      } else {
        const created = await createPlaylist({ name: name.trim(), description: description.trim(), isPublic });
        if (coverFile) {
          coverUrl = await uploadPlaylistCover(created.id, coverFile);
          await updatePlaylist(created.id, { coverUrl });
        }
        onSaved({ ...created, cover_url: coverUrl });
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md rounded-2xl bg-sw-popup border border-white/10 shadow-2xl p-6 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-sw-text">
            {isEdit ? 'Modifier la playlist' : 'Nouvelle playlist'}
          </h2>
          <button onClick={onClose} className="text-sw-muted hover:text-sw-text transition-colors p-1">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Cover upload */}
          <div className="flex gap-4 items-start">
            <label className="relative w-24 h-24 rounded-xl overflow-hidden bg-sw-surface border-2 border-dashed border-white/20 hover:border-sw-green/50 transition-colors cursor-pointer flex-shrink-0 group">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-sw-muted group-hover:text-sw-green transition-colors">
                  <UploadIcon />
                  <span className="text-xs">Photo</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleCoverChange} className="sr-only" />
            </label>

            <div className="flex-1 flex flex-col gap-3">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nom de la playlist"
                  maxLength={100}
                  className="w-full bg-sw-surface border border-white/10 rounded-lg px-3 py-2.5 text-sw-text placeholder:text-sw-muted text-sm focus:outline-none focus:border-sw-green/60 transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Description (optionnel)"
                  maxLength={300}
                  rows={2}
                  className="w-full bg-sw-surface border border-white/10 rounded-lg px-3 py-2.5 text-sw-text placeholder:text-sw-muted text-sm resize-none focus:outline-none focus:border-sw-green/60 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Toggle public */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-sw-text">Rendre publique</span>
            <button
              type="button"
              onClick={() => setIsPublic(v => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${isPublic ? 'bg-sw-green' : 'bg-sw-surface-hover'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>

          {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-white/20 text-sw-text text-sm font-medium hover:bg-white/5 transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 py-2.5 rounded-full bg-sw-green text-black text-sm font-bold hover:bg-sw-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement…' : isEdit ? 'Sauvegarder' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── PAGE LIBRARY ─────────────────────────────────────────────────────────────
export default function Library() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState(null);
  const queryClient = useQueryClient();

  const { data: playlists = [], isLoading, isError } = useQuery({
    queryKey: ['playlists'],
    queryFn: getUserPlaylists,
  });

  const { data: likedSongs = [] } = useQuery({
    queryKey: ['likedSongs'],
    queryFn: getLikedSongs,
  });

  const filtered = playlists.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSaved = (newPlaylist) => {
    queryClient.invalidateQueries({ queryKey: ['playlists'] });
  };

  const handleEditSaved = (updated) => {
    queryClient.invalidateQueries({ queryKey: ['playlists'] });
    queryClient.invalidateQueries({ queryKey: ['playlist', updated.id] });
  };

  const openEdit = (playlist) => {
    setEditPlaylist(playlist);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditPlaylist(null);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-sw-bg/80 backdrop-blur-md px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-sw-text">Votre bibliothèque</h1>
          <button
            onClick={() => { setEditPlaylist(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-sw-surface hover:bg-sw-surface-hover text-sw-text text-sm font-medium transition-colors"
          >
            <PlusIcon />
            Créer une playlist
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-sw-muted" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sw-muted pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une playlist…"
              className="w-full pl-9 pr-4 py-2 bg-sw-surface border border-white/10 rounded-full text-sm text-sw-text placeholder:text-sw-muted focus:outline-none focus:border-sw-green/50 transition-colors"
            />
          </div>

          {/* Toggle vue */}
          <div className="flex items-center gap-1 bg-sw-surface rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded transition-colors ${view === 'grid' ? 'text-sw-text bg-sw-surface-hover' : 'text-sw-muted hover:text-sw-text'}`}
              aria-label="Vue grille"
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded transition-colors ${view === 'list' ? 'text-sw-text bg-sw-surface-hover' : 'text-sw-muted hover:text-sw-text'}`}
              aria-label="Vue liste"
            >
              <ListIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 px-6 pb-32">
        {isLoading ? (
          <LibrarySkeleton view={view} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-sw-muted">
            <p className="text-lg">Impossible de charger vos playlists</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['playlists'] })}
              className="text-sm text-sw-green hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {/* Chansons likées — toujours en premier */}
            {!search && (
              <div className="mb-6">
                <LikedSongsCard count={likedSongs.length} view={view} />
              </div>
            )}

            {filtered.length === 0 && search ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-sw-muted">
                <p>Aucune playlist pour « {search} »</p>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyLibrary onCreate={() => { setEditPlaylist(null); setModalOpen(true); }} />
            ) : (
              <div className={
                view === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                  : 'flex flex-col gap-1'
              }>
                {filtered.map(pl => (
                  view === 'grid' ? (
                    <PlaylistCard key={pl.id} playlist={pl} editable onEdit={openEdit} />
                  ) : (
                    <PlaylistListRow key={pl.id} playlist={pl} onEdit={openEdit} />
                  )
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <PlaylistModal
          playlist={editPlaylist}
          onClose={closeModal}
          onSaved={editPlaylist ? handleEditSaved : handleCreateSaved}
        />
      )}
    </div>
  );
}

// ─── COMPOSANTS AUXILIAIRES ───────────────────────────────────────────────────

function LikedSongsCard({ count, view }) {
  if (view === 'list') {
    return (
      <a href="/liked" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-sw-surface transition-colors group">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <HeartIcon />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sw-text text-sm">Titres likés</p>
          <p className="text-xs text-sw-muted">{count} titre{count !== 1 ? 's' : ''}</p>
        </div>
      </a>
    );
  }
  return (
    <a href="/liked" className="flex flex-col justify-end p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 aspect-[2/0.9] hover:opacity-90 transition-opacity">
      <div className="flex items-center gap-2">
        <HeartIcon />
        <div>
          <p className="font-bold text-white text-sm">Titres likés</p>
          <p className="text-xs text-white/70">{count} titre{count !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </a>
  );
}

function PlaylistListRow({ playlist, onEdit }) {
  const songCount = playlist.playlist_songs?.[0]?.count ?? playlist.playlist_songs?.length ?? 0;
  return (
    <a href={`/playlist/${playlist.id}`} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-sw-surface transition-colors group">
      <div className="w-12 h-12 rounded-lg bg-sw-surface-hover overflow-hidden flex-shrink-0">
        {playlist.cover_url
          ? <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-sw-muted text-xs">♪</div>
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sw-text text-sm truncate">{playlist.name}</p>
        <p className="text-xs text-sw-muted">{songCount} titre{songCount !== 1 ? 's' : ''}</p>
      </div>
      <button
        onClick={e => { e.preventDefault(); onEdit(playlist); }}
        className="opacity-0 group-hover:opacity-100 text-sw-muted hover:text-sw-text transition-all p-1.5 rounded"
        aria-label="Modifier"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </a>
  );
}

function EmptyLibrary({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-20 h-20 rounded-full bg-sw-surface flex items-center justify-center text-sw-muted text-4xl">
        ♪
      </div>
      <div>
        <p className="text-sw-text font-semibold text-lg">Commencez votre bibliothèque</p>
        <p className="text-sw-muted text-sm mt-1">Créez votre première playlist et ajoutez-y des titres.</p>
      </div>
      <button
        onClick={onCreate}
        className="px-6 py-2.5 rounded-full bg-sw-green text-black text-sm font-bold hover:bg-sw-green-light transition-colors"
      >
        Créer une playlist
      </button>
    </div>
  );
}

function LibrarySkeleton({ view }) {
  return (
    <div className={view === 'grid'
      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
      : 'flex flex-col gap-1'
    }>
      {Array.from({ length: 8 }).map((_, i) => (
        view === 'grid' ? (
          <div key={i} className="flex flex-col gap-3 p-3">
            <div className="aspect-square rounded-lg bg-sw-surface animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-sw-surface animate-pulse" />
            <div className="h-2.5 w-1/2 rounded bg-sw-surface animate-pulse" />
          </div>
        ) : (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="w-12 h-12 rounded-lg bg-sw-surface animate-pulse" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3 w-32 rounded bg-sw-surface animate-pulse" />
              <div className="h-2.5 w-20 rounded bg-sw-surface animate-pulse" />
            </div>
          </div>
        )
      ))}
    </div>
  );
}
