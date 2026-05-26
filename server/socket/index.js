const jwt = require('jsonwebtoken')
const roomHandlers = require('./roomHandlers')
const focusHandlers = require('./focusHandlers')
const chatHandlers = require('./chatHandlers')
const timerHandlers = require('./timerHandlers')

module.exports = function initSocket(io) {
  // roomId → { phase, duration, startedAt, cycleCount, isPaused, pausedAt, remainingAtPause, workDuration, shortBreak, longBreak }
  const roomStates = new Map()

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('No token'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    roomHandlers(io, socket, roomStates)
    focusHandlers(io, socket)
    chatHandlers(io, socket)
    timerHandlers(io, socket, roomStates)
  })
}
