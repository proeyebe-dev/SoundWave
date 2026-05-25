import React, { createContext, useContext, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, 
  Volume2, VolumeX, Maximize2, ListMusic, Heart 
} from 'lucide-react';

// ============================================================================
// 1. STORE ZUSTAND (src/store/playerStore.js)
// ============================================================================

const mockTracks = [
  { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&q=80', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Stay', artist: 'Kid LAROI & Justin Bieber', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&q=80', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'Starboy', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150&q=80', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
];

const usePlayerStore = create((set, get) => ({
  playlist: mockTracks,
  currentTrackIndex: 0,
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  volume: 0.7,
  isMuted: false,
  isShuffle: false,
  isRepeat: false,

  // Actions
  setPlaying: (isPlaying) => set({ isPlaying }),
  setDuration: (duration) => set({ duration }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  setMuted: (isMuted) => set({ isMuted }),
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
  
  getCurrentTrack: () => get().playlist[get().currentTrackIndex],

  nextTrack: () => {
    const { playlist, currentTrackIndex, isShuffle } = get();
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      set({ currentTrackIndex: randomIndex, currentTime: 0 });
    } else {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      set({ currentTrackIndex: nextIndex, currentTime: 0 });
    }
  },

  prevTrack: () => {
    const { playlist, currentTrackIndex, currentTime } = get();
    // Si la chanson a commencé depuis plus de 3 secondes, on la redémarre
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return true; // Indique qu'on a juste reset le temps
    }
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    set({ currentTrackIndex: prevIndex, currentTime: 0 });
    return false;
  }
}));

// ============================================================================
// 2. HOOK PERSONNALISÉ (src/hooks/usePlayer.js)
// ============================================================================

// Utilisation d'un contexte pour garder une seule instance HTML5 Audio en mémoire
const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  return <AudioContext.Provider value={audioRef}>{children}</AudioContext.Provider>;
};

export const usePlayer = () => {
  const audioRef = useContext(AudioContext);
  if (!audioRef) throw new Error("usePlayer doit être utilisé au sein d'un AudioProvider");
  
  const audio = audioRef.current;
  const store = usePlayerStore();
  const currentTrack = store.getCurrentTrack();

  // Synchronisation de la source audio
  useEffect(() => {
    if (currentTrack) {
      audio.src = currentTrack.src;
      audio.load();
      if (store.isPlaying) {
        audio.play().catch(() => store.setPlaying(false));
      }
    }
  }, [store.currentTrackIndex]);

  // Gestion des événements Audio HTML5
  useEffect(() => {
    const handleTimeUpdate = () => store.setCurrentTime(audio.currentTime);
    const handleDurationChange = () => store.setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (store.isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        store.nextTrack();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [store.isRepeat, store.currentTrackIndex]);

  // Synchronisation Lecture / Pause
  useEffect(() => {
    if (store.isPlaying) {
      audio.play().catch(() => store.setPlaying(false));
    } else {
      audio.pause();
    }
  }, [store.isPlaying]);

  // Synchronisation Volume & Muet
  useEffect(() => {
    audio.volume = store.isMuted ? 0 : store.volume;
  }, [store.volume, store.isMuted]);

  const togglePlay = () => store.setPlaying(!store.isPlaying);
  
  const seek = (time) => {
    audio.currentTime = time;
    store.setCurrentTime(time);
  };

  const handlePrev = () => {
    const didReset = store.prevTrack();
    if (didReset && store.isPlaying) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  return {
    ...store,
    currentTrack,
    togglePlay,
    seek,
    handlePrev
  };
};

// ============================================================================
// 3. COMPOSANT PROGRESS BAR (src/components/player/ProgressBar.jsx)
// ============================================================================

const ProgressBar = () => {
  const { currentTime, duration, seek } = usePlayer();

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 w-full max-w-xl group">
      <span className="text-xs text-zinc-400 min-w-[35px] text-right">
        {formatTime(currentTime)}
      </span>
      
      <div className="relative flex items-center flex-1 h-3 cursor-pointer">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleProgressChange}
          className="absolute inset-0 w-full h-1 opacity-0 z-10 cursor-pointer"
        />
        {/* Track d'arrière-plan */}
        <div className="w-full h-1 bg-zinc-600 rounded-full overflow-hidden relative">
          {/* Remplissage de la progression */}
          <div 
            className="h-full bg-white group-hover:bg-green-500 transition-colors" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* Curseur (Thumb) visible uniquement au survol */}
        <div 
          className="absolute w-3 h-3 bg-white rounded-full shadow hidden group-hover:block pointer-events-none transform -translate-x-1/2"
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      <span className="text-xs text-zinc-400 min-w-[35px]">
        {formatTime(duration)}
      </span>
    </div>
  );
};

// ============================================================================
// 4. COMPOSANT VOLUME CONTROL (src/components/player/VolumeControl.jsx)
// ============================================================================

