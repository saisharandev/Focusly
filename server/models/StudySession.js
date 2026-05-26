const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject:         { type: String, default: 'General' },
    goal:            { type: String, default: '' },
    plannedDuration: { type: Number, required: true }, // minutes
    actualDuration:  { type: Number, default: 0 },     // minutes
    focusScore:      { type: Number, default: 0 },     // 0–100
    distractionCount:{ type: Number, default: 0 },
    cameraUsed:      { type: Boolean, default: true },
    startedAt:       { type: Date, default: Date.now },
    endedAt:         { type: Date, default: null },
    status:          {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
  },
  { timestamps: false }
)

sessionSchema.index({ userId: 1, startedAt: -1 })

module.exports = mongoose.model('StudySession', sessionSchema)
