# PRD 08 — Analytics

**Phase:** 2  
**Route:** `/analytics`  
**Depends on:** Sessions being logged for at least a week

---

## Problem
Students don't know their actual study patterns — they feel like they studied a lot but can't quantify it. Analytics makes invisible behavior visible, which motivates improvement and builds self-awareness.

---

## User Stories
- As a user, I want to see how many hours I studied each day this week.
- As a user, I want to know which subject I spent the most time on.
- As a user, I want to see my focus score trend so I know if I'm improving.
- As a user, I want to understand when my best focus hours are.

---

## Time Range Selector
Default: **This Week**. Options: This Week | Last Week | This Month | Last 30 Days | All Time  
Changing range refreshes all charts.

---

## Charts

### 1. Daily Study Hours — Bar Chart
- X: Days of week
- Y: Hours studied
- Bar color intensity = focus score (higher focus → brighter bar)
- Show daily average as horizontal line
- Recharts `<BarChart>`

### 2. Focus Score Trend — Line Chart
- X: Dates
- Y: Avg focus score per day (0–100%)
- Show 7-day rolling average as secondary line
- Recharts `<LineChart>`

### 3. Subject Breakdown — Donut Chart
- Each slice = a subject
- Hover: "DBMS — 8h 20m (34%)"
- Recharts `<PieChart>`

### 4. Best Focus Hours — Heatmap Grid
- X: Hours of day (6AM–12AM)
- Y: Days of week
- Cell color = avg focus score during that hour on that day
- Purpose: shows user "you focus best at 9PM on weekdays"
- Built with CSS grid (not Recharts — more control)

### 5. Session History Table
- Sortable table of all sessions
- Columns: Date, Subject, Duration, Focus Score, Distractions, Status
- Paginated (10 per page)
- Filterable by subject and date range

---

## Summary Cards (top of page)
4 stat cards, same style as Dashboard:

| Card | Metric |
|------|--------|
| Total Hours | Sum for selected range |
| Avg Focus Score | Mean across sessions |
| Sessions Completed | Count, status='completed' |
| Best Day | Day with most study time |

---

## API Endpoints

| Method | Endpoint | Query Params | Returns |
|--------|----------|-------------|---------|
| GET | `/api/analytics/summary` | `range` | 4 summary stats |
| GET | `/api/analytics/daily` | `range` | Array of `{ date, minutes, avgFocus }` |
| GET | `/api/analytics/subjects` | `range` | Array of `{ subject, minutes }` |
| GET | `/api/analytics/focus-trend` | `range` | Array of `{ date, focusScore }` |
| GET | `/api/analytics/hourly` | `range` | Grid of `{ hour, day, avgFocus }` |
| GET | `/api/analytics/heatmap` | — | 90-day `{ date, minutes }` (for streaks) |
| GET | `/api/sessions/history` | `page`, `limit`, `subject`, `from`, `to` | Paginated sessions |

---

## Empty State
If user has < 3 sessions: show illustration + "Come back after a few study sessions to see your patterns" — do not show empty charts.

---

## Out of Scope
- Comparison to other users
- AI-generated study recommendations
- Export to CSV
- Predicted study time
