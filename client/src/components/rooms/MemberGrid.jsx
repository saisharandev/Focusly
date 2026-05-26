import MemberCard from './MemberCard'

export default function MemberGrid({ members, hostId, currentUserId }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {members.map(member => (
        <MemberCard
          key={member.userId}
          member={member}
          isHost={member.userId === hostId}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}
