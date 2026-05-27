const StudyRoom = require('../models/StudyRoom')
const User = require('../models/User')

module.exports = function roomHandlers(io, socket, roomStates) {
  socket.on('join_room', async (roomId) => {
    try {
      const room = await StudyRoom.findById(roomId)
      if (!room || !room.isActive) return

      socket.join(roomId)
      socket.currentRoom = roomId

      await StudyRoom.findByIdAndUpdate(roomId, {
        $addToSet: { members: socket.userId },
      })

      const user = await User.findById(socket.userId).select('name avatarUrl')
      socket.to(roomId).emit('member_joined', {
        userId: socket.userId,
        name: user?.name,
        avatarUrl: user?.avatarUrl,
      })

      // Restore timer state from DB if server restarted and lost in-memory state
      if (!roomStates.has(roomId) && room.timerState?.phase && room.timerState.phase !== 'IDLE') {
        const ts = room.timerState.toObject ? room.timerState.toObject() : { ...room.timerState }
        roomStates.set(roomId, ts)
      }

      // Sync timer to joining member
      const state = roomStates.get(roomId)
      if (state) {
        const remaining = state.isPaused
          ? state.remainingAtPause
          : Math.max(0, state.duration - (Date.now() - state.startedAt))
        socket.emit('timer:sync', {
          phase: state.phase,
          remaining: Math.max(0, Math.round(remaining / 1000)),
          cycleCount: state.cycleCount,
          isPaused: state.isPaused,
          workDuration: state.workDuration,
          shortBreak: state.shortBreak,
          longBreak: state.longBreak,
        })
      }

      // Send chat history to joining member
      if (room.messages?.length > 0) {
        socket.emit('chat:history', room.messages.map(m => ({
          userId: m.userId?.toString(),
          name: m.name,
          text: m.text,
          timestamp: m.timestamp?.toISOString(),
        })))
      }
    } catch (err) {
      console.error('[join_room]', err)
    }
  })

  socket.on('leave_room', async (roomId) => {
    await handleLeave(io, socket, roomId, roomStates)
  })

  socket.on('disconnect', async () => {
    if (socket.currentRoom) {
      await handleLeave(io, socket, socket.currentRoom, roomStates)
    }
  })
}

async function handleLeave(io, socket, roomId, roomStates) {
  try {
    socket.leave(roomId)
    socket.currentRoom = null

    // Track co-study relationships before removing from room
    const roomBeforeLeave = await StudyRoom.findById(roomId).select('members')
    if (roomBeforeLeave) {
      const coMemberIds = roomBeforeLeave.members
        .map(id => id.toString())
        .filter(id => id !== socket.userId)
      if (coMemberIds.length > 0) {
        await User.findByIdAndUpdate(socket.userId, {
          $addToSet: { studiedWith: { $each: coMemberIds } },
        })
        await User.updateMany(
          { _id: { $in: coMemberIds } },
          { $addToSet: { studiedWith: socket.userId } }
        )
      }
    }

    await StudyRoom.findByIdAndUpdate(roomId, {
      $pull: { members: socket.userId },
    })

    const updated = await StudyRoom.findById(roomId)
    if (!updated) return

    if (updated.members.length === 0) {
      await StudyRoom.findByIdAndUpdate(roomId, { isActive: false, endedAt: new Date() })
      roomStates.delete(roomId)
      io.to(roomId).emit('room_ended')
    } else if (updated.hostId.toString() === socket.userId) {
      const newHostId = updated.members[0]
      await StudyRoom.findByIdAndUpdate(roomId, { hostId: newHostId })
      io.to(roomId).emit('host_changed', { newHostId: newHostId.toString() })
    }

    io.to(roomId).emit('member_left', { userId: socket.userId })
  } catch (err) {
    console.error('[leave_room]', err)
  }
}
