# PRD 12 — Profile Page

**Phase:** 2  
**Route:** `/profile` (own profile), `/profile/:userId` (public view)  
**Depends on:** Streaks, Achievements, Subjects

---

## Problem
Users need a place that represents their identity on the platform and consolidates their long-term progress. It's also the social anchor — what someone sees when they click your name in a leaderboard or room.

---

## User Stories
- As a user, I want to see all my stats in one place.
- As a user, I want to update my name, university, and avatar.
- As a user, I want to showcase my achievements and streak.
- As a user, I want other users to be able to see my public profile.

---

## Own Profile (`/profile`)

### Header Section
- Avatar (upload from local — stored as base64 or via Cloudinary in Phase 3)
- Name (editable inline)
- University (editable)
- Member since date
- "Edit Profile" button → modal with form

### Stats Row
| Stat | Value |
|------|-------|
| Total Study Hours | Lifetime |
| Current Streak | 🔥 N days |
| Longest Streak | N days |
| Sessions Completed | Count |
| Avg Focus Score | % |

### Heatmap Calendar
- 90-day GitHub-style activity heatmap
- See Streaks PRD for full spec

### Subject Breakdown
- Donut chart + list of top 5 subjects by hours

### Achievements Showcase
- Grid of badges (unlocked full color, locked greyed out)
- Filter: All | Unlocked
- Click → modal with description and unlock date

### Recent Sessions
- Last 5 sessions in a compact list
- Subject, date, duration, focus score

---

## Edit Profile Modal
Fields:
- Display name
- University
- Avatar upload (image file → compress to ~100KB before upload)
- Timezone (dropdown — for correct streak calculation)

---

## Public Profile (`/profile/:userId`)

Same layout but:
- No edit button
- No "recent sessions" (private)
- Shows: stats, streak, heatmap (days only — not hours), achievements, top 3 subjects
- "Study Together" button → invite them to a room you're hosting

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Own profile with all stats |
| PATCH | `/api/users/me` | Update name, university, timezone |
| POST | `/api/users/me/avatar` | Upload avatar |
| GET | `/api/users/:id` | Public profile |

---

## Out of Scope
- Social follow system
- Profile themes / customization beyond avatar
- Bio / links section
- Private messaging from profile
