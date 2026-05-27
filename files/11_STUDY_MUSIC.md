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
- User-uploaded tracks
- Lyrics display
- Sleep timer
- Collaborative room music (everyone hears same track)
- Downloading tracks

---

## Spotify Integration — Decision & Alternative

### Why the Spotify Web Playback SDK is NOT viable

Spotify's Web Playback SDK has a hard platform restriction: **the user must have an active Spotify Premium subscription**. There is no free tier, no workaround, and no way to play full tracks for free users. This eliminates most casual users of a study app.

### Alternative: Spotify Playlist Embed (Recommended)

Spotify exposes an official embed iframe that works for **all users** — free and Premium — with no OAuth, no SDK, no API key:

```html
<iframe
  src="https://open.spotify.com/embed/playlist/{playlistId}?utm_source=generator&theme=0"
  width="100%"
  height="152"
  frameBorder="0"
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="lazy"
/>
```

This shows a Spotify mini-player with album art, track title, and play/pause. The user must have Spotify open (app or web) but does not need Premium for basic playback on Spotify's own player.

### Planned feature: "Your Playlist" tab in music player

Add a 6th tab to `FloatingMusicPlayer` alongside Lofi/Rain/Noise/Café/Nature:

```
[Lofi] [Rain] [Noise] [Café] [Nature] [My Playlist 🎵]
```

In the "My Playlist" tab:
- Input field: paste any Spotify playlist/album/track URL
- App extracts the Spotify URI (`spotify.com/{type}/{id}`)
- Renders the Spotify embed iframe
- URL saved to `localStorage` so it persists across sessions
- If no URL entered: shows a placeholder with "Paste a Spotify, YouTube, or SoundCloud link"

This approach supports any embeddable music service (YouTube, SoundCloud, Spotify) with zero backend, zero API keys, and zero Premium requirement.

**Phase 3 — add after core music player is stable.**
