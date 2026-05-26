# PRD 01 — Authentication

**Phase:** 1 (MVP)  
**Pages:** `/login`, `/signup`, `/forgot-password`  
**Status:** Build first — everything gates behind this

---

## Problem
Users need accounts to persist sessions, streaks, and room history. Auth also enables the social layer (finding friends, rooms).

---

## User Stories
- As a new user, I want to sign up with my email and password so I can create a profile.
- As a returning user, I want to log in and be taken directly to my dashboard.
- As a user, I want my session to persist so I don't log in every time I open the app.
- As a user, I want to recover my account if I forget my password.

---

## Pages

### `/signup`
**Fields:**
- Full name
- Email
- Password (min 8 chars)
- Confirm password
- University name (optional but encouraged — used for leaderboard filtering later)

**Behaviour:**
- Validate email format client-side before submit
- Show password strength indicator
- On success → redirect to `/dashboard`
- On failure → inline error messages (not alerts)

**UI Notes:**
- Animated background (floating gradient blobs)
- Card centered on screen with glassmorphism effect
- "Already have an account? Log in" link at bottom

---

### `/login`
**Fields:**
- Email
- Password
- "Remember me" checkbox

**Behaviour:**
- JWT stored in `httpOnly` cookie OR `localStorage` (decide one, document it)
- On success → redirect to `/dashboard`
- On failure → "Invalid email or password" (do not specify which — security)
- "Forgot password?" link below password field

**UI Notes:**
- Same aesthetic as signup
- Subtle animation on form card entry

---

### `/forgot-password`
**Flow:**
1. User enters email
2. System sends reset link (mock in dev — just log the token to console)
3. User clicks link → `/reset-password?token=xxx`
4. User enters new password

**MVP Shortcut:** For Phase 1, implement the email input + success message UI only. Actual email sending (via Nodemailer or Resend) can be wired in Phase 2.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account, return JWT |
| POST | `/api/auth/login` | Verify credentials, return JWT |
| GET | `/api/auth/me` | Return current user from token |
| POST | `/api/auth/logout` | Clear session |
| POST | `/api/auth/forgot-password` | Trigger reset flow |
| POST | `/api/auth/reset-password` | Update password via token |

---

## MongoDB Schema — User

```js
{
  _id: ObjectId,
  name: String,           // required
  email: String,          // required, unique, lowercase
  passwordHash: String,   // bcrypt, never returned in responses
  university: String,     // optional
  avatarUrl: String,      // default avatar initially
  createdAt: Date,
  lastActiveAt: Date,

  // Stats — updated by session logic
  totalStudyMinutes: Number,   // default 0
  currentStreak: Number,       // default 0
  longestStreak: Number,       // default 0
  lastStudyDate: Date,
}
```

---

## Protected Routes
All routes except `/login`, `/signup`, `/forgot-password` require a valid JWT. Implement a middleware `requireAuth` that:
1. Reads token from Authorization header or cookie
2. Verifies with `jsonwebtoken`
3. Attaches `req.user` to request
4. Returns 401 if invalid/expired

---

## Out of Scope
- Google / GitHub OAuth (Phase 2)
- Email verification on signup
- 2FA
- Avatar upload on signup (add to profile settings later)
