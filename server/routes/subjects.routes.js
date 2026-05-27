const express = require('express')
const router = express.Router()
const requireAuth = require('../middleware/requireAuth')
const ctrl = require('../controllers/subjects.controller')

router.use(requireAuth)
router.get('/neglected', ctrl.getNeglected)   // must be before /:id
router.get('/', ctrl.getSubjects)
router.post('/', ctrl.upsertSubject)
router.patch('/:id', ctrl.updateSubject)
router.delete('/:id', ctrl.deleteSubject)

module.exports = router
