import { supabase } from './supabase';

/**
 * Récupère les chansons tendances (les plus jouées)
 * @param {number} limit - Nombre de chansons à récupérer
 */
export async function getTrendingSongs(limit = 10) {
  const { data, error } = await supabase
    .from('songs')
    .select(`
      *,
      artists (id, name, image_url),
      albums (id, title, cover_url)
    `)
    .order('plays', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Récupère les chansons récemment ajoutées
 * @param {number} limit
 */
export async function getNewSongs(limit = 10) {
  const { data, error } = await supabase
    .from('songs')
    .select(`
      *,
      artists (id, name, image_url),
      albums (id, title, cover_url)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Récupère des chansons recommandées (aléatoires pour la démo)
 * En production : basé sur l'historique de l'utilisateur
 * @param {number} limit
 */
export async function getRecommendedSongs(limit = 10) {
  // Pour l'instant on récupère des chansons aléatoires
  // TODO: implémenter un vrai algorithme de recommandation
  const { data, error } = await supabase
    .from('songs')
    .select(`
      *,
      artists (id, name, image_url),
      albums (id, title, cover_url)
    `)
    .limit(limit);

  if (error) throw error;

  // Mélange côté client pour simuler des recommandations
  return data?.sort(() => Math.random() - 0.5) ?? [];
}

/**
 * Récupère une chanson par son ID
 * @param {string} songId
 */
export async function getSongById(songId) {
  const { data, error } = await supabase
    .from('songs')
    .select(`
      *,
      artists (id, name, image_url),
      albums (id, title, cover_url)
    `)
    .eq('id', songId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Incrémente le compteur de lectures d'une chanson
 * @param {string} songId
 */
export async function incrementPlays(songId) {
  const { error } = await supabase.rpc('increment_plays', { song_id: songId });
  if (error) {
    // Fallback si la fonction RPC n'existe pas encore
    console.warn('increment_plays RPC non disponible:', error.message);
  }
}

/**
 * Recherche des chansons par titre
 * @param {string} query
 * @param {number} limit
 */
export async function searchSongs(query, limit = 10) {
  const { data, error } = await supabase
    .from('songs')
    .select(`
      *,
      artists (id, name, image_url),
      albums (id, title, cover_url)
    `)
    .ilike('title', `%${query}%`)
    .limit(limit);

  if (error) throw error;
  return data;
}