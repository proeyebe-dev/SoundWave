import { Music, User, Disc } from 'lucide-react'

function SongItem({ song }) {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer">
      <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center">
        {song.cover_url ? <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover rounded" /> : <Music size={16} className="text-zinc-400" />}
      </div>
      <div>
        <p className="text-white text-sm font-medium">{song.title}</p>
        <p className="text-zinc-400 text-xs">{song.artists?.name}</p>
      </div>
    </div>
  )
}

function ArtistItem({ artist }) {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer">
      <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
        {artist.image_url ? <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover rounded-full" /> : <User size={16} className="text-zinc-400" />}
      </div>
      <div>
        <p className="text-white text-sm font-medium">{artist.name}</p>
        <p className="text-zinc-400 text-xs">Artiste</p>
      </div>
    </div>
  )
}

function AlbumItem({ album }) {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer">
      <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center">
        {album.cover_url ? <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover rounded" /> : <Disc size={16} className="text-zinc-400" />}
      </div>
      <div>
        <p className="text-white text-sm font-medium">{album.title}</p>
        <p className="text-zinc-400 text-xs">{album.artists?.name}</p>
      </div>
    </div>
  )
}

export default function SearchResults({ results, loading }) {
  if (loading) return <p className="text-zinc-400 text-center py-8">Recherche en cours...</p>

  const isEmpty = results.songs.length === 0 && results.artists.length === 0 && results.albums.length === 0

  if (isEmpty) return null

  return (
    <div className="space-y-6 mt-6">
      {results.songs.length > 0 && (
        <div>
          <h3 className="text-white font-bold mb-3">Chansons</h3>
          <div className="space-y-1">
            {results.songs.map(song => <SongItem key={song.id} song={song} />)}
          </div>
        </div>
      )}
      {results.artists.length > 0 && (
        <div>
          <h3 className="text-white font-bold mb-3">Artistes</h3>
          <div className="space-y-1">
            {results.artists.map(artist => <ArtistItem key={artist.id} artist={artist} />)}
          </div>
        </div>
      )}
      {results.albums.length > 0 && (
        <div>
          <h3 className="text-white font-bold mb-3">Albums</h3>
          <div className="space-y-1">
            {results.albums.map(album => <AlbumItem key={album.id} album={album} />)}
          </div>
        </div>
      )}
    </div>
  )
}
