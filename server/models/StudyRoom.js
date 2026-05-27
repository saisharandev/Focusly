const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    type:        {
      type: String,
      enum: ['silent', 'coding', 'exam', 'general', 'late_night'],
      default: 'general',
    },
    subjectTag:  { type: String, default: '' },
    hostId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxMembers:  { type: Number, default: 6 },
    isPublic:    { type: Boolean, default: true },
    inviteCode:  { type: String, unique: true },
    timerMode:   { type: String, enum: ['pomodoro', 'continuous'], default: 'pomodoro' },
    workDuration:{ type: Number, default: 25 }, // minutes
    videoEnabled:{ type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    endedAt:     { type: Date, default: null },
  },
  { timestamps: true }
)

roomSchema.index({ isActive: 1, isPublic: 1 })

module.exports = mongoose.model('StudyRoom', roomSchema)
