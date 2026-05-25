import usePlayerStore from '../../store/playerStore'
import ProgressBar from './ProgressBar'
import VolumeControl from './VolumeControl'
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat } from 'lucide-react'

export default function PlayerBar({ onSeek }) {
  const {
    currentSong, isPlaying, isShuffle, isRepeat,
    togglePlay, toggleShuffle, toggleRepeat, nextSong, prevSong,
  } = usePlayerStore()

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 z-50 transition-transform duration-300 ${
      currentSong ? 'translate-y-0' : 'translate-y-full'
    }`}>
      {currentSong && (
        <div className="grid grid-cols-3 items-center px-4 py-3 gap-4">

          {/* Info chanson */}
          <div className="flex items-center gap-3">
            <img
              src={currentSong.cover_url || '/placeholder.jpg'}
              alt={currentSong.title}
              className="w-12 h-12 rounded-md object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
              <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Contrôles centraux */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                aria-label="Aléatoire"
                className={`transition-colors ${isShuffle ? 'text-pink-500' : 'text-gray-500 hover:text-white'}`}
              >
                <Shuffle size={18} />
              </button>
              <button
                onClick={prevSong}
                aria-label="Précédent"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipBack size={18} />
              </button>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Lecture'}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors text-black"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={nextSong}
                aria-label="Suivant"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipForward size={18} />
              </button>
              <button
                onClick={toggleRepeat}
                aria-label="Répéter"
                className={`transition-colors ${isRepeat ? 'text-pink-500' : 'text-gray-500 hover:text-white'}`}
              >
                <Repeat size={18} />
              </button>
            </div>
            <ProgressBar onSeek={onSeek} />
          </div>

          {/* Volume */}
          <div className="flex justify-end">
            <VolumeControl />
          </div>

        </div>
      )}
    </div>
  )
}