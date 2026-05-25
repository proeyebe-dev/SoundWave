import { useSearch } from '../hooks/useSearch'
import SearchBar from '../components/search/SearchBar'
import SearchResults from '../components/search/SearchResults'

export default function Search() {
  const { query, setQuery, results, loading } = useSearch()

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Rechercher</h1>
      <SearchBar query={query} setQuery={setQuery} />
      {query.trim() === '' ? (
        <div className="mt-10 text-center text-zinc-400">
          <p className="text-lg">Recherchez vos artistes, chansons ou albums préférés</p>
        </div>
      ) : (
        <SearchResults results={results} loading={loading} />
      )}
    </div>
  )
}
