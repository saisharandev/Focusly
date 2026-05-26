const router = require('express').Router()
const ctrl = require('../controllers/dashboard.controller')
const requireAuth = require('../middleware/requireAuth')

router.use(requireAuth)

router.get('/stats',        ctrl.getStats)
router.get('/active-rooms', ctrl.getActiveRooms)

module.exports = router
