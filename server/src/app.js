import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import channelRoutes from './routes/channels.js'
import messageRoutes from './routes/messages.js'
import userRoutes from './routes/users.js'

const app = express()

const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || 'http://localhost:5174')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

const allowOrigin = (origin) => !origin || CLIENT_ORIGIN.includes('*') || CLIENT_ORIGIN.includes(origin)

app.use(cors({ origin: (origin, callback) => callback(null, allowOrigin(origin)), credentials: true }))
app.use(express.json({ limit: '256kb' }))

app.get('/api/health', (req, res) => res.json({ ok: true, now: Date.now() }))

app.use('/api/auth', authRoutes)
app.use('/api/channels', channelRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/users', userRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
