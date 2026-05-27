const mongoose = require('mongoose')

const PALETTE = ['#14B8A6', '#A855F7', '#F59E0B', '#3B82F6', '#10B981', '#F97316', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444']

const subjectSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:       { type: String, required: true, trim: true },
  color:      { type: String, default: '#14B8A6' },
  isArchived: { type: Boolean, default: false },
  lastUsedAt: { type: Date, default: null },
}, { timestamps: true })

subjectSchema.index({ userId: 1, name: 1 }, { unique: true })
subjectSchema.index({ userId: 1, isArchived: 1 })

subjectSchema.statics.getNextColor = async function(userId) {
  const subjects = await this.find({ userId }).select('color')
  const used = subjects.map(s => s.color)
  return PALETTE.find(c => !used.includes(c)) || PALETTE[subjects.length % PALETTE.length]
}

module.exports = mongoose.model('Subject', subjectSchema)
