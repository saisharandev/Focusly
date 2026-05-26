const StudyRoom = require('../models/StudyRoom')

module.exports = function timerHandlers(io, socket, roomStates) {
  async function isHost(roomId) {
    const room = await StudyRoom.findById(roomId).select('hostId')
    return room?.hostId?.toString() === socket.userId
  }

  socket.on('timer:start', async ({ roomId, phase, duration, workDuration, shortBreak, longBreak }) => {
    if (!await isHost(roomId)) return

    const state = {
      phase: phase || 'WORKING',
      duration: (duration || workDuration || 25) * 60 * 1000, // ms
      startedAt: Date.now(),
      cycleCount: 0,
      isPaused: false,
      pausedAt: null,
      remainingAtPause: null,
      workDuration: workDuration || 25,
      shortBreak: shortBreak || 5,
      longBreak: longBreak || 15,
    }
    roomStates.set(roomId, state)

    io.to(roomId).emit('timer:started', {
      phase: state.phase,
      duration: state.duration,
      startedAt: state.startedAt,
      cycleCount: state.cycleCount,
      workDuration: state.workDuration,
      shortBreak: state.shortBreak,
      longBreak: state.longBreak,
    })
  })

  socket.on('timer:pause', async ({ roomId }) => {
    if (!await isHost(roomId)) return

    const state = roomStates.get(roomId)
    if (!state || state.isPaused) return

    const elapsed = Date.now() - state.startedAt
    state.remainingAtPause = Math.max(0, state.duration - elapsed)
    state.isPaused = true
    state.pausedAt = Date.now()

    io.to(roomId).emit('timer:paused', { remainingAtPause: state.remainingAtPause })
  })

  socket.on('timer:resume', async ({ roomId }) => {
    if (!await isHost(roomId)) return

    const state = roomStates.get(roomId)
    if (!state || !state.isPaused) return

    state.startedAt = Date.now() - (state.duration - state.remainingAtPause)
    state.isPaused = false
    state.pausedAt = null

    io.to(roomId).emit('timer:resumed', { startedAt: state.startedAt })
  })

  socket.on('timer:skip', async ({ roomId }) => {
    if (!await isHost(roomId)) return

    const state = roomStates.get(roomId)
    if (!state) return

    const nextPhase = getNextPhase(state)
    state.phase = nextPhase.phase
    state.duration = nextPhase.duration * 60 * 1000
    state.startedAt = Date.now()
    state.isPaused = false
    if (nextPhase.phase === 'WORKING') state.cycleCount += 1

    io.to(roomId).emit('timer:skipped', {
      phase: state.phase,
      duration: state.duration,
      startedAt: state.startedAt,
      cycleCount: state.cycleCount,
    })
  })
}

function getNextPhase(state) {
  if (state.phase === 'WORKING') {
    const isLongBreak = (state.cycleCount + 1) % 4 === 0
    return isLongBreak
      ? { phase: 'LONG_BREAK', duration: state.longBreak }
      : { phase: 'SHORT_BREAK', duration: state.shortBreak }
  }
  return { phase: 'WORKING', duration: state.workDuration }
}
