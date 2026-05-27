const { customAlphabet } = require('nanoid')
const StudyRoom = require('../models/StudyRoom')
const User = require('../models/User')
const asyncHandler = require('../middleware/asyncHandler')

const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6)

exports.createRoom = asyncHandler(async (req, res) => {
  const { name, type, subjectTag, isPublic, maxMembers, timerMode, workDuration, videoEnabled } = req.body
  if (!name) return res.status(400).json({ message: 'Room name is required' })

  let inviteCode
  let attempts = 0
  while (attempts < 5) {
    inviteCode = generateCode()
    const exists = await StudyRoom.findOne({ inviteCode })
    if (!exists) break
    attempts++
  }

  const room = await StudyRoom.create({
    name,
    type: type || 'general',
    subjectTag: subjectTag || '',
    hostId: req.user.id,
    members: [req.user.id],
    maxMembers: maxMembers || 6,
    isPublic: isPublic !== false,
    inviteCode,
    timerMode: timerMode || 'pomodoro',
    workDuration: workDuration || 25,
    videoEnabled: videoEnabled === true,
  })

  await room.populate('members', 'name avatarUrl')
  await room.populate('hostId', 'name avatarUrl')
  res.status(201).json({ room })
})

exports.getRooms = asyncHandler(async (req, res) => {
  const { subject, type } = req.query

  const filter = { isActive: true, isPublic: true }
  if (subject) filter.subjectTag = { $regex: subject, $options: 'i' }
  if (type) filter.type = type

  const rooms = await StudyRoom.find(filter)
    .populate('members', 'name avatarUrl')
    .populate('hostId', 'name')
    .sort({ createdAt: -1 })

  res.json({ rooms })
})

exports.getRoom = asyncHandler(async (req, res) => {
  const room = await StudyRoom.findById(req.params.id)
    .populate('members', 'name avatarUrl')
    .populate('hostId', 'name avatarUrl')

  if (!room || !room.isActive) return res.status(404).json({ message: 'Room not found' })
  res.json({ room })
})

exports.joinByCode = asyncHandler(async (req, res) => {
  const room = await StudyRoom.findOne({ inviteCode: req.params.code, isActive: true })
  if (!room) return res.status(404).json({ message: 'Room not found' })
  if (room.members.length >= room.maxMembers && !room.members.includes(req.user.id)) {
    return res.status(400).json({ message: 'Room is full' })
  }

  await StudyRoom.findByIdAndUpdate(room._id, {
    $addToSet: { members: req.user.id },
  })

  const updated = await StudyRoom.findById(room._id)
    .populate('members', 'name avatarUrl')
    .populate('hostId', 'name avatarUrl')

  res.json({ room: updated })
})

exports.leaveRoom = asyncHandler(async (req, res) => {
  const room = await StudyRoom.findById(req.params.id)
  if (!room || !room.isActive) return res.status(404).json({ message: 'Room not found' })

  await StudyRoom.findByIdAndUpdate(room._id, {
    $pull: { members: req.user.id },
  })

  const updated = await StudyRoom.findById(room._id)

  if (updated.members.length === 0) {
    await StudyRoom.findByIdAndUpdate(room._id, { isActive: false, endedAt: new Date() })
  } else if (room.hostId.toString() === req.user.id) {
    await StudyRoom.findByIdAndUpdate(room._id, { hostId: updated.members[0] })
  }

  res.json({ message: 'Left room' })
})

exports.endRoom = asyncHandler(async (req, res) => {
  const room = await StudyRoom.findById(req.params.id)
  if (!room) return res.status(404).json({ message: 'Room not found' })
  if (room.hostId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Only the host can end the room' })
  }

  await StudyRoom.findByIdAndUpdate(room._id, { isActive: false, endedAt: new Date() })
  res.json({ message: 'Room ended' })
})
