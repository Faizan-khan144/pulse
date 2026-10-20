import 'dotenv/config'
import http from 'http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

import app from './app.js'
import { SECRET } from './auth.js'
import { broadcastPresence, setIO } from './events.js'
import { prisma } from './db.js'

const server = http.createServer(app)

const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || 'http://localhost:5174')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

const allowOrigin = (origin) => !origin || CLIENT_ORIGIN.includes('*') || CLIENT_ORIGIN.includes(origin)

const io = new Server(server, {
  cors: { origin: (origin, callback) => callback(null, allowOrigin(origin)), credentials: true },
})
setIO(io)

const presence = new Map()

function onlineIds() {
  return [...presence.keys()]
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('No token'))
  try {
    socket.user = jwt.verify(token, SECRET)
    next()
  } catch {
    next(new Error('Invalid token'))
  }
})

io.on('connection', (socket) => {
  const userId = socket.user?.id
  if (!userId) return

  socket.join(`user:${userId}`)
  presence.set(userId, (presence.get(userId) || 0) + 1)
  prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } }).catch(() => {})
  broadcastPresence(onlineIds())

  socket.on('channel:join', async (channelId) => {
    if (!channelId) return
    const member = await prisma.channelMember.findUnique({
      where: { channelId_userId: { channelId, userId } },
    })
    if (member) socket.join(`channel:${channelId}`)
  })

  socket.on('channel:leave', (channelId) => {
    if (channelId) socket.leave(`channel:${channelId}`)
  })

  socket.on('typing', (channelId) => {
    if (!channelId) return
    socket.to(`channel:${channelId}`).emit('typing:update', {
      channelId,
      user: { id: userId, name: socket.user.name },
    })
  })

  socket.on('disconnect', () => {
    const count = (presence.get(userId) || 1) - 1
    if (count <= 0) presence.delete(userId)
    else presence.set(userId, count)
    prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } }).catch(() => {})
    broadcastPresence(onlineIds())
  })
})

const PORT = process.env.PORT || 4100
server.listen(PORT, () => {
  console.log(`pulse server on http://localhost:${PORT}`)
})
