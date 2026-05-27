# PRD 14 — Google OAuth (Sign in with Google)

**Phase:** 2.5 (can implement alongside anything, no dependencies)  
**Cost:** Free forever  
**Approach:** Direct Google Identity Services — no Auth0, no third-party auth service  
**Depends on:** Existing JWT auth backend

---

## Problem
Email/password signup has friction. Users on a study platform often already have Google accounts and want one-click sign-in. Adding Google OAuth removes the biggest barrier to first-time signups.

---

## User Stories
- As a user, I want to sign up instantly with my Google account so I don't have to create a new password.
- As a user, I want to log in with Google if I forgot whether I used email or Google to sign up.
- As an existing email user, I want my account to remain unchanged if someone tries to Google-sign-in with my email.

---

## Architecture: Direct Google OAuth (No Auth0)

Google Identity Services (GIS) handles the OAuth popup entirely in the browser. The frontend receives a signed **Google ID Token** (JWT), sends it to the backend, which verifies it and issues a Focusly app JWT.

```
[Browser]                    [Backend]                     [Google]
  |                              |                              |
  |--click "Sign in w/ Google"-->|                              |
  |<-------- Google popup ---------------------------------->  |
  |<-------- credential (ID token) -------------------------|  |
  |--POST /api/auth/google (credential) -->|                    |
  |                              |--verify ID token ----------->|
  |                              |<--email, name, picture ------|
  |                              |--find/create user            |
  |<-------- { token, user } ----|                              |
```

No ongoing infrastructure. No Auth0 account. No per-MAU pricing.

---

## Backend Changes

### 1. User model — `server/models/User.js`
Add fields:
```js
googleId: { type: String, sparse: true, unique: true },
avatarUrl: { type: String },
```
`sparse: true` — allows null for email/password users, unique constraint only applies when set.

### 2. New dependency
```bash
npm install google-auth-library
```

### 3. New endpoint — `POST /api/auth/google`
```js
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

exports.googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body
  if (!credential) return res.status(400).json({ message: 'credential required' })

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  const { sub: googleId, email, name, picture } = ticket.getPayload()

  // Find by googleId first, then by email (links existing email account)
  let user = await User.findOne({ googleId })
  if (!user) {
    user = await User.findOne({ email })
    if (user) {
      // Link Google to existing email account
      user.googleId = googleId
      user.avatarUrl = user.avatarUrl || picture
      await user.save()
    } else {
      // New user — no password needed
      user = await User.create({ name, email, googleId, avatarUrl: picture })
    }
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: safeUser(user) })
})
```

### 4. Mount in auth routes
```js
router.post('/google', ctrl.googleAuth)
```

### 5. Environment variables
```
GOOGLE_CLIENT_ID=<your-google-client-id>
```

---

## Frontend Changes

### 1. Google Client ID
```
# client/.env
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

### 2. Load GIS script — add to `client/index.html`
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### 3. New component — `client/src/components/auth/GoogleSignInButton.jsx`
```jsx
import { useEffect, useRef } from 'react'

export default function GoogleSignInButton({ onCredential }) {
  const btnRef = useRef(null)

  useEffect(() => {
    if (!window.google) return
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (res) => onCredential(res.credential),
    })
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'filled_black',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: 320,
    })
  }, [])

  return <div ref={btnRef} />
}
```

### 4. Auth pages — `Login.jsx` + `Signup.jsx`
Add divider + `<GoogleSignInButton>` above or below the existing form:
```jsx
// Divider
<div className="flex items-center gap-3 my-4">
  <div className="flex-1 h-px bg-white/10" />
  <span className="text-xs text-text-muted">or</span>
  <div className="flex-1 h-px bg-white/10" />
</div>

<GoogleSignInButton onCredential={handleGoogleCredential} />
```

### 5. AuthContext — add `loginWithGoogle()`
```js
async function loginWithGoogle(credential) {
  const res = await api.post('/api/auth/google', { credential })
  localStorage.setItem('focusly_token', res.data.token)
  dispatch({ type: 'SET_USER', payload: { user: res.data.user, token: res.data.token } })
}
```

---

## Google Cloud Console Setup

1. Go to console.cloud.google.com → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID → Application type: Web
3. Authorized JavaScript origins:
   - `http://localhost:5173`
   - `https://focusly-trail-s-projects.vercel.app` (production Vercel URL)
4. No redirect URIs needed — GIS popup flow handles this internally
5. Copy Client ID → add to `.env` files (both client and server)
6. Enable "People API" (not required but recommended for future profile data)

---

## Edge Cases

| Scenario | Handling |
|----------|---------|
| User signs up via email first, then tries Google with same email | Link accounts — set googleId on existing user |
| User signs up via Google, tries to set password later | Not in scope for now — could add "set password" in Profile |
| Google token expires mid-session | App JWT is still valid — only re-auth via Google needed at next login |
| User revokes Google access | App JWT remains valid until 7-day expiry |

---

## Out of Scope
- Google sign-in on mobile (would need different flow)
- Linking/unlinking Google from Profile page
- Any other social providers (GitHub, Apple)
- Forced re-authentication
