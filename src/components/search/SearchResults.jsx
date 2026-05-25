import { Music, User, Play } from 'lucide-react'

function SongItem({ song, index }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 rounded-md hover:bg-zinc-800 group transition cursor-pointer">
      <span className="w-6 text-right text-sm text-zinc-400 group-hover:hidden">{index + 1}</span>
      <Play size={14} className="hidden group-hover:block text-white" />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{song.title}</p>
        <p className="text-zinc-400 text-xs truncate">{song.artists?.name}</p>
      </div>
      <span className="text-zinc-400 text-xs">
        {song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}` : '--:--'}
      </span>
    </div>
  )
}

function ArtistItem({ artist }) {
  return (
    <div className="flex-shrink-0 w-36 cursor-pointer group text-center">
      <div className="w-36 h-36 rounded-full mx-auto mb-3 bg-zinc-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition overflow-hidden">
        {artist.image_url
          ? <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
          : <User size={40} className="text-zinc-400" />}
      </div>
      <p className="text-white text-sm font-medium truncate">{artist.name}</p>
      <p className="text-zinc-400 text-xs">Artiste</p>
    </div>
  )
}

function AlbumItem({ album }) {
  return (
    <div className="cursor-pointer group">
      <div className="aspect-square rounded-lg mb-3 bg-zinc-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition overflow-hidden">
        {album.cover_url
          ? <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
          : <Music size={32} className="text-zinc-400" />}
      </div>
      <p className="text-white text-sm font-medium truncate">{album.title}</p>
      <p className="text-zinc-400 text-xs truncate">{album.release_year} · {album.artists?.name}</p>
    </div>
  )
}

export default function SearchResults({ results, loading }) {
  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <p className="text-zinc-400">Recherche en cours...</p>
    </div>
  )

  const isEmpty = results.songs.length === 0 && results.artists.length === 0 && results.albums.length === 0

  if (isEmpty) return (
    <div className="text-center py-16 text-zinc-400">
      <p className="text-lg">Aucun résultat trouvé</p>
    </div>
  )

  return (
    <div className="space-y-8 mt-6">
      {results.artists.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Artistes</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {results.artists.map(artist => <ArtistItem key={artist.id} artist={artist} />)}
          </div>
        </div>
      )}
      {results.albums.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.albums.map(album => <AlbumItem key={album.id} album={album} />)}
          </div>
        </div>
      )}
      {results.songs.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Titres</h2>
          <div className="flex flex-col">
            {results.songs.map((song, index) => <SongItem key={song.id} song={song} index={index + 1} />)}
          </div>
        </div>
      )}
    </div>
  )
}
