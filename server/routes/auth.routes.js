const router = require('express').Router()
const ctrl = require('../controllers/auth.controller')
const requireAuth = require('../middleware/requireAuth')

router.post('/signup',          ctrl.signup)
router.post('/login',           ctrl.login)
router.get('/me',               requireAuth, ctrl.getMe)
router.post('/logout',          ctrl.logout)
router.post('/forgot-password', ctrl.forgotPassword)

module.exports = router
