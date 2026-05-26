# Focusly — CLAUDE.md

## What This Is
Virtual group study platform. Users study solo (with MediaPipe camera accountability) or in group rooms (synced Pomodoro timer via Socket.IO). Dark-only UI, futuristic aesthetic.

## Repo Structure
```
Focus_app/
├── client/          # React + Vite frontend
├── server/          # Node + Express backend
├── files/           # Original PRD specs (00_OVERVIEW.md → 12_PROFILE.md)
├── BUILD_SEQUENCE.md
└── .env.example
```

## Tech Stack
| Layer | Choice |
|---|---|
| Frontend | React + Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts |
| Backend | Node.js + Express (CommonJS — no ESM) |
| Database | MongoDB via Mongoose |
| Auth | JWT in localStorage, `Authorization: Bearer <token>` header |
| Realtime | Socket.IO |
| Camera | `@mediapipe/tasks-vision` — 100% client-side, no frames leave browser |

## Running Locally
```bash
# Terminal 1 — MongoDB must be running (brew services start mongodb-community)
cd server && npm run dev     # nodemon, port 5001

# Terminal 2
cd client && npm run dev     # Vite, port 5173
```

## Environment Variables
**`server/.env`**
```
PORT=5001
MONGO_URI=mongodb://localhost:27017/focusly
JWT_SECRET=focusly_super_secret_jwt_key_2026_change_in_prod
CLIENT_URL=http://localhost:5173
```
**`client/.env`**
```
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

## Client Structure
```
client/src/
├── components/
│   ├── ui/          # Button, Card, Input, Badge, Modal, Spinner, Skeleton, EmptyState, ErrorBoundary
│   ├── layout/      # Sidebar, AppLayout, AuthLayout, ProtectedRoute
│   ├── session/     # CircularTimer, WebcamPreview, FocusStatus, DistractionWarning, SessionReport
│   ├── pomodoro/    # PomodoroTimer
│   ├── dashboard/   # StatsCard, WeeklyChart, ActiveRoomCard
│   └── rooms/       # RoomCard, MemberGrid, MemberCard, ChatPanel, HostControls
├── pages/
│   ├── auth/        # Login, Signup, ForgotPassword
│   ├── Dashboard.jsx
│   ├── session/     # SessionSetup, SessionActive
│   └── rooms/       # RoomsBrowse, RoomCreate, RoomView
├── hooks/           # useAuth, useSocket, useFaceDetection, usePomodoroTimer, useSessionTimer
├── context/         # AuthContext, SocketContext
└── lib/             # api.js (Axios + interceptors), utils.js
```

## Server Structure
```
server/
├── models/          # User, StudySession, StudyRoom
├── routes/          # auth, sessions, rooms, dashboard, analytics
├── controllers/     # auth, sessions, rooms, dashboard, analytics
├── middleware/      # requireAuth, asyncHandler, errorHandler
├── socket/          # index, roomHandlers, focusHandlers, chatHandlers, timerHandlers
├── utils/           # date.js (startOfDayUTC, daysBetween)
└── index.js
```

## Key Decisions (do not change without reason)
- **JWT in localStorage** — MVP choice. Don't switch to cookies without updating both the Axios interceptor and the Socket.IO auth handshake.
- **No ESM on server** — server uses `require()`. `nanoid` is pinned at v3 because v4+ is ESM-only.
- **MediaPipe WASM excluded from Vite bundle** — `optimizeDeps: { exclude: ['@mediapipe/tasks-vision'] }` in vite.config.js. Remove this and the build breaks.
- **Timer state in server memory** — `roomStates` Map in `socket/index.js`. Not persisted to DB — it's ephemeral. Survives member refreshes, dies if server restarts.
- **Chat not persisted** — messages are broadcast via Socket.IO only. No DB save in Phase 1.
- **Streak only counts sessions ≥ 15 min with status `completed`** — logic in `sessions.controller.js` → `endSession`.

## API Endpoints
### Auth (`/api/auth`)
- `POST /signup` → `{ token, user }`
- `POST /login` → `{ token, user }`
- `GET /me` → `{ user }` (requires auth)
- `POST /logout` → 200 OK
- `POST /forgot-password` → logs token to console (no email in MVP)

### Sessions (`/api/sessions`) — all require auth
- `POST /` → start session, returns `{ sessionId }`
- `PATCH /:id/end` → end session, updates streak
- `GET /history` → paginated session list

### Rooms (`/api/rooms`) — all require auth
- `POST /` → create room
- `GET /` → active public rooms
- `GET /:id` → room details
- `POST /join/:code` → join by invite code
- `DELETE /:id/leave` → leave room
- `DELETE /:id` → end room (host only)

### Dashboard (`/api/dashboard`) — requires auth
- `GET /stats` → today's minutes, streak, avg focus score, session count
- `GET /active-rooms` → up to 4 active public rooms

### Analytics (`/api/analytics`) — requires auth
- `GET /weekly` → last 7 days `[{ date, minutes }]`

## Socket.IO Events
### Client → Server
| Event | Payload |
|---|---|
| `join_room` | roomId |
| `leave_room` | roomId |
| `focus_status_update` | `{ roomId, status: 'focused'│'idle'│'distracted'│'untracked' }` |
| `send_message` | `{ roomId, text }` |
| `timer:start` | `{ roomId, workDuration }` |
| `timer:pause` | `{ roomId }` |
| `timer:resume` | `{ roomId }` |
| `timer:skip` | `{ roomId }` |

### Server → Client
| Event | Payload |
|---|---|
| `member_joined` | `{ userId, name, avatarUrl }` |
| `member_left` | `{ userId }` |
| `host_changed` | `{ newHostId }` |
| `member_status_changed` | `{ userId, status }` |
| `new_message` | `{ userId, name, text, timestamp }` |
| `timer:sync` | `{ phase, remaining, cycleCount, isPaused }` |
| `timer:started` | `{ phase, duration, startedAt, cycleCount }` |
| `timer:paused` | `{ remainingAtPause }` |
| `timer:resumed` | `{ startedAt }` |
| `timer:skipped` | `{ phase, duration, startedAt, cycleCount }` |
| `room_ended` | — |

## Design System
**Tailwind custom colors:**
```
bg-base:       #09090B   page background
bg-surface:    #18181B   sidebar, panels
bg-card:       #27272A   inputs, secondary cards
accent-teal:   #14B8A6   primary CTA, focused state
accent-purple: #A855F7   break phases, achievements
accent-amber:  #F59E0B   idle state, warning
accent-red:    #EF4444   distracted state, danger
text-primary:  #FAFAFA
text-secondary:#A1A1AA
text-muted:    #71717A
```
**Glassmorphism card:** `bg-white/5 backdrop-blur-xl border border-white/8 rounded-2xl`
**Font:** Inter (Google Fonts)

## What's Built (Phase 1 MVP)
- [x] Auth — signup, login, forgot password (no email send), JWT, protected routes
- [x] Dashboard — stats cards with count-up animation, weekly bar chart, active rooms preview
- [x] Solo Focus Session — setup screen, active screen with circular SVG timer, MediaPipe face detection, distraction warning, session report modal
- [x] Pomodoro Timer — useReducer state machine, Web Audio phase sounds, Classic/Custom modes
- [x] Group Rooms — browse, create, room view with synced timer, member grid with focus dots, chat panel, host controls

## What's NOT Built Yet (Phase 2+)
- Leaderboard (`/leaderboard`) — PRD: `files/06_LEADERBOARD.md`
- Streaks heatmap calendar — logic exists, UI on profile not built
- Analytics page (`/analytics`) — PRD: `files/08_ANALYTICS.md`
- Profile page (`/profile`) — PRD: `files/12_PROFILE.md`
- Achievements — PRD: `files/09_ACHIEVEMENTS.md`
- Subject tracking (dropdown in session setup) — PRD: `files/10_SUBJECT_TRACKING.md`
- Study music player — PRD: `files/11_STUDY_MUSIC.md`
- Password reset email (Nodemailer/Resend)
- Google OAuth
- Avatar upload

## Deployment (Free Tier)
- **Frontend** → Vercel (root: `client/`) — `https://focusly-trail-s-projects.vercel.app`
- **Backend** → Render (root: `server/`, start: `node index.js`) — `https://focusly-api-6tmg.onrender.com`
- **Database** → MongoDB Atlas M0 — cluster `cluster0.hagpb.mongodb.net`, DB user `focusly_user`
- **Keep-alive** → UptimeRobot pings `https://focusly-api-6tmg.onrender.com/api/health` every 5 min

