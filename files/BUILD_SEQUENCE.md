# Focusly — Build Sequence & Checklist

Use this as your day-by-day reference. Don't skip ahead.

---

## Phase 1 — MVP (Build in this order)

### Week 1 — Foundation
- [ ] Initialize React + Vite project
- [ ] Set up Tailwind CSS + design tokens (colors, fonts, spacing)
- [ ] Set up Express server + MongoDB connection
- [ ] Implement `User` model
- [ ] Build `/signup` and `/login` pages (UI only first)
- [ ] Wire JWT auth (signup → login → token → protected route)
- [ ] Build sidebar + layout shell
- [ ] Build `/dashboard` with static/mock data

### Week 2 — Core Loop
- [ ] Build `PomodoroTimer` component (no sync yet)
- [ ] Build `/session/new` setup screen
- [ ] Integrate MediaPipe face detection (client-side only)
- [ ] Build `/session/active` screen with timer + focus status
- [ ] Session report modal on completion
- [ ] `StudySession` model + save on session end
- [ ] Update user streak on session save
- [ ] Wire Dashboard stats to real data

### Week 3 — Group Rooms
- [ ] Set up Socket.IO on server
- [ ] `StudyRoom` + `Message` models
- [ ] Build `/rooms` browse page
- [ ] Build `/rooms/create` form
- [ ] Build `/rooms/:id` room view
- [ ] Socket: join/leave room, member list sync
- [ ] Socket: chat messages
- [ ] Socket: focus status broadcast
- [ ] Wire Pomodoro timer sync in rooms

### Week 4 — Polish + Deploy
- [ ] Error handling on all API routes
- [ ] Loading states + skeletons on all data-fetching
- [ ] Empty states for all list views
- [ ] Responsive layout (mobile sidebar collapses)
- [ ] Environment variables documented in `.env.example`
- [ ] README with setup instructions
- [ ] Deploy: frontend on Vercel, backend on Railway or Render

---

## Phase 2 — Engagement Layer

- [ ] `/leaderboard` page (friends → university → global)
- [ ] Streak at-risk warning on dashboard
- [ ] `/analytics` page with all 5 charts
- [ ] `/profile` own + public view
- [ ] Heatmap calendar component
- [ ] Avatar upload
- [ ] Achievement unlock logic (run post-session)
- [ ] Achievement toast notifications

---

## Phase 3 — Polish & Extras

- [ ] Achievements grid on profile
- [ ] Subject management (add/archive/recolor)
- [ ] Neglected subject nudge on dashboard
- [ ] Floating music player component
- [ ] Audio track library (royalty-free MP3s)
- [ ] Animated waveform visualizer
- [ ] Password reset (Nodemailer/Resend)
- [ ] Google OAuth

---

## Key Decisions to Document

Before you start coding, write down and commit to:

1. **JWT storage:** `httpOnly` cookie (more secure) vs `localStorage` (simpler). Recommended: `localStorage` for MVP, migrate to cookie later.
2. **Video in rooms:** No WebRTC in Phase 1. Just presence status. Video is Phase 2.
3. **Camera data:** Confirmed — MediaPipe runs entirely in browser. No frames sent to server. State this clearly in your README.
4. **Room timer authority:** Server holds timer state in memory (socket room object). Not in DB — it's ephemeral.
5. **Timezone handling:** Store all datetimes in UTC. Convert to user's local timezone for display and streak calculation.

---

## Red Lines — Things That Will Kill the Project If You Do Them

❌ Don't build all features at once  
❌ Don't start with the music player or achievements  
❌ Don't add WebRTC before rooms are stable  
❌ Don't store video frames on your server  
❌ Don't make the leaderboard global-first (demoralizing, not motivating)  
❌ Don't skip empty states — they're what make or break first impressions  
