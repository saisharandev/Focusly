import { useNavigate } from 'react-router-dom'
import { Users, Lock } from 'lucide-react'
import Card from '../ui/Card'
import { RoomTypeBadge } from '../ui/Badge'
import Button from '../ui/Button'
import Skeleton from '../ui/Skeleton'

export default function RoomCard({ room }) {
  const navigate = useNavigate()
  const isFull = room.members?.length >= room.maxMembers

  return (
    <Card className="p-5 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-text-primary truncate">{room.name}</h3>
            {!room.isPublic && <Lock size={12} className="text-text-muted flex-shrink-0" />}
          </div>
          {room.subjectTag && (
            <p className="text-xs text-text-muted mt-0.5">{room.subjectTag}</p>
          )}
        </div>
        <RoomTypeBadge type={room.type} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex -space-x-2">
          {room.members?.slice(0, 5).map((m, i) => (
            <div
              key={m._id || i}
              className="w-7 h-7 rounded-full bg-accent-teal/20 border-2 border-bg-surface flex items-center justify-center text-xs text-accent-teal font-semibold"
            >
              {m.name?.[0]?.toUpperCase() || '?'}
            </div>
          ))}
          {room.members?.length > 5 && (
            <div className="w-7 h-7 rounded-full bg-bg-card border-2 border-bg-surface flex items-center justify-center text-xs text-text-muted">
              +{room.members.length - 5}
            </div>
          )}
        </div>
        <span className="text-xs text-text-muted flex items-center gap-1">
          <Users size={12} />
          {room.members?.length}/{room.maxMembers}
        </span>
      </div>

      <Button
        onClick={() => navigate(`/rooms/${room._id}`)}
        variant={isFull ? 'secondary' : 'primary'}
        disabled={isFull}
        size="sm"
        className="w-full"
        title={isFull ? 'Room is full' : ''}
      >
        {isFull ? 'Room Full' : 'Join Room'}
      </Button>
    </Card>
  )
}

RoomCard.Skeleton = function RoomCardSkeleton() {
  return <Skeleton className="h-44" />
}
