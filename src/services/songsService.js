import { supabase } from './supabase'

export async function getPopularSongs() {
  const { data, error } = await supabase
    .from('songs')
    .select('*, artists(name)')
    .order('plays', { ascending: false })
    .limit(10)
  if (error) throw error
  return data
}

export async function getRecentSongs() {
  const { data, error } = await supabase
    .from('songs')
    .select('*, artists(name)')
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) throw error
  return data
}

export async function getAllArtists() {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .limit(10)
  if (error) throw error
  return data
}

export async function getAllAlbums() {
  const { data, error } = await supabase
    .from('albums')
    .select('*, artists(name)')
    .limit(10)
  if (error) throw error
  return data
}
