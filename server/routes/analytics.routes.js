const router = require('express').Router()
const ctrl = require('../controllers/analytics.controller')
const requireAuth = require('../middleware/requireAuth')

router.use(requireAuth)

router.get('/weekly', ctrl.getWeekly)
router.get('/summary', ctrl.getSummary)
router.get('/daily', ctrl.getDaily)
router.get('/subjects', ctrl.getSubjects)
router.get('/focus-trend', ctrl.getFocusTrend)
router.get('/hourly', ctrl.getHourly)
router.get('/heatmap', ctrl.getHeatmap)

module.exports = router
