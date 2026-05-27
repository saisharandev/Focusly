const mongoose = require('mongoose')
const StudySession = require('../models/StudySession')
const Subject = require('../models/Subject')
const asyncHandler = require('../middleware/asyncHandler')
const { startOfDayUTC } = require('../utils/date')

function getDateRange(range) {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  let start = new Date(now)
  if (range === 'last_week') { start.setDate(start.getDate() - 14); end.setDate(end.getDate() - 7) }
  else if (range === 'this_month') { start = new Date(now.getFullYear(), now.getMonth(), 1) }
  else if (range === 'last_30') { start.setDate(start.getDate() - 30) }
  else if (range === 'all_time') { start = new Date(0) }
  else { start.setDate(start.getDate() - 7) }
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

function toDateStr(date) {
  return date.toISOString().slice(0, 10)
}

function daysInRange(start, end) {
  const days = []
  const cursor = new Date(start)
  while (cursor <= end) {
    days.push(toDateStr(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

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

exports.getSummary = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query.range)
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const sessions = await StudySession.aggregate([
    { $match: { userId, status: 'completed', startedAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
        dayMinutes: { $sum: '$actualDuration' },
        dayFocusSum: { $sum: '$focusScore' },
        dayCount: { $sum: 1 },
      },
    },
  ])

  let totalMinutes = 0
  let totalFocusSum = 0
  let totalCount = 0
  let bestDay = null

  for (const row of sessions) {
    totalMinutes += row.dayMinutes
    totalFocusSum += row.dayFocusSum
    totalCount += row.dayCount
    if (!bestDay || row.dayMinutes > bestDay.minutes) {
      bestDay = { date: row._id, minutes: row.dayMinutes }
    }
  }

  res.json({
    totalMinutes,
    avgFocusScore: totalCount > 0 ? Math.round(totalFocusSum / totalCount) : 0,
    sessionCount: totalCount,
    bestDay: bestDay || { date: null, minutes: 0 },
  })
})

exports.getDaily = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query.range)
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const rows = await StudySession.aggregate([
    { $match: { userId, status: 'completed', startedAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
        minutes: { $sum: '$actualDuration' },
        focusSum: { $sum: '$focusScore' },
        count: { $sum: 1 },
      },
    },
  ])

  const byDate = {}
  for (const row of rows) {
    byDate[row._id] = { minutes: row.minutes, avgFocus: Math.round(row.focusSum / row.count) }
  }

  const days = daysInRange(start, end).map(date => ({
    date,
    minutes: byDate[date]?.minutes || 0,
    avgFocus: byDate[date]?.avgFocus || 0,
  }))

  res.json({ days })
})

exports.getSubjects = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query.range)
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const rows = await StudySession.aggregate([
    { $match: { userId, status: 'completed', startedAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: '$subject',
        minutes: { $sum: '$actualDuration' },
      },
    },
    { $sort: { minutes: -1 } },
  ])

  const subjects = await Promise.all(
    rows.map(async row => {
      const doc = await Subject.findOne({ userId: req.user.id, name: row._id })
      return {
        subject: row._id || 'General',
        minutes: row.minutes,
        color: doc?.color || '#71717A',
      }
    })
  )

  res.json({ subjects })
})

exports.getFocusTrend = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query.range)
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const rows = await StudySession.aggregate([
    { $match: { userId, status: 'completed', startedAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
        focusSum: { $sum: '$focusScore' },
        count: { $sum: 1 },
      },
    },
  ])

  const byDate = {}
  for (const row of rows) {
    byDate[row._id] = Math.round(row.focusSum / row.count)
  }

  const days = daysInRange(start, end)
  const result = []

  for (let i = 0; i < days.length; i++) {
    const date = days[i]
    const focusScore = byDate[date] !== undefined ? byDate[date] : null

    const window = days.slice(Math.max(0, i - 6), i + 1)
    const known = window.map(d => byDate[d]).filter(v => v !== undefined)
    const rollingAvg = known.length > 0 ? Math.round(known.reduce((a, b) => a + b, 0) / known.length) : null

    result.push({ date, focusScore, rollingAvg })
  }

  res.json({ trend: result })
})

exports.getHourly = asyncHandler(async (req, res) => {
  const { start, end } = getDateRange(req.query.range)
  const userId = new mongoose.Types.ObjectId(req.user.id)

  const rows = await StudySession.aggregate([
    { $match: { userId, status: 'completed', startedAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { hour: { $hour: '$startedAt' }, day: { $dayOfWeek: '$startedAt' } },
        focusSum: { $sum: '$focusScore' },
        count: { $sum: 1 },
      },
    },
  ])

  const byKey = {}
  for (const row of rows) {
    const day = row._id.day - 1
    const key = `${row._id.hour}-${day}`
    byKey[key] = Math.round(row.focusSum / row.count)
  }

  const grid = []
  for (let hour = 6; hour <= 23; hour++) {
    for (let day = 0; day <= 6; day++) {
      const key = `${hour}-${day}`
      grid.push({ hour, day, avgFocus: byKey[key] !== undefined ? byKey[key] : null })
    }
  }

  res.json({ grid })
})

exports.getHeatmap = asyncHandler(async (req, res) => {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date()
  start.setDate(start.getDate() - 89)
  start.setHours(0, 0, 0, 0)

  const userId = new mongoose.Types.ObjectId(req.user.id)

  const rows = await StudySession.aggregate([
    { $match: { userId, status: 'completed', startedAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
        minutes: { $sum: '$actualDuration' },
      },
    },
  ])

  const byDate = {}
  for (const row of rows) {
    byDate[row._id] = row.minutes
  }

  const days = daysInRange(start, end).map(date => ({
    date,
    minutes: byDate[date] || 0,
  }))

  res.json({ days })
})
