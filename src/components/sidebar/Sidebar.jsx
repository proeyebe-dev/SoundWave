import { NavLink, useNavigate } from 'react-router-dom'

// Icônes SVG inline
function HomeIcon({ filled }) {
  return filled ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function SearchIcon({ filled }) {
  return filled ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function LibraryIcon({ filled }) {
  return filled ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  )
}

function MusicNoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  )
}

const navItems = [
  { to: '/', label: 'Accueil', icon: HomeIcon },
  { to: '/search', label: 'Recherche', icon: SearchIcon },
  { to: '/library', label: 'Ma bibliothèque', icon: LibraryIcon },
]

// Playlists factices en attendant le Membre 7
const fakePlaylists = [
  { id: '1', name: 'Mes favoris' },
  { id: '2', name: 'Workout Mix' },
  { id: '3', name: 'Chill Vibes' },
  { id: '4', name: 'Afrobeats 2026' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/5 py-4">

      {/* Logo */}
      <div className="px-6 mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-1">
          <span className="text-[#1db954] font-black text-2xl tracking-tighter">SOUND</span>
          <span className="text-white font-black text-2xl tracking-tighter">WAVE</span>
        </button>
      </div>

      {/* Navigation principale */}
      <nav className="px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon filled={isActive} />
                <span className="font-semibold text-sm">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Séparateur */}
      <hr className="border-white/10 mx-4 my-4" />

      {/* Section playlists */}
      <div className="flex-1 overflow-y-auto px-3">
        <p className="px-3 mb-3 text-xs font-bold text-white/30 uppercase tracking-widest">
          Playlists
        </p>

        <div className="space-y-0.5">
          {fakePlaylists.map((pl) => (
            <NavLink
              key={pl.id}
              to={`/playlist/${pl.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`
              }
            >
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                <MusicNoteIcon />
              </div>
              <span className="text-sm truncate">{pl.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Profil en bas */}
      <div className="px-3 mt-4">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold">Mon profil</span>
        </NavLink>
      </div>
    </div>
  )
}