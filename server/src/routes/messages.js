import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../auth.js'
import { emitToUser } from '../events.js'
import { memberIds, shapeMessage } from './channels.js'

const router = Router()
router.use(requireAuth)

async function loadMessage(id) {
  return prisma.message.findUnique({
    where: { id },
    include: {
      channel: { select: { id: true, type: true } },
      author: { select: { id: true, name: true, avatarColor: true, isBot: true } },
      reactions: { select: { emoji: true, userId: true } },
    },
  })
}

router.patch('/:id', async (req, res) => {
  const message = await prisma.message.findUnique({ where: { id: req.params.id } })
  if (!message) return res.status(404).json({ error: 'Message not found' })
  if (message.authorId !== req.user.id) return res.status(403).json({ error: 'You can only edit your own messages' })

  const body = String(req.body.body || '').trim()
  if (!body) return res.status(400).json({ error: 'Message cannot be empty' })
  if (body.length > 4000) return res.status(400).json({ error: 'Messages can be up to 4000 characters' })

  await prisma.message.update({ where: { id: message.id }, data: { body, edited: true } })
  const fresh = await loadMessage(message.id)
  const payload = { channelId: fresh.channel.id, message: shapeMessage(fresh) }
  for (const userId of await memberIds(fresh.channel.id)) emitToUser(userId, 'message:updated', payload)
  res.json(payload)
})

router.delete('/:id', async (req, res) => {
  const message = await prisma.message.findUnique({ where: { id: req.params.id } })
  if (!message) return res.status(404).json({ error: 'Message not found' })
  if (message.authorId !== req.user.id) return res.status(403).json({ error: 'You can only delete your own messages' })

  await prisma.message.delete({ where: { id: message.id } })
  const payload = { channelId: message.channelId, messageId: message.id }
  for (const userId of await memberIds(message.channelId)) emitToUser(userId, 'message:deleted', payload)
  res.json(payload)
})

router.post('/:id/reactions', async (req, res) => {
  const emoji = String(req.body.emoji || '').slice(0, 8)
  if (!emoji) return res.status(400).json({ error: 'Pick an emoji' })

  const message = await prisma.message.findUnique({ where: { id: req.params.id } })
  if (!message) return res.status(404).json({ error: 'Message not found' })

  const member = await prisma.channelMember.findUnique({
    where: { channelId_userId: { channelId: message.channelId, userId: req.user.id } },
  })
  if (!member) return res.status(403).json({ error: 'Join this channel to react' })

  const existing = await prisma.reaction.findUnique({
    where: { messageId_userId_emoji: { messageId: message.id, userId: req.user.id, emoji } },
  })

  if (existing) await prisma.reaction.delete({ where: { id: existing.id } })
  else await prisma.reaction.create({ data: { messageId: message.id, userId: req.user.id, emoji } })

  const fresh = await loadMessage(message.id)
  const payload = { channelId: fresh.channel.id, message: shapeMessage(fresh) }
  for (const userId of await memberIds(fresh.channel.id)) emitToUser(userId, 'reaction:updated', payload)
  res.json(payload)
})

export default router
