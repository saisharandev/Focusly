# PRD 13 — Video in Study Rooms

**Phase:** 3  
**Route:** `/rooms/:id` (existing page, opt-in feature)  
**Cost:** Free (STUN: Google servers, TURN: OpenRelay 20GB/month free)  
**Depends on:** Group Rooms (Phase 1), stable Socket.IO signaling

---

## Problem
Group study rooms currently have no audio/video — members can only see each other's focus status dots and chat via text. Real-time video makes virtual co-working feel like a real library or café, significantly increasing accountability and motivation.

---

## User Stories
- As a user, I want to see my study partners' faces while studying so it feels like we're actually together.
- As a user, I want to toggle my camera and microphone independently.
- As a user, I want to opt out of video and continue with text-only if I prefer privacy.
- As a host, I want to control whether video is allowed in my room.

---

## Architecture Decision: Mesh P2P

For rooms with ≤4 participants (which is Focusly's current cap), peer-to-peer mesh is sufficient and requires zero additional backend infrastructure:

```
User A ←→ User B
User A ←→ User C  
User B ←→ User C
```

Each peer maintains N-1 RTCPeerConnection objects. At 4 participants, each person sends 3 streams and receives 3 streams. This is acceptable at 360p video (~300kbps per stream).

**When to switch to SFU:** If room cap increases beyond 6, migrate to LiveKit (self-hosted, Apache 2.0 license).

---

## Server Infrastructure (Free Tier)

### STUN (NAT Traversal)
```
stun:stun.l.google.com:19302
stun:stun1.l.google.com:19302
```
Free, no account needed, used by millions of apps in production.

### TURN (Relay — needed for ~15-20% of users behind symmetric NAT)
```
turn:openrelay.metered.ca:80
turn:openrelay.metered.ca:443
turn:openrelay.metered.ca:80?transport=tcp
```
Free tier: 20 GB/month. At 360p (~300kbps), that's ~150 hours of relayed video/month.  
Register at https://www.metered.ca/tools/openrelay/ to get credentials.

---

## Signaling via Socket.IO (No New Server Needed)

Add 5 new socket events to the existing signaling layer:

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `webrtc:join-video` | `{ roomId }` | User enables video in room |
| `webrtc:leave-video` | `{ roomId }` | User turns off camera |
| `webrtc:offer` | `{ roomId, targetUserId, sdp }` | SDP offer to a specific peer |
| `webrtc:answer` | `{ roomId, targetUserId, sdp }` | SDP answer to a specific peer |
| `webrtc:ice` | `{ roomId, targetUserId, candidate }` | ICE candidate to a specific peer |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `webrtc:user-joined-video` | `{ userId }` | Another member enabled video |
| `webrtc:user-left-video` | `{ userId }` | Member disabled video |
| `webrtc:offer` | `{ fromUserId, sdp }` | Incoming offer |
| `webrtc:answer` | `{ fromUserId, sdp }` | Incoming answer |
| `webrtc:ice` | `{ fromUserId, candidate }` | Incoming ICE candidate |

Server just forwards directional events — no SDP inspection.

---

## Frontend Implementation

### New hook: `useWebRTC(roomId, localStream, socket)`
```js
// Manages Map<userId, RTCPeerConnection>
// On 'webrtc:user-joined-video': create offer → send via socket
// On 'webrtc:offer': create answer → send via socket
// On 'webrtc:answer': setRemoteDescription
// On 'webrtc:ice': addIceCandidate
// Returns: Map<userId, MediaStream> (remote streams)
```

### ICE configuration
```js
const iceServers = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  {
    urls: [
      'turn:openrelay.metered.ca:80',
      'turn:openrelay.metered.ca:443',
      'turn:openrelay.metered.ca:80?transport=tcp',
    ],
    username: process.env.VITE_TURN_USERNAME,
    credential: process.env.VITE_TURN_CREDENTIAL,
  },
]
```

### New component: `VideoGrid`
```
┌─────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐    │
│  │  User A  │  │  User B  │    │
│  │  (self)  │  │          │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │  User C  │  │  User D  │    │
│  │          │  │          │    │
│  └──────────┘  └──────────┘    │
└─────────────────────────────────┘
```
- 1 video → center large; 2 → side by side; 3-4 → 2×2 grid
- Self-view: local stream, mirrored, muted (no echo)
- Camera/mic toggle buttons overlay on hover
- "Camera off" state: shows initials avatar with subtle pulse

### Controls added to RoomView header
```
[🎥 Camera] [🎙 Mic]  ← toggle buttons, teal when on, muted when off
```

### Room creation option
Add checkbox to `RoomCreate.jsx`: "Enable video calling" → stored as `videoEnabled: Boolean` on `StudyRoom` model.

---

## Quality Settings

| Scenario | Setting |
|----------|---------|
| Default video | 360p, 30fps (~300kbps) |
| Low bandwidth fallback | 240p, 15fps |
| Audio | Opus codec (WebRTC default), echo cancellation on |
| Constraint | `{ video: { width: 640, height: 360, frameRate: 30 }, audio: true }` |

---

## Privacy & Permissions

- Camera/mic are **off by default** — user must explicitly enable
- Permission prompt is browser-native (no custom UI needed)
- If user denies camera permission, gracefully fall back to text-only mode
- No video is recorded or sent to server (all peer-to-peer)
- Hosts can set `videoEnabled: false` on the room to disable video entirely

---

## Out of Scope (Phase 3)
- Screen sharing
- Background blur / virtual backgrounds
- Recording sessions
- SFU-based video (only needed if room cap >6)
- Audio-only mode (separate feature)
- Chat reactions / raise hand
