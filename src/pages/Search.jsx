import { useSearch } from '../hooks/useSearch'
import SearchBar from '../components/search/SearchBar'
import SearchResults from '../components/search/SearchResults'

const genres = [
  { name: 'Pop', color: '#8c67ab', emoji: '🎵' },
  { name: 'Hip-Hop', color: '#ba5d07', emoji: '🎤' },
  { name: 'Rock', color: '#e8115b', emoji: '🎸' },
  { name: 'Électro', color: '#1e3264', emoji: '⚡' },
  { name: 'R&B', color: '#477d95', emoji: '💿' },
  { name: 'Jazz', color: '#509bf5', emoji: '🎷' },
  { name: 'Classique', color: '#7d4b32', emoji: '🎻' },
  { name: 'Ambient', color: '#1a7340', emoji: '🌊' },
  { name: 'Afrobeats', color: '#e65100', emoji: '🥁' },
  { name: 'Rap', color: '#1b5e20', emoji: '🎧' },
]

export default function Search() {
  const { query, setQuery, results, loading } = useSearch()

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Rechercher</h1>
      <SearchBar query={query} setQuery={setQuery} />

      {query.trim() === '' ? (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Parcourir</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <div
                key={genre.name}
                onClick={() => setQuery(genre.name)}
                className="relative rounded-lg p-4 h-24 flex items-end font-bold text-sm cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                style={{ background: genre.color }}
              >
                <span className="absolute top-2 right-2 text-2xl opacity-70">{genre.emoji}</span>
                {genre.name}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <SearchResults results={results} loading={loading} />
      )}
    </div>
  )
}
