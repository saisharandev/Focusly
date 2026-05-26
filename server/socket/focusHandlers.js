module.exports = function focusHandlers(io, socket) {
  socket.on('focus_status_update', ({ roomId, status }) => {
    const valid = ['focused', 'idle', 'distracted', 'untracked']
    if (!valid.includes(status)) return

    io.to(roomId).emit('member_status_changed', {
      userId: socket.userId,
      status,
    })
  })
}
