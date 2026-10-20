let io = null

export function setIO(instance) {
  io = instance
}

export function emitToUser(userId, event, payload) {
  if (!io || !userId) return
  io.to(`user:${userId}`).emit(event, payload)
}

export function emitToChannel(channelId, event, payload) {
  if (!io || !channelId) return
  io.to(`channel:${channelId}`).emit(event, payload)
}

export function broadcastPresence(online) {
  if (!io) return
  io.emit('presence:update', { online })
}
