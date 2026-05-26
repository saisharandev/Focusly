const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:  { type: String, required: true, select: false },
    university:    { type: String, default: '' },
    avatarUrl:     { type: String, default: '' },
    timezone:      { type: String, default: 'UTC' },
    lastActiveAt:  { type: Date, default: Date.now },

    // Stats — updated on session end
    totalStudyMinutes: { type: Number, default: 0 },
    currentStreak:     { type: Number, default: 0 },
    longestStreak:     { type: Number, default: 0 },
    lastStudyDate:     { type: Date, default: null },

    // Social — people this user has shared a room with
    studiedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
