# PRD 06 — Leaderboard

**Phase:** 2  
**Route:** `/leaderboard`  
**Build after:** Auth, Sessions, Dashboard are working.

---

## Problem
Without visibility into how peers are performing, there's no competitive motivation. A leaderboard converts study time into social currency — the same mechanic that makes Duolingo sticky.

---

## User Stories
- As a user, I want to see how my study hours compare to my peers so I feel competitive.
- As a user, I want to filter the leaderboard to my university so comparisons are fair.
- As a user, I want to see my own rank prominently even if I'm not in the top 10.
- As a user, I don't want global strangers on my leaderboard — it should feel personal.

---

## Leaderboard Scopes

| Scope | Who's In It | Notes |
|-------|-------------|-------|
| Friends | Users you've studied with in a room | Most meaningful |
| University | Same university (from signup field) | Requires university set |
| Global | All Focusly users | Least motivating — show last |

Default view: **Friends**. If no friends yet → show University. If university not set → show Global with nudge to set university.

---

## Ranking Metric

**Primary:** Total study minutes in current week (Monday–Sunday)  
**Tiebreaker:** Average focus score for the week

Weekly reset every Monday at 00:00 UTC.

---

## Page Layout

### Header
- Week label: "Week of May 19 – 25"
- Scope switcher: `Friends | University | Global` (pill tabs)
- Time remaining in week: "Resets in 2d 14h"

### Top 3 Podium
Visual podium for ranks 1, 2, 3:
- Large avatars
- Name + hours studied
- Rank badge (gold / silver / bronze)
- Animated entrance on load

### Rank Table (4–50)
| Rank | Avatar | Name | University | Hours This Week | Avg Focus |
|------|--------|------|------------|-----------------|-----------|
| 4 | 🖼 | Arjun K | MIT Bangalore | 22h 40m | 84% |
| ... | | | | | |

### Your Rank Card (sticky at bottom if not in top 10)
Always visible — pinned at bottom of page:
```
Your Rank: #24  |  18h 20m this week  |  Avg Focus: 79%
"Study 3h 20m more to reach #20"
```

---

## Data Requirements

Backend computes weekly stats by aggregating `StudySession` collection:

```js
// Weekly leaderboard query (pseudocode)
db.StudySessions.aggregate([
  { $match: { startedAt: { $gte: weekStart }, status: 'completed' } },
  { $group: {
    _id: '$userId',
    totalMinutes: { $sum: '$actualDuration' },
    avgFocus: { $avg: '$focusScore' }
  }},
  { $sort: { totalMinutes: -1 } },
  { $limit: 50 }
])
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard/friends` | Friends leaderboard |
| GET | `/api/leaderboard/university` | University leaderboard |
| GET | `/api/leaderboard/global` | Global top 50 |
| GET | `/api/leaderboard/me` | Caller's rank + stats in each scope |

Cache leaderboard results for 5 minutes — don't recompute on every request.

---

## Friend System (minimal, for leaderboard)
"Friends" in MVP = people you've shared a room with. No explicit friend request flow needed yet. Just track co-room membership.

```js
// When user leaves a room, add all co-members to their "studied-with" list
user.studiedWith = [...new Set([...user.studiedWith, ...roomMemberIds])]
```

---

## Out of Scope
- All-time leaderboard
- Subject-specific leaderboard
- Friend requests / follow system
- Notifications when someone passes you in rank
- Leaderboard history / hall of fame
