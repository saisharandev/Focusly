# PRD 09 — Achievements & Badges

**Phase:** 3  
**Displayed on:** Profile page, post-session report, toast notifications  
**No dedicated route — shown on profile.**

---

## Problem
Streaks and leaderboards reward consistency and volume. Achievements reward milestones and behaviour patterns — they're surprise rewards that make the product feel alive.

---

## User Stories
- As a user, I want to unlock badges for hitting study milestones so I feel rewarded.
- As a user, I want to see all available achievements so I know what to work towards.
- As a user, I want to be notified when I unlock an achievement.

---

## Achievement List

### Focus Achievements
| Badge | Condition | Icon |
|-------|-----------|------|
| First Focus | Complete first session | 🎯 |
| Deep Focus | Achieve 90%+ focus score | 🧠 |
| Laser Mode | 60-min session with 95%+ focus | ⚡ |
| Iron Will | Complete session despite 5+ distractions | 🛡️ |

### Time Achievements
| Badge | Condition | Icon |
|-------|-----------|------|
| Getting Started | 10 total hours | ⏱ |
| 50 Hour Club | 50 total hours | 🌟 |
| 100 Hour Club | 100 total hours | 💎 |
| Marathon | Single session 3h+ | 🏃 |
| Night Owl | Session between 12AM–4AM | 🦉 |
| Early Bird | Session before 7AM | 🌅 |

### Streak Achievements
| Badge | Condition | Icon |
|-------|-----------|------|
| Getting Started | 3-day streak | 🔥 |
| One Week Strong | 7-day streak | 🔥🔥 |
| Consistent | 14-day streak | 💪 |
| Consistency King | 30-day streak | 👑 |
| Legendary | 100-day streak | 🏆 |

### Social Achievements
| Badge | Condition | Icon |
|-------|-----------|------|
| Study Buddy | Join first group room | 👥 |
| Room Host | Host a room with 3+ members | 🎙 |
| Grinder | Study with same person 5 times | 🤝 |

---

## Achievement Check Logic

Checks run **after every session save** and **after streak update**.

```js
async function checkAchievements(userId) {
  const user = await User.findById(userId).populate('achievements');
  const sessions = await StudySession.find({ userId });
  const unlocked = user.achievements.map(a => a.code);

  const toUnlock = [];

  // Example checks
  if (!unlocked.includes('first_focus') && sessions.length >= 1)
    toUnlock.push('first_focus');

  if (!unlocked.includes('100_hour_club')) {
    const totalHours = sessions.reduce((s, x) => s + x.actualDuration, 0) / 60;
    if (totalHours >= 100) toUnlock.push('100_hour_club');
  }

  // ... more checks

  if (toUnlock.length > 0) {
    await UserAchievement.insertMany(toUnlock.map(code => ({ userId, code, unlockedAt: new Date() })));
    return toUnlock; // return to trigger notification
  }
}
```

---

## Notification
When an achievement unlocks:
- Toast notification slides in (bottom-right)
- Shows badge icon + name + "Achievement Unlocked!"
- Auto-dismisses after 5 seconds
- If multiple unlock at once — queue them with 1.5s delay between

---

## Profile Display

**Achievements Section on Profile:**
- Grid of badge cards (locked ones shown dimmed with "???" label)
- Filter: All | Unlocked | Locked
- Click any badge → modal with full description and unlock date

---

## MongoDB Schema

```js
// Achievement definitions (static, in code — not DB)
const ACHIEVEMENTS = {
  first_focus: { name: 'First Focus', description: '...', icon: '🎯', category: 'focus' },
  // ...
}

// User achievement records (in DB)
UserAchievement {
  _id: ObjectId,
  userId: ObjectId,
  code: String,       // matches key in ACHIEVEMENTS
  unlockedAt: Date,
}
```

---

## API Endpoints

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/api/achievements` | All achievement definitions (static) |
| GET | `/api/achievements/me` | User's unlocked achievements |

---

## Out of Scope
- Achievement points / XP system
- Achievement sharing to social media
- Custom/community achievements
- Rare or secret achievements
