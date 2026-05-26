const User = require('../models/User')

module.exports = function chatHandlers(io, socket) {
  socket.on('send_message', async ({ roomId, text }) => {
    if (!text?.trim() || text.length > 200) return

    try {
      const user = await User.findById(socket.userId).select('name avatarUrl')
      io.to(roomId).emit('new_message', {
        userId: socket.userId,
        name: user?.name || 'Unknown',
        avatarUrl: user?.avatarUrl || '',
        text: text.trim(),
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      console.error('[send_message]', err)
    }
  })
}
