import { useNavigate } from 'react-router-dom'
import { Users, Video } from 'lucide-react'
import Card from '../ui/Card'
import { RoomTypeBadge } from '../ui/Badge'

const STATUS_COLORS = {
  focused:    'bg-accent-teal',
  idle:       'bg-accent-amber',
  distracted: 'bg-accent-red',
  default:    'bg-text-muted',
}

export default function ActiveRoomCard({ room }) {
  const navigate = useNavigate()

  return (
    <Card
      className="p-4 cursor-pointer hover:border-white/20 hover:bg-white/8 transition-all duration-150"
      onClick={() => navigate(`/rooms/${room._id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-text-primary text-sm truncate">{room.name}</p>
            {room.videoEnabled && <Video size={11} className="text-accent-purple flex-shrink-0" />}
          </div>
          {room.subjectTag && (
            <p className="text-xs text-text-muted mt-0.5">{room.subjectTag}</p>
          )}
        </div>
        <RoomTypeBadge type={room.type} />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex -space-x-1.5">
          {room.members?.slice(0, 4).map((m, i) => (
            <div
              key={m._id || i}
              className="w-6 h-6 rounded-full bg-accent-teal/20 border border-bg-surface flex items-center justify-center text-xs text-accent-teal font-semibold"
            >
              {m.name?.[0]?.toUpperCase() || '?'}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Users size={12} />
          {room.members?.length}/{room.maxMembers}
        </div>
      </div>
    </Card>
  )
}
