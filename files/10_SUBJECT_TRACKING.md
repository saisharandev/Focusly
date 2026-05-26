# PRD 10 — Subject Tracking

**Phase:** 3  
**Used in:** Session setup, Analytics, Profile  
**No dedicated page — integrated into existing pages.**

---

## Problem
Students study multiple subjects but have no visibility into where their time actually goes. "I've been studying DBMS all week" might mean 2 hours or 14 hours — they genuinely don't know.

---

## User Stories
- As a user, I want to tag each session with a subject so my time is categorised.
- As a user, I want to see which subjects I've spent the most time on.
- As a user, I want to know which subjects I've been neglecting.
- As a user, I want to quickly select a recent subject when starting a session.

---

## Subject Management

Users build a personal subject list over time. Two ways to add:
1. **Type a new subject** in the session setup dropdown → auto-saved on first use
2. **Profile settings** → manage subjects (rename, archive, set color)

**Subject object:**
```js
Subject {
  _id: ObjectId,
  userId: ObjectId,
  name: String,        // e.g. "DBMS", "Algorithms", "Physics"
  color: String,       // hex color for charts (auto-assigned, user can change)
  isArchived: Boolean, // hidden from dropdown but data preserved
  createdAt: Date,
}
```

**Auto-create rule:** If user types a subject name that doesn't exist → create it silently. No modal, no friction.

**Subject limit:** 20 active subjects per user. Encourage archiving old ones.

---

## Where Subjects Appear

### Session Setup
- Dropdown with user's subjects
- Search/filter in dropdown
- "New subject" option at bottom
- Last used subject pre-selected by default

### Analytics Page — Subject Breakdown
- Donut chart showing time distribution across subjects (see Analytics PRD)
- List view below chart:

| Subject | Color | Hours This Week | All Time | % of Total |
|---------|-------|-----------------|----------|------------|
| DBMS | 🔵 | 8h 20m | 42h | 34% |
| Algorithms | 🟣 | 5h 10m | 28h | 21% |
| Physics | 🟡 | 2h 00m | 18h | 15% |

- Highlight "Most studied" and "Neglected" (hasn't been studied in 7+ days)

### Profile Page
- Simple list of subjects with hours bubble

---

## Neglected Subject Detection

If a subject exists and hasn't been used in 7+ days:
- Show soft warning on dashboard: "You haven't touched Physics in 8 days 👀"
- Not aggressive — just one dismissible card

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | User's subject list |
| POST | `/api/subjects` | Create new subject |
| PATCH | `/api/subjects/:id` | Rename, recolor, archive |
| DELETE | `/api/subjects/:id` | Delete (only if no sessions reference it) |
| GET | `/api/subjects/stats` | Hours per subject for given range |

---

## Out of Scope
- Shared/global subject templates
- Subject-specific goals (e.g. "I want to study 10h of DBMS this week")
- Sub-topics within subjects
- Subject-based leaderboard
