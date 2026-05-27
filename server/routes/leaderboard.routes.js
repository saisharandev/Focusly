const express = require('express')
const router = express.Router()
const requireAuth = require('../middleware/requireAuth')
const ctrl = require('../controllers/leaderboard.controller')

router.use(requireAuth)
router.get('/global', ctrl.getGlobal)
router.get('/university', ctrl.getUniversity)
router.get('/friends', ctrl.getFriends)
router.get('/me', ctrl.getMe)

module.exports = router
