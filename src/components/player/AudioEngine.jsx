import { useEffect, useRef } from 'react'
import usePlayerStore from '../../store/playerStore'

export default function AudioEngine() {
  const audioRef = useRef(new Audio())
  const {
    currentSong, isPlaying, volume, isRepeat,
    setCurrentTime, setDuration, nextSong,
  } = usePlayerStore()

  useEffect(() => {
    const audio = audioRef.current
    audio.src = currentSong?.audio_url || ''
    if (currentSong?.audio_url) {
      audio.play().catch(() => {})
    }
  }, [currentSong])

  useEffect(() => {
    const audio = audioRef.current
    if (isPlaying) audio.play().catch(() => {})
    else audio.pause()
  }, [isPlaying])

  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDuration = () => setDuration(audio.duration)
    const onEnded = () => isRepeat ? audio.play() : nextSong()
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onDuration)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onDuration)
      audio.removeEventListener('ended', onEnded)
    }
  }, [isRepeat])

  return null
}
