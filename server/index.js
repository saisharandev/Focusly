require('dotenv').config()
const http = require('http')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const { Server } = require('socket.io')

const authRoutes      = require('./routes/auth.routes')
const sessionRoutes   = require('./routes/sessions.routes')
const roomRoutes      = require('./routes/rooms.routes')
const dashboardRoutes = require('./routes/dashboard.routes')
const analyticsRoutes = require('./routes/analytics.routes')
const leaderboardRoutes = require('./routes/leaderboard.routes')
const errorHandler    = require('./middleware/errorHandler')
const initSocket      = require('./socket')

const CLIENT_URL = (process.env.CLIENT_URL || '').trim()

function allowedOrigin(origin, callback) {
  if (!origin) return callback(null, true)
  if (origin === CLIENT_URL) return callback(null, true)
  if (origin.endsWith('.vercel.app')) return callback(null, true)
  if (origin.includes('localhost')) return callback(null, true)
  callback(new Error('Not allowed by CORS'))
}

const corsOptions = { origin: allowedOrigin, credentials: true }

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: corsOptions })

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// Routes
app.use('/api/auth',      authRoutes)
app.use('/api/sessions',  sessionRoutes)
app.use('/api/rooms',     roomRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Error handler (must be last)
app.use(errorHandler)

// Socket.IO
initSocket(io)

// Connect DB and start
const PORT = process.env.PORT || 5000
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    server.listen(PORT, () => console.log(`Server running on :${PORT}`))
  })
  .catch(err => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