### Render Environment Variables
```
MONGO_URI  = mongodb+srv://focusly_user:<password>@cluster0.hagpb.mongodb.net/focusly?retryWrites=true&w=majority
JWT_SECRET = focusly_super_secret_jwt_key_2026
CLIENT_URL = <stable Vercel production URL — no trailing slash>
PORT       = 10000
```

### Vercel Environment Variables
```
VITE_API_URL    = https://focusly-api-6tmg.onrender.com
VITE_SOCKET_URL = https://focusly-api-6tmg.onrender.com
```

### Deployment Gotchas
- `client/vercel.json` has SPA rewrite (`"/(.*)" → "/index.html"`) — required for React Router on Vercel
- `CLIENT_URL` is `.trim()`-ed in `server/index.js` to prevent "Invalid character in header" CORS crash
- Vercel creates a new preview URL on each push — always use the **stable production URL** from Vercel Settings → Domains for `CLIENT_URL`, not the per-deployment hash URL
- Atlas Network Access must allow `0.0.0.0/0` — Render uses dynamic IPs
- `Cannot GET /` on the Render URL is normal — no route at `/`, API routes are at `/api/*`

## Mongoose Models
### User
`name, email, passwordHash (select:false), university, avatarUrl, timezone, totalStudyMinutes, currentStreak, longestStreak, lastStudyDate, studiedWith[]`

### StudySession
`userId, subject, goal, plannedDuration, actualDuration, focusScore, distractionCount, cameraUsed, startedAt, endedAt, status (in_progress│completed│abandoned)`
Index: `userId + startedAt`

### StudyRoom
`name, type (enum), subjectTag, hostId, members[], maxMembers, isPublic, inviteCode (unique), timerMode, workDuration, isActive, endedAt`
Index: `isActive + isPublic`

## Common Gotchas
1. **Mongoose aggregation**: `req.user.id` is a string — wrap with `new mongoose.Types.ObjectId(id)` in `$match`
2. **MediaPipe**: use `runningMode: 'VIDEO'` and `detectForVideo(el, timestampMs)`, not `detect()`
3. **Web Audio**: create `AudioContext` lazily inside user click handler — browsers block it before interaction
4. **Socket.IO reconnect**: `RoomView.jsx` re-emits `join_room` on `socket.on('connect')` using a ref
5. **Framer Motion AnimatePresence**: child needs a `key` prop or enter/exit won't animate
6. **nanoid**: pinned at v3 (`require` style). Do not upgrade to v4+
7. **Recharts**: pass explicit hex strings for colors — ignores CSS variables
