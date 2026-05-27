import { useEffect, useRef } from 'react'
import { MicOff } from 'lucide-react'

function VideoTile({ stream, name, isLocal, isMuted, isCamOff }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative rounded-xl overflow-hidden bg-bg-card border border-white/10 aspect-video flex items-center justify-center">
      {isCamOff || !stream ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-accent-teal/20 flex items-center justify-center text-accent-teal text-xl font-bold">
            {name?.[0]?.toUpperCase() || '?'}
          </div>
          <p className="text-xs text-text-muted">{name}{isLocal ? ' (you)' : ''}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
          style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
        />
      )}

      {/* Name label */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 rounded-lg px-2 py-0.5">
        {isMuted && <MicOff size={10} className="text-accent-red" />}
        <span className="text-xs text-white font-medium">
          {name}{isLocal ? ' (you)' : ''}
        </span>
      </div>
    </div>
  )
}

export default function VideoGrid({ localStream, localCamOff, localMicMuted, remoteStreams, members, currentUserId }) {
  const remoteTiles = Object.entries(remoteStreams).map(([userId, stream]) => {
    const member = members.find(m => m.userId === userId)
    return { userId, stream, name: member?.name || 'User' }
  })

  const totalTiles = (localStream ? 1 : 0) + remoteTiles.length
  const gridClass = totalTiles <= 1
    ? 'grid-cols-1 max-w-md mx-auto'
    : totalTiles === 2
      ? 'grid-cols-2'
      : 'grid-cols-2'

  return (
    <div className={`grid ${gridClass} gap-2`}>
      {localStream && (
        <VideoTile
          stream={localStream}
          name={members.find(m => m.userId === currentUserId)?.name || 'You'}
          isLocal
          isMuted={localMicMuted}
          isCamOff={localCamOff}
        />
      )}
      {remoteTiles.map(({ userId, stream, name }) => (
        <VideoTile key={userId} stream={stream} name={name} isLocal={false} />
      ))}
    </div>
  )
}
