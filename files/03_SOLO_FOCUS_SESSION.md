# PRD 03 — Solo Focus Session

**Phase:** 1 (MVP)  
**Route:** `/session`  
**This is the core product loop. Get this right above everything else.**

---

## Problem
Students open a timer, start it, and immediately get distracted. There's no accountability because no one is watching. Focusly adds a lightweight presence layer — client-side camera detection confirms the user is at their desk, not their phone.

---

## User Stories
- As a user, I want to start a timed study session for a specific subject so I can track my work.
- As a user, I want the app to notice when I leave my desk and warn me, so I stay accountable.
- As a user, I want to see my focus score in real time so I know how well I'm doing.
- As a user, I want a session report when I finish so I can see how productive I was.

---

## Session Setup Screen (`/session/new`)

Before the session starts, user fills:

| Field | Type | Notes |
|-------|------|-------|
| Subject | Dropdown + "add new" | Pre-filled from user's subject list |
| Session Goal | Text (optional) | e.g. "Finish chapter 4 of DBMS" |
| Duration | Preset buttons | 25 / 45 / 60 / 90 min, or custom |
| Timer Mode | Toggle | Pomodoro OR Continuous |
| Camera Tracking | Toggle | On by default, user can disable |

**Camera permission request happens here** — explain clearly why:
> "Focusly uses your camera locally to detect if you're at your desk. No video is recorded or sent to our servers."

On "Start Session" → transition to session screen.

---

## Session Screen (`/session/active`)

### Layout
```
┌──────────────────────────────────────────────────┐
│  [Subject Tag]           [Focus Score: 87%] 🟢    │
│                                                  │
│           ⏱ 23:45  (circular animated timer)     │
│                                                  │
│    [Webcam preview — small, bottom left]         │
│                                                  │
│    🟢 Focused  |  Distractions: 2  |  Elapsed: 16m│
│                                                  │
│         [ Pause ]      [ End Session ]           │
└──────────────────────────────────────────────────┘
```

### Circular Timer
- Animated SVG ring that depletes as time passes
- Time remaining displayed large in center
- Color: green (focused) → yellow (idle) → red (distracted)
- Smooth color transitions

### Webcam Preview
- Small preview (bottom corner) — just so user knows camera is active
- Not the focus of the UI
- Shows "Camera Off" state if user disabled tracking

### Focus Status Indicator
Three states, updated every 3 seconds:

| State | Trigger | Display |
|-------|---------|---------|
| 🟢 Focused | Face detected in frame | Green dot, "Focused" |
| 🟡 Idle | Face not detected < 10s | Yellow dot, "Away?" |
| 🔴 Distracted | Face not detected > 10s | Red dot + warning popup |

### Distraction Warning Popup
Appears when face gone > 10 seconds:
- Animated slide-in card
- "Hey, are you still there? Get back to your session!"
- Auto-dismisses when face returns
- Logs one distraction count

### Focus Score Calculation
```
Focus Score = (focused_seconds / total_elapsed_seconds) * 100
```
Updated in real time. Displayed as percentage in header.

---

## AI / Computer Vision Implementation

**Library:** MediaPipe Face Detection (JS)  
**Runs:** 100% client-side. No video frame ever leaves the browser.  
**What it detects:** Presence of a face in frame — nothing else.  
**What it does NOT do:** Emotion detection, gaze tracking, phone detection (V2+)

```js
// Pseudocode — face detection loop
const detector = await createDetector();
setInterval(async () => {
  const faces = await detector.estimateFaces(videoElement);
  updateFocusState(faces.length > 0);
}, 3000); // check every 3 seconds
```

**Edge cases to handle:**
- User covers camera manually → treat as "no face"
- Poor lighting → show warning "We're having trouble seeing you"
- Camera permission denied → session continues, tracking disabled, no score penalty

---

## Session End

On timer completion OR user clicks "End Session":

1. Show **Session Report Modal**

### Session Report
| Field | Value |
|-------|-------|
| Subject | DBMS |
| Duration | 45 min |
| Focus Score | 87% |
| Time Focused | 39 min |
| Distractions | 3 |
| Status | ✅ Completed / ⚠️ Ended Early |

Plus a small distraction timeline chart (Recharts) — shows when distractions happened across the session.

2. Two actions:
   - **Start Another Session** → back to setup
   - **Go to Dashboard** → save + exit

---

## Data Saved to DB (on session end)

```js
StudySession {
  userId,
  subject,
  goal,           // optional text
  plannedDuration, // minutes
  actualDuration,  // minutes (may differ if ended early)
  focusScore,      // 0–100
  distractionCount,
  cameraUsed,      // boolean
  startedAt,
  endedAt,
  status,          // 'completed' | 'abandoned'
}
```

Post-save:
- Update `user.totalStudyMinutes`
- Update `user.lastStudyDate`
- Recalculate streak

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions/start` | Log session start, return session ID |
| PATCH | `/api/sessions/:id/end` | Save final session data |
| GET | `/api/sessions/history` | User's past sessions |

---

## Out of Scope
- Phone detection
- Gaze tracking
- Screen activity monitoring
- Multiple camera support
- Session sharing / screenshots
