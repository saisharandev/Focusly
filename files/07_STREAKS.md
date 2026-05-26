# PRD 07 — Streaks

**Phase:** 2  
**Displayed on:** Dashboard (widget), Profile page  
**No dedicated route needed — it's a system, not a page.**

---

## Problem
One-off sessions don't build habits. Streaks create a daily return mechanic — users come back not just because they want to study, but because they don't want to break the chain. (Same mechanic Duolingo built a $3B company on.)

---

## User Stories
- As a user, I want to see my current study streak so I feel motivated to maintain it.
- As a user, I want to know if I'm at risk of losing my streak today.
- As a user, I want to see my longest-ever streak as a personal best.
- As a user, I want a visual heatmap of my consistency over time.

---

## Streak Rules

**A streak day is earned when:**
- User completes at least 1 session with `status: 'completed'` in a calendar day (user's local timezone)
- Minimum session duration: **15 minutes** (prevents gaming with 1-min sessions)

**A streak breaks when:**
- A full calendar day passes with no qualifying session

**Edge cases:**
| Scenario | Handling |
|----------|----------|
| User signs up today | Streak starts at 0 |
| First session completed | Streak becomes 1 |
| Studies twice in one day | Streak still +1 (day, not session) |
| Studies at 11:58 PM | Counts for that day |
| Misses a day | Streak resets to 0, longest streak preserved |

---

## Streak Calculation Logic

Run on every session save (`POST /api/sessions/:id/end`):

```js
function updateStreak(user, sessionDate) {
  const today = toLocalDate(sessionDate, user.timezone);
  const lastStudy = toLocalDate(user.lastStudyDate, user.timezone);
  const daysDiff = daysBetween(lastStudy, today);

  if (daysDiff === 0) {
    // Already studied today — no change
    return;
  } else if (daysDiff === 1) {
    // Consecutive day
    user.currentStreak += 1;
  } else {
    // Gap — reset
    user.currentStreak = 1;
  }

  user.lastStudyDate = sessionDate;
  user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
}
```

---

## UI Components

### Streak Badge (Dashboard + Sidebar)
```
🔥 12  ←  current streak
```
- Fire emoji, streak count, "day streak" label
- Pulses/glows if streak > 7
- Gray/dim if user hasn't studied yet today ("At risk")

### Streak At-Risk Warning
If it's past 6 PM local time and no session completed today:
- Dashboard shows a soft warning card: "🔥 Don't break your 12-day streak! You haven't studied today."
- CTA: "Start a quick session"

### Heatmap Calendar (Profile Page)
GitHub-style contribution graph:
- Last 90 days
- Each cell = one day
- Color intensity = study minutes that day
  - 0 min → empty/dark
  - 1–30 min → light accent
  - 31–90 min → medium accent
  - 90+ min → full accent color
- Hover on cell → tooltip: "May 20 — 2h 15m"

### Stats Row (Profile Page)
| Stat | Value |
|------|-------|
| 🔥 Current Streak | 12 days |
| 🏆 Longest Streak | 28 days |
| 📅 Total Active Days | 47 |
| 📊 This Month | 18/31 days |

---

## Milestone Streaks (tie-in with Achievements)

| Streak | Achievement Unlocked |
|--------|---------------------|
| 3 days | "Getting Started" |
| 7 days | "One Week Strong" |
| 14 days | "Consistent" |
| 30 days | "Consistency King" |
| 100 days | "Legendary" |

Achievement unlock handled by Achievements system (PRD 09).

---

## API Endpoints

Streak data is part of the user object — no separate endpoints needed.

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/api/auth/me` | Includes `currentStreak`, `longestStreak`, `lastStudyDate` |
| GET | `/api/analytics/heatmap` | Array of `{ date, minutes }` for last 90 days |

---

## Out of Scope
- Streak freeze / protection (premium feature idea for later)
- Timezone edge cases beyond basic local date handling
- Streak sharing / social posts
