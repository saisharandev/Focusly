# PRD 02 — Dashboard

**Phase:** 1 (MVP)  
**Route:** `/dashboard`  
**Role:** Central hub — first screen after login

---

## Problem
Users need a single screen that shows their current status, today's progress, and what to do next. It should create a sense of momentum — not a blank empty state.

---

## User Stories
- As a user, I want to see how much I've studied today at a glance.
- As a user, I want to quickly start a solo session or join a room from the dashboard.
- As a user, I want to see my current streak so I feel motivated to maintain it.
- As a user, I want to see who else is studying right now.

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│ Sidebar (fixed left)   │   Main Content Area        │
│                        │                            │
│  Logo                  │  Greeting + Quick Actions  │
│  Dashboard             │                            │
│  Focus Session         │  Stats Row (4 cards)       │
│  Study Rooms           │                            │
│  Leaderboard           │  Active Rooms Preview      │
│  Analytics             │                            │
│  Profile               │  Weekly Study Chart        │
│                        │                            │
│  [User Avatar + Name]  │                            │
└─────────────────────────────────────────────────────┘
```

---

## Components

### Sidebar
- Fixed, collapsible on mobile
- Active route highlighted
- User avatar + name at bottom
- Status indicator (Idle / In Session)

### Greeting Header
- "Good morning, Sai 👋" — time-aware greeting
- Date and day
- Two CTA buttons: **Start Solo Session** | **Browse Rooms**

### Stats Row — 4 Cards
| Card | Data | Notes |
|------|------|-------|
| Today's Hours | e.g. "2h 40m" | Resets at midnight |
| Current Streak | e.g. "🔥 7 days" | Breaks if no session today |
| Focus Score | e.g. "82%" | Average of today's sessions |
| Sessions Done | e.g. "3" | Count for today |

All cards: animated counter on page load (count up from 0).

### Active Rooms Preview
- Show up to 4 currently active public rooms
- Each room card shows: room name, subject tag, member count, status dots
- "Browse All Rooms" link at bottom

### Weekly Study Chart
- Bar chart (Recharts)
- X-axis: last 7 days (Mon–Sun)
- Y-axis: hours studied
- Highlight today's bar in accent color
- Show average line

---

## API Endpoints Needed

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/api/dashboard/stats` | today hours, streak, focus score, session count |
| GET | `/api/rooms/active` | list of active public rooms (limit 4) |
| GET | `/api/analytics/weekly` | 7-day study data for chart |

---

## Empty State Handling
First-time user sees:
- Zero stats with encouraging copy ("Your journey starts today")
- "Start your first session" CTA prominent
- No empty chart — show placeholder bars at 0

---

## Realtime
- Active room member counts update via Socket.IO without page refresh
- User's own focus status in sidebar updates live during a session

---

## Out of Scope
- Notifications panel
- Calendar / scheduled sessions
- Friend activity feed
- Announcements
