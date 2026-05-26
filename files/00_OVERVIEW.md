# Focusly — Product Overview

## What It Is
Focusly is a virtual group study platform for college students. It recreates the "library environment" effect online — where being around peers studying makes you more focused — and adds lightweight AI presence tracking to create accountability even in solo sessions.

## Core Problem
Studying at home feels unproductive because there's no ambient social pressure. Physical libraries and study halls work not because of the books — but because of the people around you. Focusly recreates this digitally.

## The One Thing It Does Differently
Every other study app tracks *time*. Focusly tracks *presence* — using client-side camera detection to verify you're actually at your desk, not just running a timer.

---

## Build Phases

### Phase 1 — MVP (Build This First)
| # | Feature | Why |
|---|---------|-----|
| 1 | Auth (Login / Signup) | Gate everything |
| 2 | Dashboard | Central hub |
| 3 | Solo Focus Session | Core loop |
| 4 | Pomodoro Timer | Core mechanic |
| 5 | Group Study Rooms | Core differentiator |

### Phase 2 — Engagement Layer
| # | Feature | Why |
|---|---------|-----|
| 6 | Leaderboard | Retention hook |
| 7 | Streaks | Daily habit loop |
| 8 | Basic Analytics | Show users their progress |

### Phase 3 — Polish & Extras
| # | Feature | Why |
|---|---------|-----|
| 9 | Achievements / Badges | Gamification |
| 10 | Subject Tracking | Power user feature |
| 11 | Study Music Player | Ambient experience |

---

## Tech Stack (Decided)

**Frontend:** React + Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts  
**Backend:** Node.js + Express.js  
**Database:** MongoDB (Mongoose)  
**Auth:** JWT + bcrypt  
**Realtime:** Socket.IO  
**Camera/CV:** MediaPipe Face Detection (client-side only — no video ever leaves the device)  
**Video Rooms:** WebRTC (simple-peer) — Phase 2  

---

## Design Principles
1. **Dark only.** No light mode. Futuristic, focused aesthetic.
2. **No feature bloat on screen.** One primary action per page.
3. **Status is always visible.** Who's focused, who isn't — always on screen in group rooms.
4. **Privacy first.** Camera runs locally. No video storage. No server transmission.

---

## Folder Structure
```
focusly/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI
│   │   ├── pages/            # Route-level pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Auth, Socket context
│   │   ├── lib/              # Utilities, API client
│   │   └── assets/
│   └── index.html
├── server/                   # Node/Express backend
│   ├── routes/
│   ├── controllers/
│   ├── models/               # Mongoose schemas
│   ├── middleware/
│   ├── socket/               # Socket.IO handlers
│   └── index.js
├── .env.example
└── README.md
```

---

## Non-Goals (Do Not Build Yet)
- Mobile app
- Payments / premium tier
- Video calling / audio in rooms (Phase 2)
- Public room discovery beyond search
- AI chat / tutoring
- Notes / document sharing
