import { useState, useEffect, useRef } from 'react'
import { Music, User, Play } from 'lucide-react'
import { getPopularSongs, getRecentSongs, getAllArtists, getAllAlbums } from '../services/songsService'
import usePlayerStore from '../store/playerStore'

function SongCard({ song }) {
  const { playSong, setQueue } = usePlayerStore()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex-shrink-0 w-40 cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => playSong(song)}
    >
      <div className="relative w-40 h-40 bg-zinc-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {song.cover_url
          ? <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
          : <Music size={32} className="text-zinc-400" />}
        {hovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Play size={18} className="text-black fill-black" />
            </div>
          </div>
        )}
      </div>
      <p className="text-white text-sm font-medium truncate">{song.title}</p>
      <p className="text-zinc-400 text-xs truncate">{song.artists?.name}</p>
    </div>
  )
}

function AlbumCard({ album }) {
  return (
    <div className="flex-shrink-0 w-40 cursor-pointer group">
      <div className="w-40 h-40 bg-zinc-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden group-hover:opacity-80 transition">
        {album.cover_url
          ? <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
          : <Music size={32} className="text-zinc-400" />}
      </div>
      <p className="text-white text-sm font-medium truncate">{album.title}</p>
      <p className="text-zinc-400 text-xs truncate">{album.artists?.name} · {album.release_year}</p>
    </div>
  )
}

function ArtistCard({ artist }) {
  return (
    <div className="flex-shrink-0 w-40 cursor-pointer group text-center">
      <div className="w-40 h-40 bg-zinc-700 rounded-full mb-3 flex items-center justify-center overflow-hidden group-hover:opacity-80 transition mx-auto">
        {artist.image_url
          ? <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
          : <User size={32} className="text-zinc-400" />}
      </div>
      <p className="text-white text-sm font-medium truncate">{artist.name}</p>
      <p className="text-zinc-400 text-xs">Artiste</p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {children}
      </div>
    </div>
  )
}

function LoadingSection() {
  return (
    <div className="flex gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-40">
          <div className="w-40 h-40 bg-zinc-800 rounded-lg mb-3 animate-pulse" />
          <div className="h-3 bg-zinc-800 rounded animate-pulse mb-2" />
          <div className="h-3 bg-zinc-800 rounded animate-pulse w-2/3" />
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const [popularSongs, setPopularSongs] = useState([])
  const [recentSongs, setRecentSongs] = useState([])
  const [artists, setArtists] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const { setQueue } = usePlayerStore()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [songs, recent, arts, albs] = await Promise.all([
          getPopularSongs(),
          getRecentSongs(),
          getAllArtists(),
          getAllAlbums(),
        ])
        setPopularSongs(songs)
        setRecentSongs(recent)
        setArtists(arts)
        setAlbums(albs)
        setQueue(songs)
      } catch (error) {
        console.error('Erreur chargement home:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-8">{greeting()}</h1>
      <Section title="🔥 Tendances">
        {loading ? <LoadingSection /> : popularSongs.map(song => <SongCard key={song.id} song={song} />)}
      </Section>
      <Section title="🆕 Nouveautés">
        {loading ? <LoadingSection /> : recentSongs.map(song => <SongCard key={song.id} song={song} />)}
      </Section>
      <Section title="🎤 Artistes populaires">
        {loading ? <LoadingSection /> : artists.map(artist => <ArtistCard key={artist.id} artist={artist} />)}
      </Section>
      <Section title="💿 Albums">
        {loading ? <LoadingSection /> : albums.map(album => <AlbumCard key={album.id} album={album} />)}
      </Section>
    </div>
  )
}
