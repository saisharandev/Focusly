const User = require('../models/User')
const StudyRoom = require('../models/StudyRoom')

module.exports = function chatHandlers(io, socket) {
  socket.on('send_message', async ({ roomId, text }) => {
    if (!text?.trim() || text.length > 200) return

    try {
      const user = await User.findById(socket.userId).select('name avatarUrl')
      const msg = {
        userId: socket.userId,
        name: user?.name || 'Unknown',
        avatarUrl: user?.avatarUrl || '',
        text: text.trim(),
        timestamp: new Date().toISOString(),
      }

      // Persist — keep last 100 messages, fire-and-forget
      StudyRoom.findByIdAndUpdate(roomId, {
        $push: { messages: { $each: [{ userId: socket.userId, name: msg.name, text: msg.text }], $slice: -100 } },
      }).catch(() => {})

      io.to(roomId).emit('new_message', msg)
    } catch (err) {
      console.error('[send_message]', err)
    }
  })
}
