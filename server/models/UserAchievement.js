const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  code: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
})

schema.index({ userId: 1, code: 1 }, { unique: true })

module.exports = mongoose.model('UserAchievement', schema)
