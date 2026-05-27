module.exports = function webrtcHandlers(io, socket) {
  // Forward to a specific user by targeting their personal room
  function toUser(userId, event, payload) {
    io.to(`user:${userId}`).emit(event, payload)
  }

  socket.on('webrtc:join-video', ({ roomId }) => {
    socket.to(roomId).emit('webrtc:user-joined-video', { userId: socket.userId })
  })

  socket.on('webrtc:leave-video', ({ roomId }) => {
    socket.to(roomId).emit('webrtc:user-left-video', { userId: socket.userId })
  })

  socket.on('webrtc:offer', ({ targetUserId, sdp }) => {
    toUser(targetUserId, 'webrtc:offer', { fromUserId: socket.userId, sdp })
  })

  socket.on('webrtc:answer', ({ targetUserId, sdp }) => {
    toUser(targetUserId, 'webrtc:answer', { fromUserId: socket.userId, sdp })
  })

  socket.on('webrtc:ice', ({ targetUserId, candidate }) => {
    toUser(targetUserId, 'webrtc:ice', { fromUserId: socket.userId, candidate })
  })
}
