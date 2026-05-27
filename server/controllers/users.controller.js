const User = require('../models/User')
const StudySession = require('../models/StudySession')
const Subject = require('../models/Subject')
const asyncHandler = require('../middleware/asyncHandler')

async function buildProfileData(userId) {
  const sessions = await StudySession.find({ userId, status: 'completed' })
  const totalMinutes = sessions.reduce((s, x) => s + (x.actualDuration || 0), 0)
  const avgFocusScore = sessions.length > 0
    ? Math.round(sessions.reduce((s, x) => s + (x.focusScore || 0), 0) / sessions.length)
    : 0

  const subjectMap = {}
  sessions.forEach(s => {
    if (!s.subject) return
    subjectMap[s.subject] = (subjectMap[s.subject] || 0) + (s.actualDuration || 0)
  })

  const subjects = await Subject.find({ userId })
  const topSubjects = Object.entries(subjectMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, minutes]) => {
      const sub = subjects.find(s => s.name === name)
      return { name, minutes, color: sub?.color || '#71717A' }
    })

  return { sessions, totalMinutes, avgFocusScore, topSubjects }
}

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  const { sessions, totalMinutes, avgFocusScore, topSubjects } = await buildProfileData(req.user.id)

  const recent = await StudySession.find({ userId: req.user.id })
    .sort({ startedAt: -1 }).limit(5)

  res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      createdAt: user.createdAt,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      lastStudyDate: user.lastStudyDate,
      totalStudyMinutes: user.totalStudyMinutes || 0,
    },
    stats: { totalMinutes, avgFocusScore, sessionCount: sessions.length },
    topSubjects,
    recentSessions: recent,
  })
})

exports.updateMe = asyncHandler(async (req, res) => {
  const { name, university, timezone } = req.body
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      ...(name && { name }),
      ...(university !== undefined && { university }),
      ...(timezone && { timezone }),
    },
    { new: true }
  )
  res.json({ user })
})

exports.getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const { sessions, totalMinutes, avgFocusScore, topSubjects } = await buildProfileData(req.params.id)
  const publicTopSubjects = topSubjects.slice(0, 3)

  res.json({
    user: {
      _id: user._id,
      name: user.name,
      university: user.university,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
    },
    stats: { totalMinutes, avgFocusScore, sessionCount: sessions.length },
    topSubjects: publicTopSubjects,
  })
})
