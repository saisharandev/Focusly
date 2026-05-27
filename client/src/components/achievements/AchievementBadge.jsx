export default function AchievementBadge({ achievement, unlocked }) {
  return (
    <div className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
      unlocked
        ? 'bg-white/5 border-white/10'
        : 'bg-bg-base border-white/5 opacity-40'
    }`}>
      <span className="text-2xl" style={{ filter: unlocked ? 'none' : 'grayscale(100%)' }}>
        {unlocked ? achievement.icon : '🔒'}
      </span>
      <div>
        <p className="text-xs font-semibold text-text-primary truncate max-w-[80px]">
          {unlocked ? achievement.name : '???'}
        </p>
        {unlocked && (
          <p className="text-[10px] text-text-muted mt-0.5">{achievement.category}</p>
        )}
      </div>
    </div>
  )
}
