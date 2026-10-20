import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../auth.js'
import { publicUser } from './auth.js'

const router = Router()
router.use(requireAuth)

const ONLINE_WINDOW = 70 * 1000

router.get('/', async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { name: 'asc' } })
  const now = Date.now()
  res.json({
    users: users.map((user) => ({
      ...publicUser(user),
      self: user.id === req.user.id,
      online: now - new Date(user.lastSeenAt).getTime() < ONLINE_WINDOW,
    })),
  })
})

router.post('/ping', async (req, res) => {
  await prisma.user.update({ where: { id: req.user.id }, data: { lastSeenAt: new Date() } })
  res.json({ ok: true })
})

router.patch('/me', async (req, res) => {
  const name = String(req.body.name || '').trim()
  const title = String(req.body.title || '').trim().slice(0, 80)
  const avatarColor = /^#[0-9a-f]{6}$/i.test(String(req.body.avatarColor || '')) ? req.body.avatarColor : undefined

  if (!name || name.length > 60) return res.status(400).json({ error: 'Enter a name' })

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, title: title || null, ...(avatarColor ? { avatarColor } : {}) },
  })
  res.json({ user: publicUser(user) })
})

export default router
