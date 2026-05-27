const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const asyncHandler = require('../middleware/asyncHandler')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function safeUser(user) {
  const obj = user.toObject()
  delete obj.passwordHash
  return obj
}

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, university } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' })
  }

  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ message: 'Email already registered' })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, passwordHash, university: university || '' })

  const token = signToken(user._id)
  res.status(201).json({ token, user: safeUser(user) })
})

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid email or password' })
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ message: 'Invalid email or password' })

  user.lastActiveAt = new Date()
  await user.save()

  const token = signToken(user._id)
  res.json({ token, user: safeUser(user) })
})

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ user: safeUser(user) })
})

exports.logout = asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out' })
})

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'Email is required' })

  const user = await User.findOne({ email })
  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    // MVP: log to console instead of sending email
    console.log(`[Password Reset] token for ${email}:`, token)
  }

  // Always return success to prevent email enumeration
  res.json({ message: 'If that email exists, a reset link was sent.' })
})

exports.googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body
  if (!credential) return res.status(400).json({ message: 'credential required' })

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  const { sub: googleId, email, name, picture } = ticket.getPayload()

  let user = await User.findOne({ googleId })
  if (!user) {
    user = await User.findOne({ email })
    if (user) {
      // Link Google to existing email/password account
      user.googleId = googleId
      if (!user.avatarUrl) user.avatarUrl = picture
      await user.save()
    } else {
      user = await User.create({ name, email, googleId, avatarUrl: picture })
    }
  }

  const token = signToken(user._id)
  res.json({ token, user: safeUser(user) })
})
