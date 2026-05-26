const router = require('express').Router()
const ctrl = require('../controllers/sessions.controller')
const requireAuth = require('../middleware/requireAuth')

router.use(requireAuth)

router.post('/',           ctrl.startSession)
router.patch('/:id/end',   ctrl.endSession)
router.get('/history',     ctrl.getHistory)

module.exports = router
