const mongoose = require('mongoose')
const StudySession = require('../models/StudySession')
const StudyRoom = require('../models/StudyRoom')
const User = require('../models/User')
const asyncHandler = require('../middleware/asyncHandler')
const { startOfDayUTC } = require('../utils/date')

exports.getStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id)
  const todayStart = startOfDayUTC(new Date())
  const todayEnd = new Date(todayStart.getTime() + 86_400_000)

  const sessions = await StudySession.find({
    userId,
    startedAt: { $gte: todayStart, $lt: todayEnd },
    status: 'completed',
  })

  const todayMinutes = sessions.reduce((s, sess) => s + (sess.actualDuration || 0), 0)
  const avgFocusScore = sessions.length
    ? Math.round(sessions.reduce((s, sess) => s + sess.focusScore, 0) / sessions.length)
    : 0

  const user = await User.findById(req.user.id).select('currentStreak')

  res.json({
    todayMinutes,
    currentStreak: user?.currentStreak || 0,
    avgFocusScore,
    sessionCount: sessions.length,
    studiedToday: todayMinutes > 0,
  })
})

exports.getActiveRooms = asyncHandler(async (req, res) => {
  const rooms = await StudyRoom.find({ isActive: true, isPublic: true })
    .populate('members', 'name avatarUrl')
    .populate('hostId', 'name')
    .sort({ createdAt: -1 })
    .limit(4)

  res.json({ rooms })
})
