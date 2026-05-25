import { create } from 'zustand'

const usePlayerStore = create((set) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  isShuffle: false,
  isRepeat: false,
  queue: [],

  playSong: (song) => set({ currentSong: song, isPlaying: true, currentTime: 0 }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
  setQueue: (songs) => set({ queue: songs }),
  nextSong: () => set((state) => {
    if (!state.queue.length) return {}
    const idx = state.queue.findIndex(s => s.id === state.currentSong?.id)
    if (state.isShuffle) {
      const randomIdx = Math.floor(Math.random() * state.queue.length)
      return { currentSong: state.queue[randomIdx], currentTime: 0, isPlaying: true }
    }
    const next = state.queue[idx + 1] || state.queue[0]
    return { currentSong: next, currentTime: 0, isPlaying: true }
  }),
  prevSong: () => set((state) => {
    if (!state.queue.length) return {}
    const idx = state.queue.findIndex(s => s.id === state.currentSong?.id)
    const prev = state.queue[idx - 1] || state.queue[state.queue.length - 1]
    return { currentSong: prev, currentTime: 0, isPlaying: true }
  }),
}))

export default usePlayerStore