# PRD 04 — Pomodoro Timer

**Phase:** 1 (MVP)  
**Used inside:** Solo Session + Group Rooms  
**This is a component, not a standalone page.**

---

## Problem
Unstructured study sessions lead to burnout or endless distraction. The Pomodoro technique (25 min work / 5 min break) is proven. It needs to be built as a reusable, synced component that works in both solo and group contexts.

---

## User Stories
- As a user, I want the option to study in Pomodoro mode so my breaks are structured.
- As a user in a group room, I want the Pomodoro timer to be synchronized for everyone so we work on the same cycle.
- As a user, I want to be notified when a work interval ends and when break ends.
- As a user, I want to customize the work/break durations to fit my preference.

---

## Timer Modes

| Mode | Work | Short Break | Long Break | Long Break After |
|------|------|-------------|------------|-----------------|
| Classic | 25 min | 5 min | 15 min | Every 4 cycles |
| Extended | 50 min | 10 min | 20 min | Every 4 cycles |
| Custom | User-set | User-set | User-set | User-set |

Default: Classic.

---

## Timer States

```
IDLE → WORKING → SHORT_BREAK → WORKING → ... → LONG_BREAK → WORKING ...
```

| State | Color Theme | Label |
|-------|-------------|-------|
| IDLE | Neutral | "Ready to start" |
| WORKING | Green/Teal | "Focus time" |
| SHORT_BREAK | Blue | "Short break" |
| LONG_BREAK | Purple | "Long break — you earned it" |
| PAUSED | Yellow | "Paused" |

---

## Component Spec

### `<PomodoroTimer />`

**Props:**
```ts
{
  mode: 'pomodoro' | 'continuous',
  workDuration: number,     // minutes
  shortBreak: number,
  longBreak: number,
  onTick: (remaining: number) => void,
  onPhaseChange: (phase: TimerPhase) => void,
  onComplete: () => void,
  synced?: boolean,         // true in group rooms
  socketRef?: Socket,       // passed when synced
}
```

### Visual Elements
- Large circular SVG progress ring (stroke-dashoffset animation)
- Time remaining centered inside ring (MM:SS)
- Phase label below time
- Cycle counter: "Cycle 2 of 4"
- Controls: Start / Pause / Skip / Reset

### Sound Effects
Minimal, not annoying:
- Soft bell when work interval ends
- Soft chime when break ends
- Use Web Audio API — no external dependencies
- Volume slider in session settings
- Can be muted

---

## Group Room Sync (Socket.IO)

When `synced=true`, the timer state is controlled by the room host and broadcast to all members.

**Socket Events:**

| Event | Direction | Payload |
|-------|-----------|---------|
| `timer:start` | host → server → all | `{ phase, duration, startedAt }` |
| `timer:pause` | host → server → all | `{ pausedAt }` |
| `timer:skip` | host → server → all | `{ nextPhase }` |
| `timer:sync` | server → joining member | `{ phase, remaining, cycleCount }` |

**Late joiners** receive `timer:sync` on room join so their timer snaps to current state.

**Only the room host** can control the timer. Other members see controls greyed out with "Host controls timer" tooltip.

---

## Continuous Mode

If user selects Continuous (no Pomodoro), the timer is a simple countdown:
- No break phases
- Just counts down from selected duration
- Same circular UI, no cycle counter
- Pausing does not reset — resumes from where it stopped

---

## Persistence
- Timer state is held in React state + context — not in DB
- On page refresh during active session: timer resets (acceptable for MVP)
- Group room timer is held server-side in memory (socket room state) — survives individual member refreshes

---

## Out of Scope
- Timer history / Pomodoro count tracking (add to Analytics in Phase 2)
- Task list per Pomodoro interval
- Background timer when app is minimized (requires service worker — Phase 3)
- Push notifications
