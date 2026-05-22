import { Outlet } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'
import MobileNav from '../sidebar/MobileNav'
import Header from './Header'

// PlayerBar sera implementé par le Membre 4
// On réserve l'espace en bas (h-20)
function PlayerBarPlaceholder() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#181818] border-t border-white/10 flex items-center px-4 z-50">
      <p className="text-white/30 text-sm italic">
        Lecteur musical — Membre 4
      </p>
    </div>
  )
}

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">

      {/* Sidebar desktop (masquée sur mobile) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0">
        <Sidebar />
      </aside>

      {/* Zone principale */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <Header />

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-20">
          <Outlet />
        </main>
      </div>

      {/* Player bar en bas */}
      <PlayerBarPlaceholder />

      {/* Navigation mobile (visible uniquement sur mobile) */}
      <MobileNav />
    </div>
  )
}