import { supabase } from './supabase';

/**
 * Récupère tous les artistes
 * @param {number} limit
 */
export async function getArtists(limit = 20) {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Récupère un artiste par son ID avec ses albums et chansons populaires
 * @param {string} artistId
 */
export async function getArtistById(artistId) {
  const { data, error } = await supabase
    .from('artists')
    .select(`
      *,
      albums (*),
      songs (
        id, title, duration, cover_url, plays, audio_url,
        albums (id, title, cover_url)
      )
    `)
    .eq('id', artistId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Récupère les artistes populaires (ceux qui ont le plus de chansons jouées)
 * @param {number} limit
 */
export async function getPopularArtists(limit = 10) {
  // Récupère les artistes triés par popularité via leurs chansons
  const { data, error } = await supabase
    .from('artists')
    .select(`
      *,
      songs (plays)
    `)
    .limit(limit);

  if (error) throw error;

  // Calcule le total de plays par artiste et trie
  return data
    ?.map((artist) => ({
      ...artist,
      totalPlays: artist.songs?.reduce((sum, s) => sum + (s.plays ?? 0), 0) ?? 0,
    }))
    .sort((a, b) => b.totalPlays - a.totalPlays)
    .map(({ songs: _songs, ...artist }) => artist); // Enlève le champ songs du résultat
}

/**
 * Récupère les albums d'un artiste
 * @param {string} artistId
 */
export async function getAlbumsByArtist(artistId) {
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('artist_id', artistId)
    .order('release_year', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Recherche des artistes par nom
 * @param {string} query
 * @param {number} limit
 */
export async function searchArtists(query, limit = 10) {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(limit);

  if (error) throw error;
  return data;
}