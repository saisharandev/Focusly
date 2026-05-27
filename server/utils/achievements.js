const ACHIEVEMENTS = {
  // Focus
  first_focus:           { name: 'First Focus',        description: 'Complete your first study session',              icon: '🎯', category: 'focus'  },
  deep_focus:            { name: 'Deep Focus',          description: 'Achieve 90%+ focus score in a session',          icon: '🧠', category: 'focus'  },
  laser_mode:            { name: 'Laser Mode',          description: '60-min session with 95%+ focus score',           icon: '⚡', category: 'focus'  },
  iron_will:             { name: 'Iron Will',           description: 'Complete a session despite 5+ distractions',     icon: '🛡️', category: 'focus'  },
  // Time
  getting_started_time:  { name: 'Getting Started',    description: 'Study for 10 total hours',                       icon: '⏱', category: 'time'   },
  fifty_hours:           { name: '50 Hour Club',        description: 'Study for 50 total hours',                       icon: '🌟', category: 'time'   },
  hundred_hours:         { name: '100 Hour Club',       description: 'Study for 100 total hours',                      icon: '💎', category: 'time'   },
  marathon:              { name: 'Marathon',            description: 'Complete a single session of 3+ hours',          icon: '🏃', category: 'time'   },
  night_owl:             { name: 'Night Owl',           description: 'Study between midnight and 4AM',                 icon: '🦉', category: 'time'   },
  early_bird:            { name: 'Early Bird',          description: 'Start a session before 7AM',                     icon: '🌅', category: 'time'   },
  // Streaks
  getting_started_streak: { name: '3-Day Streak',      description: 'Study 3 days in a row',                          icon: '🔥', category: 'streak' },
  one_week_strong:        { name: 'One Week Strong',   description: '7-day study streak',                              icon: '🔥🔥', category: 'streak' },
  consistent:             { name: 'Consistent',        description: '14-day study streak',                             icon: '💪', category: 'streak' },
  consistency_king:       { name: 'Consistency King',  description: '30-day study streak',                             icon: '👑', category: 'streak' },
  legendary:              { name: 'Legendary',         description: '100-day study streak',                            icon: '🏆', category: 'streak' },
  // Social
  study_buddy:            { name: 'Study Buddy',       description: 'Join your first group room',                      icon: '👥', category: 'social' },
  room_host:              { name: 'Room Host',         description: 'Host a room with 3+ members',                     icon: '🎙', category: 'social' },
  grinder:                { name: 'Grinder',           description: 'Study with the same person 5+ times',             icon: '🤝', category: 'social' },
}

module.exports = ACHIEVEMENTS
