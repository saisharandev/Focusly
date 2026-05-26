const StudySession = require('../models/StudySession')
const User = require('../models/User')
const asyncHandler = require('../middleware/asyncHandler')
const { startOfDayUTC } = require('../utils/date')

exports.startSession = asyncHandler(async (req, res) => {
  const { subject, goal, plannedDuration, timerMode, cameraUsed } = req.body
  if (!plannedDuration) return res.status(400).json({ message: 'plannedDuration is required' })

  const session = await StudySession.create({
    userId: req.user.id,
    subject: subject || 'General',
    goal: goal || '',
    plannedDuration,
    cameraUsed: cameraUsed !== false,
    startedAt: new Date(),
    status: 'in_progress',
  })

  res.status(201).json({ sessionId: session._id })
})

exports.endSession = asyncHandler(async (req, res) => {
  const { actualDuration, focusScore, distractionCount, status } = req.body

  const session = await StudySession.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id, status: 'in_progress' },
    {
      actualDuration: actualDuration || 0,
      focusScore: focusScore || 0,
      distractionCount: distractionCount || 0,
      status: status || 'completed',
      endedAt: new Date(),
    },
    { new: true }
  )

  if (!session) return res.status(404).json({ message: 'Session not found' })

  // Update streak only for completed sessions of at least 15 minutes
  if (session.status === 'completed' && session.actualDuration >= 15) {
    const user = await User.findById(req.user.id)
    const today = startOfDayUTC(new Date())
    const lastStudy = user.lastStudyDate ? startOfDayUTC(user.lastStudyDate) : null
    const daysDiff = lastStudy
      ? Math.round((today - lastStudy) / 86_400_000)
      : null

    if (daysDiff === null || daysDiff > 1) {
      user.currentStreak = 1
    } else if (daysDiff === 1) {
      user.currentStreak += 1
    }
    // daysDiff === 0 → already studied today, no change

    user.longestStreak = Math.max(user.longestStreak, user.currentStreak)
    user.lastStudyDate = new Date()
    user.totalStudyMinutes = (user.totalStudyMinutes || 0) + session.actualDuration
    await user.save()
  }

  res.json({ session })
})

exports.getHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const sessions = await StudySession.find({ userId: req.user.id })
    .sort({ startedAt: -1 })
    .skip(skip)
    .limit(Number(limit))

  const total = await StudySession.countDocuments({ userId: req.user.id })

  res.json({ sessions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
})
