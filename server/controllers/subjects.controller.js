const Subject = require('../models/Subject')
const StudySession = require('../models/StudySession')
const asyncHandler = require('../middleware/asyncHandler')

exports.getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({ userId: req.user.id, isArchived: false })
    .sort({ lastUsedAt: -1, createdAt: -1 })
  res.json(subjects)
})

exports.upsertSubject = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim()
  if (!name) return res.status(400).json({ message: 'Name is required' })

  let subject = await Subject.findOne({
    userId: req.user.id,
    name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  })

  if (!subject) {
    const color = await Subject.getNextColor(req.user.id)
    subject = await Subject.create({ userId: req.user.id, name, color })
  }

  res.json(subject)
})

exports.getNeglected = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const neglected = await Subject.find({
    userId: req.user.id,
    isArchived: false,
    lastUsedAt: { $lt: sevenDaysAgo, $ne: null },
  }).sort({ lastUsedAt: 1 }).limit(3)
  res.json(neglected)
})

exports.updateSubject = asyncHandler(async (req, res) => {
  const update = {}
  if (req.body.name) update.name = req.body.name.trim()
  if (req.body.color) update.color = req.body.color
  if (req.body.isArchived !== undefined) update.isArchived = req.body.isArchived

  const subject = await Subject.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    update,
    { new: true }
  )
  if (!subject) return res.status(404).json({ message: 'Subject not found' })
  res.json(subject)
})

exports.deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({ _id: req.params.id, userId: req.user.id })
  if (!subject) return res.status(404).json({ message: 'Subject not found' })

  const inUse = await StudySession.exists({ userId: req.user.id, subject: subject.name })
  if (inUse) return res.status(400).json({ message: 'Cannot delete — sessions reference this subject' })

  await subject.deleteOne()
  res.json({ message: 'Deleted' })
})
