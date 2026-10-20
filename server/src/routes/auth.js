import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../db.js'
import { requireAuth, signToken } from '../auth.js'

const router = Router()

const COLORS = ['#0e9384', '#f59e0b', '#ef4444', '#0ea5e9', '#65a30d', '#f97316', '#0891b2', '#e11d48']

function pickColor(seed) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 9973
  return COLORS[hash % COLORS.length]
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    title: user.title,
    isBot: user.isBot,
    avatarColor: user.avatarColor,
    createdAt: user.createdAt,
  }
}

async function generalChannel() {
  const existing = await prisma.channel.findUnique({ where: { name: 'general' } })
  if (existing) return existing
  return prisma.channel.create({ data: { name: 'general', topic: 'Company-wide announcements and chatter' } })
}

router.post('/signup', async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!name || name.length > 60) return res.status(400).json({ error: 'Enter your name' })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const taken = await prisma.user.findUnique({ where: { email } })
  if (taken) return res.status(409).json({ error: 'That email already has an account' })

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      avatarColor: pickColor(email),
    },
  })

  const channel = await generalChannel()
  await prisma.channelMember.create({ data: { channelId: channel.id, userId: user.id } })

  res.status(201).json({ token: signToken(user), user: publicUser(user) })
})

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Email or password is incorrect' })
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Email or password is incorrect' })
  await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } })
  res.json({ token: signToken(user), user: publicUser(user) })
})

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) return res.status(404).json({ error: 'Account not found' })
  res.json({ user: publicUser(user) })
})

export { publicUser }
export default router
