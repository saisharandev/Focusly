import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, ChevronDown, ChevronUp, Link } from 'lucide-react'

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
  { key: 'lofi',   label: 'Lofi',   icon: '🎵' },
  { key: 'rain',   label: 'Rain',   icon: '🌧' },
  { key: 'noise',  label: 'Noise',  icon: '〰️' },
  { key: 'cafe',   label: 'Café',   icon: '☕' },
  { key: 'nature', label: 'Nature', icon: '🌿' },
]

// Extract Spotify embed URL from a playlist/album/track URL or URI
function parseSpotifyUrl(input) {
  if (!input) return null
  input = input.trim()

  // Handle spotify:playlist:ID or spotify:album:ID or spotify:track:ID
  const uriMatch = input.match(/^spotify:(playlist|album|track):([A-Za-z0-9]+)$/)
  if (uriMatch) return `https://open.spotify.com/embed/${uriMatch[1]}/${uriMatch[2]}?utm_source=generator&theme=0`

  // Handle https://open.spotify.com/playlist/ID or /album/ID or /track/ID
  const urlMatch = input.match(/open\.spotify\.com\/(playlist|album|track)\/([A-Za-z0-9]+)/)
  if (urlMatch) return `https://open.spotify.com/embed/${urlMatch[1]}/${urlMatch[2]}?utm_source=generator&theme=0`

  return null
}

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
  const [spotifyMode, setSpotifyMode] = useState(() => localStorage.getItem('music_spotify_mode') === 'true')
  const [spotifyInput, setSpotifyInput] = useState(() => localStorage.getItem('music_spotify_url') || '')
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState(() => parseSpotifyUrl(localStorage.getItem('music_spotify_url') || ''))
  const [spotifyError, setSpotifyError] = useState('')
  const audioRef = useRef(null)

  if (location.pathname === '/session/active') return null

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume / 100
  }, [volume])

  useEffect(() => {
    if (!audioRef.current) return
    // Pause ambient audio when in Spotify mode
    if (spotifyMode) { audioRef.current.pause(); return }
    isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause()
  }, [isPlaying, spotifyMode])

  useEffect(() => {
    localStorage.setItem('music_volume', String(volume))
  }, [volume])

  function changeCategory(cat) {
    setCategory(cat)
    setTrackIndex(0)
    setIsPlaying(false)
    setSpotifyMode(false)
    localStorage.setItem('music_category', cat)
    localStorage.setItem('music_spotify_mode', 'false')
  }

  function enableSpotifyMode() {
    setSpotifyMode(true)
    setIsPlaying(false)
    localStorage.setItem('music_spotify_mode', 'true')
  }

  function handleSpotifySubmit(e) {
    e.preventDefault()
    const url = parseSpotifyUrl(spotifyInput)
    if (!url) {
      setSpotifyError('Paste a valid Spotify playlist, album, or track URL')
      return
    }
    setSpotifyError('')
    setSpotifyEmbedUrl(url)
    localStorage.setItem('music_spotify_url', spotifyInput)
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
      <audio ref={audioRef} src={currentTrack.url} onEnded={nextTrack} />

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

              {spotifyMode ? (
                /* Spotify mode — show iframe embed */
                <div className="space-y-3">
                  {spotifyEmbedUrl ? (
                    <iframe
                      src={spotifyEmbedUrl}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-20 text-text-muted text-xs text-center">
                      Paste a Spotify URL below to load your playlist
                    </div>
                  )}

                  <form onSubmit={handleSpotifySubmit} className="space-y-2">
                    <input
                      type="text"
                      value={spotifyInput}
                      onChange={e => { setSpotifyInput(e.target.value); setSpotifyError('') }}
                      placeholder="https://open.spotify.com/playlist/..."
                      className="w-full bg-bg-card border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-teal/50"
                    />
                    {spotifyError && <p className="text-xs text-accent-red">{spotifyError}</p>}
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-accent-teal/10 border border-accent-teal/30 text-accent-teal text-xs font-medium hover:bg-accent-teal/20 transition-colors"
                    >
                      Load Playlist
                    </button>
                  </form>
                </div>
              ) : (
                /* Ambient mode — existing controls */
                <>
                  <div className="flex justify-center mb-3">
                    <Waveform isPlaying={isPlaying} />
                  </div>

                  <p className="text-sm font-semibold text-text-primary text-center mb-4 truncate">
                    {currentTrack.title}
                  </p>

                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button onClick={prevTrack} className="text-text-muted hover:text-text-primary transition-colors">
                      <SkipBack size={18} />
                    </button>
                    <button
                      onClick={() => setIsPlaying(p => !p)}
                      className="w-10 h-10 rounded-full bg-accent-teal flex items-center justify-center hover:bg-accent-teal/80 transition-colors"
                    >
                      {isPlaying ? <Pause size={18} className="text-bg-base" /> : <Play size={18} className="text-bg-base" />}
                    </button>
                    <button onClick={nextTrack} className="text-text-muted hover:text-text-primary transition-colors">
                      <SkipForward size={18} />
                    </button>
                    <button onClick={shuffle} className="text-text-muted hover:text-text-primary transition-colors">
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
                      style={{ background: `linear-gradient(to right, #14B8A6 ${volume}%, #3F3F46 ${volume}%)` }}
                    />
                  </div>
                </>
              )}

              {/* Category tabs — always visible */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => changeCategory(cat.key)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      !spotifyMode && category === cat.key
                        ? 'bg-accent-teal/20 border-accent-teal/40 text-accent-teal'
                        : 'bg-white/5 border-white/10 text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
                <button
                  onClick={enableSpotifyMode}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${
                    spotifyMode
                      ? 'bg-green-500/20 border-green-500/40 text-green-400'
                      : 'bg-white/5 border-white/10 text-text-muted hover:text-text-primary'
                  }`}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Spotify
                </button>
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
              {spotifyMode ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              ) : (
                <Waveform isPlaying={isPlaying} />
              )}
              <span className="text-xs text-text-secondary max-w-[100px] truncate">
                {spotifyMode ? 'Spotify' : currentTrack.title}
              </span>
              {!spotifyMode && (
                <button
                  onClick={e => { e.stopPropagation(); setIsPlaying(p => !p) }}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
              )}
              <ChevronUp size={14} className="text-text-muted" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
