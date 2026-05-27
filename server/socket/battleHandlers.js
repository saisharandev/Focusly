const User = require('../models/User')
const { nanoid } = require('nanoid')

const battles = new Map()

module.exports = function battleHandlers(io, socket) {
  socket.on('battle:challenge', async ({ targetUserId }) => {
    if (!targetUserId || targetUserId === socket.userId) return
    try {
      const battleId = nanoid(10)
      const challenger = await User.findById(socket.userId).select('name')
      battles.set(battleId, {
        id: battleId,
        challengerId: socket.userId,
        challengedId: targetUserId,
        focus: { [socket.userId]: 0, [targetUserId]: 0 },
        status: 'pending',
        endTimer: null,
      })
      io.to(`user:${targetUserId}`).emit('battle:incoming', {
        battleId,
        challengerId: socket.userId,
        challengerName: challenger?.name || 'Someone',
      })
      socket.emit('battle:challenged', { battleId, targetUserId })
      setTimeout(() => {
        const b = battles.get(battleId)
        if (b?.status === 'pending') {
          battles.delete(battleId)
          io.to(`user:${socket.userId}`).emit('battle:expired', { battleId })
          io.to(`user:${targetUserId}`).emit('battle:expired', { battleId })
        }
      }, 30000)
    } catch (err) {
      console.error('[battle:challenge]', err)
    }
  })

  socket.on('battle:accept', async ({ battleId }) => {
    const b = battles.get(battleId)
    if (!b || b.status !== 'pending' || b.challengedId !== socket.userId) return
    try {
      b.status = 'active'
      b.startedAt = Date.now()
      const DURATION = 25 * 60 * 1000
      const [c, d] = await Promise.all([
        User.findById(b.challengerId).select('name'),
        User.findById(b.challengedId).select('name'),
      ])
      io.to(`user:${b.challengerId}`).emit('battle:started', {
        battleId,
        opponentId: b.challengedId,
        opponentName: d?.name || 'Opponent',
        duration: DURATION,
        startedAt: b.startedAt,
      })
      io.to(`user:${b.challengedId}`).emit('battle:started', {
        battleId,
        opponentId: b.challengerId,
        opponentName: c?.name || 'Opponent',
        duration: DURATION,
        startedAt: b.startedAt,
      })
      b.endTimer = setTimeout(() => endBattle(io, battleId), DURATION)
    } catch (err) {
      console.error('[battle:accept]', err)
    }
  })

  socket.on('battle:reject', ({ battleId }) => {
    const b = battles.get(battleId)
    if (!b || b.challengedId !== socket.userId) return
    battles.delete(battleId)
    io.to(`user:${b.challengerId}`).emit('battle:rejected', { battleId })
  })

  socket.on('battle:focus_update', ({ battleId, focusScore }) => {
    const b = battles.get(battleId)
    if (!b || b.status !== 'active') return
    b.focus[socket.userId] = focusScore
    io.to(`user:${b.challengerId}`).emit('battle:score_update', { userId: socket.userId, focusScore })
    io.to(`user:${b.challengedId}`).emit('battle:score_update', { userId: socket.userId, focusScore })
  })

  socket.on('battle:forfeit', ({ battleId }) => {
    const b = battles.get(battleId)
    if (!b || b.status !== 'active') return
    clearTimeout(b.endTimer)
    const winnerId = socket.userId === b.challengerId ? b.challengedId : b.challengerId
    io.to(`user:${b.challengerId}`).emit('battle:ended', { battleId, winnerId, focus: b.focus })
    io.to(`user:${b.challengedId}`).emit('battle:ended', { battleId, winnerId, focus: b.focus })
    battles.delete(battleId)
  })
}

function endBattle(io, battleId) {
  const b = battles.get(battleId)
  if (!b) return
  const winnerId = (b.focus[b.challengerId] || 0) >= (b.focus[b.challengedId] || 0)
    ? b.challengerId : b.challengedId
  io.to(`user:${b.challengerId}`).emit('battle:ended', { battleId, winnerId, focus: b.focus })
  io.to(`user:${b.challengedId}`).emit('battle:ended', { battleId, winnerId, focus: b.focus })
  battles.delete(battleId)
}
