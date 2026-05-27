import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, ChevronDown, ChevronUp } from 'lucide-react'

const TRACKS = {
  lofi: [
    { id: 'l1', title: 'Lofi Chill', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
    { id: 'l2', title: 'Coffee Break', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_270f29b94e.mp3' },
    { id: 'l3', title: 'Study Beats', url: 'https://cdn.pixabay.com/audio/2021/11/25/audio_9b82d0cd9e.mp3' },
  ],
  rain: [
    { id: 'r1', title: 'Rain on Window', url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_946c1b5789.mp3' },
    { id: 'r2', title: 'Thunderstorm', url: 'https://cdn.pixabay.com/audio/2021/09/06/audio_9a7d06a79e.mp3' },
  ],
  noise: [
    { id: 'n1', title: 'White Noise', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_647c9aabb3.mp3' },
    { id: 'n2', title: 'Brown Noise', url: 'https://cdn.pixabay.com/audio/2021/10/19/audio_5c5e99c534.mp3' },
  ],
  cafe: [
    { id: 'c1', title: 'Café Ambience', url: 'https://cdn.pixabay.com/audio/2022/03/09/audio_b47af50d17.mp3' },
  ],
  nature: [
    { id: 'na1', title: 'Forest', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_71c9bb8e93.mp3' },
    { id: 'na2', title: 'Ocean Waves', url: 'https://cdn.pixabay.com/audio/2022/01/13/audio_db3a4cb0f3.mp3' },
  ],
}

const CATEGORIES = [
  { key: 'lofi', label: 'Lofi', icon: '🎵' },
  { key: 'rain', label: 'Rain', icon: '🌧' },
  { key: 'noise', label: 'Noise', icon: '〰️' },
  { key: 'cafe', label: 'Café', icon: '☕' },
  { key: 'nature', label: 'Nature', icon: '🌿' },
]

function Waveform({ isPlaying }) {
  return (
    <div className="flex items-end gap-0.5 h-6">
      {[3, 5, 4, 6, 3, 5, 4, 3].map((h, i) => (
        <div
          key={i}
          className="w-1 bg-accent-teal rounded-full"
          style={{
            height: isPlaying ? `${h * 4}px` : '4px',
            animation: isPlaying ? `wave ${0.8 + i * 0.1}s ease-in-out infinite alternate` : 'none',
            transition: 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}

export default function FloatingMusicPlayer() {
  const location = useLocation()
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('music_volume') || 60))
  const [category, setCategory] = useState(() => localStorage.getItem('music_category') || 'lofi')
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const audioRef = useRef(null)

  if (location.pathname === '/session/active') return null

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume / 100
  }, [volume])

  useEffect(() => {
    if (!audioRef.current) return
    isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause()
  }, [isPlaying])

  useEffect(() => {
    localStorage.setItem('music_volume', String(volume))
  }, [volume])

  function changeCategory(cat) {
    setCategory(cat)
    setTrackIndex(0)
    setIsPlaying(false)
    localStorage.setItem('music_category', cat)
  }

  function nextTrack() {
    const tracks = TRACKS[category]
    setTrackIndex(i => (i + 1) % tracks.length)
  }

  function prevTrack() {
    const tracks = TRACKS[category]
    setTrackIndex(i => (i - 1 + tracks.length) % tracks.length)
  }

  function shuffle() {
    const tracks = TRACKS[category]
    setTrackIndex(Math.floor(Math.random() * tracks.length))
  }

  const currentTrack = TRACKS[category][trackIndex]

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={nextTrack}
      />

      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-bg-surface border border-white/10 rounded-2xl p-5 w-72 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-text-primary">Study Music</span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <ChevronDown size={18} />
                </button>
              </div>

              <div className="flex justify-center mb-3">
                <Waveform isPlaying={isPlaying} />
              </div>

              <p className="text-sm font-semibold text-text-primary text-center mb-4 truncate">
                {currentTrack.title}
              </p>

              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={prevTrack}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <SkipBack size={18} />
                </button>
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  className="w-10 h-10 rounded-full bg-accent-teal flex items-center justify-center hover:bg-accent-teal/80 transition-colors"
                >
                  {isPlaying ? <Pause size={18} className="text-bg-base" /> : <Play size={18} className="text-bg-base" />}
                </button>
                <button
                  onClick={nextTrack}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <SkipForward size={18} />
                </button>
                <button
                  onClick={shuffle}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <Shuffle size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Volume2 size={14} className="text-text-muted flex-shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="w-full h-1 appearance-none rounded-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #14B8A6 ${volume}%, #3F3F46 ${volume}%)`,
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => changeCategory(cat.key)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      category === cat.key
                        ? 'bg-accent-teal/20 border-accent-teal/40 text-accent-teal'
                        : 'bg-white/5 border-white/10 text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-bg-surface border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 cursor-pointer shadow-lg"
              onClick={() => setIsExpanded(true)}
            >
              <Waveform isPlaying={isPlaying} />
              <span className="text-xs text-text-secondary max-w-[100px] truncate">{currentTrack.title}</span>
              <button
                onClick={e => { e.stopPropagation(); setIsPlaying(p => !p) }}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <ChevronUp size={14} className="text-text-muted" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
