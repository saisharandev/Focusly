const router = require('express').Router()
const ctrl = require('../controllers/analytics.controller')
const requireAuth = require('../middleware/requireAuth')

router.use(requireAuth)

router.get('/weekly', ctrl.getWeekly)

module.exports = router