const VolumeControl = () => {
  const { volume, setVolume, isMuted, setMuted } = usePlayer();

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  const toggleMute = () => setMuted(!isMuted);

  const currentVolume = isMuted ? 0 : volume;

  return (
    <div className="flex items-center gap-2 w-[180px] group justify-end">
      <button 
        onClick={toggleMute}
        className="text-zinc-400 hover:text-white transition"
      >
        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      
      <div className="relative flex items-center w-24 h-3 cursor-pointer">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentVolume}
          onChange={handleVolumeChange}
          className="absolute inset-0 w-full h-1 opacity-0 z-10 cursor-pointer"
        />
        <div className="w-full h-1 bg-zinc-600 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-white group-hover:bg-green-500 transition-colors" 
            style={{ width: `${currentVolume * 100}%` }}
          />
        </div>
        <div 
          className="absolute w-3 h-3 bg-white rounded-full shadow hidden group-hover:block pointer-events-none transform -translate-x-1/2"
          style={{ left: `${currentVolume * 100}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// 5. COMPOSANT PRINCIPAL PLAYER BAR (src/components/player/PlayerBar.jsx)
// ============================================================================

export const PlayerBar = () => {
  const { 
    currentTrack, isPlaying, togglePlay, nextTrack, handlePrev,
    isShuffle, toggleShuffle, isRepeat, toggleRepeat 
  } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#181818] border-t border-zinc-800 px-4 flex items-center justify-between select-none z-50">
      
      {/* GAUCHE : Infos du morceau & Animation */}
      <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
        <div className="relative w-14 h-14 flex-shrink-0 group cursor-pointer overflow-hidden rounded-md shadow-lg">
          <img 
            src={currentTrack.cover} 
            alt={currentTrack.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'scale-105 animate-[pulse_3s_infinite]' : 'scale-100'
            }`} 
          />
        </div>
        <div className="overflow-hidden">
          <h4 className="text-sm text-white font-medium truncate hover:underline cursor-pointer">
            {currentTrack.title}
          </h4>
          <p className="text-xs text-zinc-400 truncate hover:underline cursor-pointer">
            {currentTrack.artist}
          </p>
        </div>
        <button className="text-zinc-400 hover:text-green-500 transition ml-2">
          <Heart size={18} />
        </button>
      </div>

      {/* MILIEU : Contrôles de lecture & Barre de progression */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-[40%]">
        {/* Boutons d'action */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleShuffle}
            className={`transition ${isShuffle ? 'text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'text-zinc-400 hover:text-white'}`}
          >
            <Shuffle size={18} />
          </button>
          
          <button onClick={handlePrev} className="text-zinc-400 hover:text-white transition">
            <SkipBack size={22} fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition transform active:scale-95"
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" className="ml-0" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          
          <button onClick={nextTrack} className="text-zinc-400 hover:text-white transition">
            <SkipForward size={22} fill="currentColor" />
          </button>
          
          <button 
            onClick={toggleRepeat}
            className={`transition ${isRepeat ? 'text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'text-zinc-400 hover:text-white'}`}
          >
            <Repeat size={18} />
          </button>
        </div>

        {/* Barre de progression cliquable */}
        <ProgressBar />
      </div>

      {/* DROITE : Options secondaires & Volume */}
      <div className="flex items-center gap-3 w-[30%] justify-end text-zinc-400">
        <button className="hover:text-white transition hidden md:block">
          <ListMusic size={18} />
        </button>
        <VolumeControl />
        <button className="hover:text-white transition hidden md:block ml-1">
          <Maximize2 size={16} />
        </button>
      </div>

    </div>
  );
};

// ============================================================================
// APP WRAPPER (Pour tester le rendu directement)
// ============================================================================

export default function App() {
  return (
    <AudioProvider>
      <div className="min-h-screen bg-zinc-900 text-white p-8 pb-32 font-sans selection:bg-green-500 selection:text-black">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Majestic Player</h1>
            <p className="text-zinc-400 text-sm mt-1">Sélectionnez ou écoutez vos titres préférés avec un contrôle fluide.</p>
          </header>
          
          <div className="bg-zinc-800/40 rounded-xl p-6 border border-zinc-800 backdrop-blur-md">
            <h3 className="text-lg font-semibold mb-4 text-zinc-200">File d'attente actuelle</h3>
            <TrackList />
          </div>
        </div>

        {/* La barre Spotify persistante */}
        <PlayerBar />
      </div>
    </AudioProvider>
  );
}

// Composant d'appoint pour visualiser et changer les morceaux à l'écran
const TrackList = () => {
  const { playlist, currentTrackIndex, setPlaying } = usePlayerStore();
  const currentTrack = playlist[currentTrackIndex];

  return (
    <div className="space-y-1">
      {playlist.map((track, index) => {
        const isCurrent = currentTrack.id === track.id;
        return (
          <div 
            key={track.id}
            onClick={() => {
              usePlayerStore.set({ currentTrackIndex: index });
              setPlaying(true);
            }}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition select-none ${
              isCurrent ? 'bg-zinc-700/50 text-green-400' : 'hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="w-4 text-center text-xs font-medium text-zinc-500">{index + 1}</span>
              <img src={track.cover} alt="" className="w-10 h-10 object-cover rounded" />
              <div>
                <p className={`text-sm font-medium ${isCurrent ? 'text-green-400' : 'text-white'}`}>{track.title}</p>
                <p className="text-xs text-zinc-400">{track.artist}</p>
              </div>
            </div>
            {isCurrent && <span className="text-xs uppercase tracking-wider font-semibold text-green-500 animate-pulse">Lecture</span>}
          </div>
        );
      })}
    </div>
  );
};