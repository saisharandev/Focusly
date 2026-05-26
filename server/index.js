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
const errorHandler    = require('./middleware/errorHandler')
const initSocket      = require('./socket')

const CLIENT_URL = (process.env.CLIENT_URL || '').trim()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: CLIENT_URL, credentials: true },
})

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth',      authRoutes)
app.use('/api/sessions',  sessionRoutes)
app.use('/api/rooms',     roomRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/analytics', analyticsRoutes)

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
