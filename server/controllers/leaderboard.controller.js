const mongoose = require('mongoose')
const StudySession = require('../models/StudySession')
const User = require('../models/User')
const asyncHandler = require('../middleware/asyncHandler')

const cache = new Map()
const TTL = 5 * 60 * 1000

function weekStart() {
  const now = new Date()
  const day = now.getUTCDay()
  const d = new Date(now)
  d.setUTCDate(now.getUTCDate() - (day === 0 ? 6 : day - 1))
  d.setUTCHours(0, 0, 0, 0)
  return d
}

async function buildBoard(userIds) {
  const match = { startedAt: { $gte: weekStart() }, status: 'completed' }
  if (userIds) {
    match.userId = { $in: userIds.map(id => new mongoose.Types.ObjectId(String(id))) }
  }
  return StudySession.aggregate([
    { $match: match },
    { $group: { _id: '$userId', totalMinutes: { $sum: '$actualDuration' }, avgFocus: { $avg: '$focusScore' } } },
    { $sort: { totalMinutes: -1, avgFocus: -1 } },
    { $limit: 50 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
    { $unwind: '$u' },
    { $project: { _id: 0, userId: '$_id', name: '$u.name', university: '$u.university', avatarUrl: '$u.avatarUrl', totalMinutes: 1, avgFocus: { $round: ['$avgFocus', 0] } } },
  ])
}

function getCached(key) {
  const e = cache.get(key)
  return e && e.exp > Date.now() ? e.data : null
}
function setCached(key, data) { cache.set(key, { data, exp: Date.now() + TTL }) }

exports.getGlobal = asyncHandler(async (req, res) => {
  const cached = getCached('global')
  if (cached) return res.json(cached)
  const data = await buildBoard()
  setCached('global', data)
  res.json(data)
})

exports.getUniversity = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user.id).select('university')
  if (!me?.university) return res.json([])

  const key = `uni:${me.university}`
  const cached = getCached(key)
  if (cached) return res.json(cached)

  const peers = await User.find({ university: me.university }).select('_id')
  const data = await buildBoard(peers.map(u => u._id))
  setCached(key, data)
  res.json(data)
})

exports.getFriends = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user.id).select('studiedWith')
  const ids = [req.user.id, ...(me?.studiedWith || [])]

  const key = `friends:${req.user.id}`
  const cached = getCached(key)
  if (cached) return res.json(cached)

  const data = await buildBoard(ids)
  setCached(key, data)
  res.json(data)
})

exports.getMe = asyncHandler(async (req, res) => {
  const sessions = await StudySession.find({
    userId: req.user.id,
    startedAt: { $gte: weekStart() },
    status: 'completed',
  })
  const totalMinutes = sessions.reduce((s, x) => s + x.actualDuration, 0)
  const avgFocus = sessions.length
    ? Math.round(sessions.reduce((s, x) => s + x.focusScore, 0) / sessions.length)
    : 0
  res.json({ totalMinutes, avgFocus, weekStart: weekStart() })
})
