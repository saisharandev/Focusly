const StudySession = require('../models/StudySession')
const asyncHandler = require('../middleware/asyncHandler')
const { startOfDayUTC } = require('../utils/date')

exports.getWeekly = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const days = []

  for (let i = 6; i >= 0; i--) {
    const dayStart = startOfDayUTC(new Date(Date.now() - i * 86_400_000))
    const dayEnd = new Date(dayStart.getTime() + 86_400_000)

    const sessions = await StudySession.find({
      userId,
      startedAt: { $gte: dayStart, $lt: dayEnd },
      status: 'completed',
    })

    const minutes = sessions.reduce((s, sess) => s + (sess.actualDuration || 0), 0)
    days.push({ date: dayStart.toISOString(), minutes })
  }

  res.json({ days })
})
