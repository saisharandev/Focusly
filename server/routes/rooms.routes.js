const router = require('express').Router()
const ctrl = require('../controllers/rooms.controller')
const requireAuth = require('../middleware/requireAuth')

router.use(requireAuth)

router.post('/',                 ctrl.createRoom)
router.get('/',                  ctrl.getRooms)
router.get('/:id',               ctrl.getRoom)
router.post('/join/:code',       ctrl.joinByCode)
router.delete('/:id/leave',      ctrl.leaveRoom)
router.delete('/:id',            ctrl.endRoom)

module.exports = router
