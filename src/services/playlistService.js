import { supabase } from './supabase';

// ─── PLAYLISTS ────────────────────────────────────────────────────────────────

/**
 * Récupère toutes les playlists de l'utilisateur connecté
 */
export async function getUserPlaylists() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('playlists')
    .select(`
      id,
      name,
      description,
      cover_url,
      is_public,
      created_at,
      updated_at,
      playlist_songs(count)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Récupère une playlist par son ID avec ses chansons
 */
export async function getPlaylistById(playlistId) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('playlists')
    .select(`
      id,
      name,
      description,
      cover_url,
      is_public,
      created_at,
      updated_at,
      user_id,
      profiles:user_id (username, avatar_url),
      playlist_songs (
        id,
        position,
        added_at,
        songs (
          id,
          title,
          duration,
          audio_url,
          cover_url,
          artists (id, name),
          albums (id, name, cover_url)
        )
      )
    `)
    .eq('id', playlistId)
    .single();

  if (error) throw error;

  // Trier les chansons par position
  if (data.playlist_songs) {
    data.playlist_songs.sort((a, b) => a.position - b.position);
  }

  return data;
}

/**
 * Crée une nouvelle playlist
 */
export async function createPlaylist({ name, description = '', isPublic = false, coverUrl = null }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('playlists')
    .insert({
      name,
      description,
      is_public: isPublic,
      cover_url: coverUrl,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Met à jour une playlist existante
 */
export async function updatePlaylist(playlistId, { name, description, isPublic, coverUrl }) {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (isPublic !== undefined) updates.is_public = isPublic;
  if (coverUrl !== undefined) updates.cover_url = coverUrl;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('playlists')
    .update(updates)
    .eq('id', playlistId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Supprime une playlist
 */
export async function deletePlaylist(playlistId) {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId);

  if (error) throw error;
  return true;
}

// ─── CHANSONS DANS LES PLAYLISTS ─────────────────────────────────────────────

/**
 * Ajoute une chanson à une playlist
 */
export async function addSongToPlaylist(playlistId, songId) {
  // Récupère la position max actuelle
  const { data: existing } = await supabase
    .from('playlist_songs')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { data, error } = await supabase
    .from('playlist_songs')
    .insert({
      playlist_id: playlistId,
      song_id: songId,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Cette chanson est déjà dans la playlist');
    throw error;
  }

  // Met à jour le timestamp de la playlist
  await supabase
    .from('playlists')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', playlistId);

  return data;
}

/**
 * Retire une chanson d'une playlist
 */
export async function removeSongFromPlaylist(playlistId, songId) {
  const { error } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('song_id', songId);

  if (error) throw error;

  await supabase
    .from('playlists')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', playlistId);

  return true;
}

/**
 * Réordonne les chansons d'une playlist
 */
export async function reorderPlaylistSongs(playlistId, orderedSongIds) {
  const updates = orderedSongIds.map((songId, index) => ({
    playlist_id: playlistId,
    song_id: songId,
    position: index,
  }));

  const { error } = await supabase
    .from('playlist_songs')
    .upsert(updates, { onConflict: 'playlist_id,song_id' });

  if (error) throw error;
  return true;
}

// ─── LIKES ───────────────────────────────────────────────────────────────────

/**
 * Récupère tous les IDs des chansons likées par l'utilisateur
 */
export async function getLikedSongIds() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('liked_songs')
    .select('song_id')
    .eq('user_id', user.id);

  if (error) throw error;
  return data.map(row => row.song_id);
}

/**
 * Récupère les chansons likées avec leurs détails
 */
export async function getLikedSongs() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('liked_songs')
    .select(`
      liked_at,
      songs (
        id,
        title,
        duration,
        audio_url,
        cover_url,
        artists (id, name),
        albums (id, name, cover_url)
      )
    `)
    .eq('user_id', user.id)
    .order('liked_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Like une chanson
 */
export async function likeSong(songId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('liked_songs')
    .insert({ user_id: user.id, song_id: songId })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Chanson déjà likée');
    throw error;
  }
  return data;
}

/**
 * Unlike une chanson
 */
export async function unlikeSong(songId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { error } = await supabase
    .from('liked_songs')
    .delete()
    .eq('user_id', user.id)
    .eq('song_id', songId);

  if (error) throw error;
  return true;
}

/**
 * Toggle le like d'une chanson (pratique pour les boutons)
 */
export async function toggleLikeSong(songId, currentlyLiked) {
  if (currentlyLiked) {
    await unlikeSong(songId);
    return false;
  } else {
    await likeSong(songId);
    return true;
  }
}

/**
 * Vérifie si une chanson est likée
 */
export async function isSongLiked(songId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('liked_songs')
    .select('song_id')
    .eq('user_id', user.id)
    .eq('song_id', songId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// ─── UPLOAD COVER ─────────────────────────────────────────────────────────────

/**
 * Upload une image de couverture pour une playlist
 */
export async function uploadPlaylistCover(playlistId, file) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const ext = file.name.split('.').pop();
  const filePath = `playlist-covers/${user.id}/${playlistId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
}

// ─── UTILITAIRES ──────────────────────────────────────────────────────────────

/**
 * Formate une durée en secondes → mm:ss
 */
export function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Calcule la durée totale d'une playlist en secondes
 */
export function getTotalDuration(playlistSongs) {
  return playlistSongs?.reduce((acc, ps) => acc + (ps.songs?.duration || 0), 0) || 0;
}

/**
 * Formate la durée totale d'une playlist
 */
export function formatTotalDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
}
