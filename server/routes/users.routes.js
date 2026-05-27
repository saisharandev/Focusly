const router = require('express').Router()
const ctrl = require('../controllers/users.controller')
const requireAuth = require('../middleware/requireAuth')

router.get('/me', requireAuth, ctrl.getMe)
router.patch('/me', requireAuth, ctrl.updateMe)
router.get('/:id', requireAuth, ctrl.getPublicProfile)

module.exports = router
