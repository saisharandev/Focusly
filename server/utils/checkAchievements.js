const UserAchievement = require('../models/UserAchievement')
const StudySession = require('../models/StudySession')
const User = require('../models/User')
const ACHIEVEMENTS = require('./achievements')

async function checkAchievements(userId) {
  const [user, sessions, existing] = await Promise.all([
    User.findById(userId),
    StudySession.find({ userId, status: 'completed' }),
    UserAchievement.find({ userId }).select('code'),
  ])

  const unlocked = new Set(existing.map(a => a.code))
  const toUnlock = []

  function maybe(code, condition) {
    if (!unlocked.has(code) && condition) toUnlock.push(code)
  }

  const totalHours = sessions.reduce((s, x) => s + (x.actualDuration || 0), 0) / 60

  // Focus
  maybe('first_focus', sessions.length >= 1)
  maybe('deep_focus', sessions.some(s => (s.focusScore || 0) >= 90))
  maybe('laser_mode', sessions.some(s => s.actualDuration >= 60 && (s.focusScore || 0) >= 95))
  maybe('iron_will', sessions.some(s => (s.distractionCount || 0) >= 5))

  // Time
  maybe('getting_started_time', totalHours >= 10)
  maybe('fifty_hours', totalHours >= 50)
  maybe('hundred_hours', totalHours >= 100)
  maybe('marathon', sessions.some(s => s.actualDuration >= 180))
  maybe('night_owl', sessions.some(s => {
    const h = new Date(s.startedAt).getHours()
    return h >= 0 && h < 4
  }))
  maybe('early_bird', sessions.some(s => new Date(s.startedAt).getHours() < 7))

  // Streaks
  const longestStreak = user.longestStreak || 0
  maybe('getting_started_streak', longestStreak >= 3)
  maybe('one_week_strong', longestStreak >= 7)
  maybe('consistent', longestStreak >= 14)
  maybe('consistency_king', longestStreak >= 30)
  maybe('legendary', longestStreak >= 100)

  // Social
  maybe('study_buddy', (user.studiedWith || []).length > 0)
  const studiedWithCounts = {}
  ;(user.studiedWith || []).forEach(id => {
    const key = id.toString()
    studiedWithCounts[key] = (studiedWithCounts[key] || 0) + 1
  })
  maybe('grinder', Object.values(studiedWithCounts).some(c => c >= 5))

  if (toUnlock.length === 0) return []

  await UserAchievement.insertMany(
    toUnlock.map(code => ({ userId, code, unlockedAt: new Date() })),
    { ordered: false }
  ).catch(() => {})

  return toUnlock.map(code => ({ code, ...ACHIEVEMENTS[code] }))
}

module.exports = checkAchievements
