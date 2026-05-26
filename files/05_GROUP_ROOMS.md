# PRD 05 — Group Study Rooms

**Phase:** 1 (MVP)  
**Routes:** `/rooms` (browse), `/rooms/create`, `/rooms/:id` (room view)  
**This is the social core of Focusly.**

---

## Problem
Solo studying is isolating. Being in a room where others are visibly studying — even silently — creates passive accountability. Group rooms simulate the library/café environment digitally.

---

## User Stories
- As a user, I want to create a study room and invite friends so we can study together.
- As a user, I want to browse active public rooms and join one that fits my subject.
- As a user in a room, I want to see everyone's focus status in real time.
- As a user in a room, I want to chat with roommates without breaking focus.
- As a user, I want the Pomodoro timer to be synchronized with my room.

---

## Room Types

| Type | Description | Icon |
|------|-------------|------|
| Silent Room | No chat — pure presence only | 🤫 |
| Coding Room | For CS/dev sessions | 💻 |
| Exam Prep | Exam crunch mode | 📚 |
| General | Open topic | 🎯 |
| Late Night | Night owl sessions | 🌙 |

Room type is cosmetic in MVP — affects icon and label only. Can add behavior differences (e.g. Silent Room disables chat) in Phase 2.

---

## Room Settings (on create)

| Field | Options | Notes |
|-------|---------|-------|
| Room Name | Text | Required |
| Room Type | Dropdown | See above |
| Subject Tag | Text | e.g. "DBMS", "Math", "DSA" |
| Privacy | Public / Private | Private = invite code only |
| Max Members | 2–10 | Default 6 |
| Timer Mode | Pomodoro / Continuous | Default Pomodoro |
| Work Duration | 25 / 50 / Custom min | If Pomodoro |

On create → user becomes **host** → redirected to room view.

**Invite code:** auto-generated 6-character alphanumeric (e.g. `FCS-4X2`). Shareable link: `focusly.app/rooms/join/FCS-4X2`

---

## Room Browse Page (`/rooms`)

- Grid of active room cards
- Filter by: Subject, Room Type, Has Space
- Search by room name
- Each card shows:
  - Room name + type icon
  - Subject tag
  - Member count (e.g. 3/6)
  - Member avatars (up to 4, then "+2")
  - Live focus status dots (🟢🟡🔴)
  - "Join" button — disabled if full

---

## Room View (`/rooms/:id`)

### Layout
```
┌─────────────────────────────────────────────────────┐
│ Room Name + Type     │ Chat Panel (collapsible)      │
│ Subject Tag          │                              │
│                      │  [message list]              │
│  ┌──────────────┐    │                              │
│  │ Pomodoro     │    │  [message input]             │
│  │ Timer (sync) │    │                              │
│  └──────────────┘    └──────────────────────────────│
│                                                     │
│  Member Grid:                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │Avatar│ │Avatar│ │Avatar│ │Avatar│              │
│  │🟢    │ │🟢    │ │🟡    │ │🔴    │              │
│  │Name  │ │Name  │ │Name  │ │Name  │              │
│  └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                     │
│ [Leave Room]    [Your Focus: 🟢 Focused]            │
└─────────────────────────────────────────────────────┘
```

### Member Cards
Each member displays:
- Avatar
- Name
- Focus status dot (🟢 / 🟡 / 🔴)
- Study time in room (e.g. "34m")
- Host crown icon if host

Status updates every 3 seconds via Socket.IO.

### Chat Panel
- Collapsible (default open in non-Silent rooms)
- Messages show: avatar, name, text, timestamp
- No message history on join — live only (MVP simplification)
- Max message length: 200 chars
- No file/image sharing in MVP

### Host Controls
Host sees extra UI:
- Start / Pause / Skip timer (affects all members)
- Kick member
- End room (kicks everyone)

---

## Realtime — Socket.IO Events

### Connection
```
join_room(roomId, userId)
leave_room(roomId, userId)
```

### Focus Status
```
// Member emits their status every 3s
focus_status_update(roomId, userId, status: 'focused'|'idle'|'distracted')

// Server broadcasts to room
member_status_changed(userId, status)
```

### Timer (host only emits, server broadcasts)
```
timer:start, timer:pause, timer:skip, timer:sync
```
*(See Pomodoro Timer PRD for full spec)*

### Chat
```
// Member sends
send_message(roomId, text)

// Server broadcasts
new_message(userId, name, text, timestamp)
```

### Room Events
```
member_joined(userId, name, avatarUrl)
member_left(userId)
room_ended()     // host ended room
```

---

## MongoDB Schema — StudyRoom

```js
{
  _id: ObjectId,
  name: String,
  type: String,          // enum: silent | coding | exam | general | late_night
  subjectTag: String,
  hostId: ObjectId,      // ref: User
  members: [ObjectId],   // ref: User
  maxMembers: Number,    // default 6
  isPublic: Boolean,
  inviteCode: String,    // 6-char unique
  timerMode: String,     // pomodoro | continuous
  workDuration: Number,
  isActive: Boolean,
  createdAt: Date,
  endedAt: Date,
}
```

---

## MongoDB Schema — Message

```js
{
  _id: ObjectId,
  roomId: ObjectId,
  userId: ObjectId,
  text: String,
  createdAt: Date,
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rooms` | Create room |
| GET | `/api/rooms` | Browse active public rooms |
| GET | `/api/rooms/:id` | Get room details |
| POST | `/api/rooms/join/:inviteCode` | Join by invite code |
| DELETE | `/api/rooms/:id` | End room (host only) |
| DELETE | `/api/rooms/:id/leave` | Leave room |

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Host leaves | Transfer host to next joined member; if none, end room |
| Room full | Join button disabled, "Room is full" tooltip |
| Member joins mid-Pomodoro | Receives `timer:sync` with current state |
| Camera disabled by member | Their status shows ⚪ "No tracking" — not penalized |
| Network drop | Reconnect logic in socket client; rejoin room state on reconnect |

---

## Out of Scope
- Video/audio calls (WebRTC — Phase 2)
- Persistent chat history
- Room scheduling
- Room themes / customization
- Pinned messages
- Reactions / emoji
