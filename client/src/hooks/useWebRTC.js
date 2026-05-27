import { useState, useEffect, useRef } from 'react'

const ICE_SERVERS = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  {
    urls: [
      'turn:openrelay.metered.ca:80',
      'turn:openrelay.metered.ca:443',
      'turn:openrelay.metered.ca:80?transport=tcp',
    ],
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
]

export default function useWebRTC({ roomId, socket, enabled }) {
  const pcsRef = useRef({})
  const localStreamRef = useRef(null)
  const [remoteStreams, setRemoteStreams] = useState({})

  function setRemoteStream(userId, stream) {
    setRemoteStreams(prev => ({ ...prev, [userId]: stream }))
  }

  function removeRemoteStream(userId) {
    setRemoteStreams(prev => {
      const next = { ...prev }
      delete next[userId]
      return next
    })
  }

  function makePc(userId) {
    if (pcsRef.current[userId]) return pcsRef.current[userId]

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('webrtc:ice', { targetUserId: userId, candidate })
      }
    }

    pc.ontrack = (e) => {
      setRemoteStream(userId, e.streams[0])
    }

    pcsRef.current[userId] = pc
    return pc
  }

  function addLocalTracks(pc) {
    const stream = localStreamRef.current
    if (!stream) return
    const existingTracks = pc.getSenders().map(s => s.track)
    stream.getTracks().forEach(track => {
      if (!existingTracks.includes(track)) pc.addTrack(track, stream)
    })
  }

  function closePc(userId) {
    pcsRef.current[userId]?.close()
    delete pcsRef.current[userId]
    removeRemoteStream(userId)
  }

  function closeAll() {
    Object.values(pcsRef.current).forEach(pc => pc.close())
    pcsRef.current = {}
    setRemoteStreams({})
  }

  useEffect(() => {
    if (!socket || !enabled) return

    async function onUserJoinedVideo({ userId }) {
      const pc = makePc(userId)
      addLocalTracks(pc)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('webrtc:offer', { targetUserId: userId, sdp: offer })
    }

    async function onOffer({ fromUserId, sdp }) {
      const pc = makePc(fromUserId)
      addLocalTracks(pc)
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('webrtc:answer', { targetUserId: fromUserId, sdp: answer })
    }

    async function onAnswer({ fromUserId, sdp }) {
      const pc = pcsRef.current[fromUserId]
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    }

    async function onIce({ fromUserId, candidate }) {
      const pc = pcsRef.current[fromUserId]
      if (pc && candidate) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)) } catch {}
      }
    }

    function onUserLeftVideo({ userId }) {
      closePc(userId)
    }

    socket.on('webrtc:user-joined-video', onUserJoinedVideo)
    socket.on('webrtc:offer', onOffer)
    socket.on('webrtc:answer', onAnswer)
    socket.on('webrtc:ice', onIce)
    socket.on('webrtc:user-left-video', onUserLeftVideo)

    return () => {
      socket.off('webrtc:user-joined-video', onUserJoinedVideo)
      socket.off('webrtc:offer', onOffer)
      socket.off('webrtc:answer', onAnswer)
      socket.off('webrtc:ice', onIce)
      socket.off('webrtc:user-left-video', onUserLeftVideo)
      closeAll()
    }
  }, [socket, roomId, enabled])

  async function startVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStreamRef.current = stream
    socket?.emit('webrtc:join-video', { roomId })
    return stream
  }

  function stopVideo() {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    socket?.emit('webrtc:leave-video', { roomId })
    closeAll()
  }

  return { remoteStreams, startVideo, stopVideo, localStreamRef }
}
