# PRD 11 — Study Music Player

**Phase:** 3  
**Displayed as:** Floating mini-player (bottom of screen, all pages)  
**No dedicated page.**

---

## Problem
Context-switching out of the app to open Spotify or a YouTube lofi stream breaks the flow. A built-in ambient audio player keeps users in Focusly.

---

## User Stories
- As a user, I want to play lofi or ambient sounds while studying without leaving the app.
- As a user, I want to control volume from a small player that stays visible.
- As a user, I want the music to not interrupt my focus — it should be set-and-forget.

---

## Track List (Static — No Streaming License Needed)

Use royalty-free tracks. Source: Pixabay, Free Music Archive, or self-hosted.

| Category | Tracks (3–5 each) |
|----------|-------------------|
| Lofi Hip-Hop | Chill beats, no lyrics |
| Rain + Thunder | Rain on window, thunderstorm |
| White Noise | Pure white, brown noise |
| Café Ambience | Coffeehouse background |
| Nature | Forest, ocean waves |

All audio files: MP3, hosted in `/public/audio/` in the React app.  
**No external API calls. No licensing issues.**

---

## Player Component — `<FloatingMusicPlayer />`

### States
- **Collapsed:** Small floating pill in bottom-right. Shows current track icon + play/pause button.
- **Expanded:** Taller card with track list, volume slider, visualizer.

### Collapsed View
```
[ 🎵 Lofi Chill  ▶  🔊 ]
```
Click anywhere on pill → expand.

### Expanded View
```
┌──────────────────────────┐
│ 🎵 Study Music           │
│                          │
│  [Animated Waveform]     │
│  "Lofi Chill Beat #2"    │
│                          │
│  ⏮  ⏸  ⏭  🔀           │
│  ───────────●──  70%     │
│                          │
│  Categories:             │
│  [Lofi] [Rain] [Noise]   │
│  [Café] [Nature]         │
└──────────────────────────┘
```

### Controls
- Play / Pause
- Next track (within category)
- Shuffle within category
- Volume slider
- Category tabs

### Animated Waveform
- CSS animation — simple bars that pulse at varying heights
- Pure CSS, no canvas needed
- Only animates when playing

---

## Implementation

```js
// Use HTML5 Audio API directly — no library needed
const audio = new Audio('/audio/lofi/track-01.mp3');
audio.loop = false;

// On track end → play next in category
audio.addEventListener('ended', playNext);
```

**Persist volume and last-played category** in `localStorage` — survives page navigation.

---

## Player Visibility Rules
- Visible on all pages **except** the active session screen (session has its own ambient audio controls or none at all — don't distract)
- Persists across navigation — music doesn't stop when user changes pages

---

## Out of Scope
- Spotify / Apple Music integration
- User-uploaded tracks
- Lyrics display
- Sleep timer
- Collaborative room music (everyone hears same track)
- Downloading tracks
