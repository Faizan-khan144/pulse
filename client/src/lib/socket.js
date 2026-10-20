import { io } from 'socket.io-client'
import { getToken } from './api'

const SOCKET_ORIGIN = (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '')
const LIVE = import.meta.env.VITE_REALTIME === 'live' || import.meta.env.DEV

let socket = null

export function connectSocket() {
  if (socket) return socket
  const token = getToken()
  if (!token || !LIVE) return null
  socket = io(SOCKET_ORIGIN || undefined, { auth: { token }, transports: ['websocket', 'polling'] })
  return socket
}

export function getSocket() {
  return socket || connectSocket()
}

export function disconnectSocket() {
  if (!socket) return
  socket.disconnect()
  socket = null
}
