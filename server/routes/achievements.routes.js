const router = require('express').Router()
const requireAuth = require('../middleware/requireAuth')
const UserAchievement = require('../models/UserAchievement')
const ACHIEVEMENTS = require('../utils/achievements')
const asyncHandler = require('../middleware/asyncHandler')

router.get('/', (req, res) => {
  res.json(Object.entries(ACHIEVEMENTS).map(([code, def]) => ({ code, ...def })))
})

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const records = await UserAchievement.find({ userId: req.user.id }).sort({ unlockedAt: -1 })
  res.json(records.map(r => ({
    code: r.code,
    unlockedAt: r.unlockedAt,
    ...ACHIEVEMENTS[r.code],
  })))
}))

module.exports = router
