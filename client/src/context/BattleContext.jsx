import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from './SocketContext'

const BattleContext = createContext(null)

export function BattleProvider({ children }) {
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [incoming, setIncoming] = useState(null)       // { battleId, challengerId, challengerName }
  const [pending, setPending] = useState(null)          // { battleId } — challenger waiting for response
  const [notification, setNotification] = useState(null) // transient toast { type: 'rejected' }

  useEffect(() => {
    if (!socket) return

    socket.on('battle:incoming', (data) => setIncoming(data))

    socket.on('battle:challenged', ({ battleId }) => {
      setPending({ battleId })
    })

    socket.on('battle:started', ({ battleId, opponentId, opponentName, duration, startedAt }) => {
      setIncoming(null)
      setPending(null)
      navigate(`/battle/${battleId}`, { state: { opponentId, opponentName, duration, startedAt } })
    })

    socket.on('battle:rejected', () => {
      setPending(null)
      setNotification({ type: 'rejected' })
      setTimeout(() => setNotification(null), 3000)
    })

    socket.on('battle:expired', ({ battleId }) => {
      setIncoming(prev => prev?.battleId === battleId ? null : prev)
      setPending(prev => prev?.battleId === battleId ? null : prev)
    })

    return () => {
      socket.off('battle:incoming')
      socket.off('battle:challenged')
      socket.off('battle:started')
      socket.off('battle:rejected')
      socket.off('battle:expired')
    }
  }, [socket, navigate])

  function challengeUser(targetUserId) {
    socket?.emit('battle:challenge', { targetUserId })
  }

  function acceptChallenge() {
    if (!incoming) return
    socket?.emit('battle:accept', { battleId: incoming.battleId })
    setIncoming(null)
  }

  function rejectChallenge() {
    if (!incoming) return
    socket?.emit('battle:reject', { battleId: incoming.battleId })
    setIncoming(null)
  }

  return (
    <BattleContext.Provider value={{ challengeUser, incoming, pending, notification, acceptChallenge, rejectChallenge }}>
      {children}
    </BattleContext.Provider>
  )
}

export function useBattle() {
  return useContext(BattleContext)
}
