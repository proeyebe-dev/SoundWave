import { useRef } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'
import MobileNav from '../sidebar/MobileNav'
import Header from './Header'
import PlayerBar from '../player/PlayerBar'
import usePlayerStore from '../../store/playerStore'

export default function MainLayout() {
  const { setCurrentTime } = usePlayerStore()

  function handleSeek(time) {
    setCurrentTime(time)
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 shrink-0">
        <Sidebar />
      </aside>
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-20">
          <Outlet />
        </main>
      </div>
      <PlayerBar onSeek={handleSeek} />
      <MobileNav />
    </div>
  )
}
