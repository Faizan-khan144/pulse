import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth } from '../auth.js'
import { emitToUser } from '../events.js'
import { botReplyText } from '../bot.js'

const router = Router()
router.use(requireAuth)

async function membership(channelId, userId) {
  return prisma.channelMember.findUnique({
    where: { channelId_userId: { channelId, userId } },
  })
}

async function memberIds(channelId) {
  const rows = await prisma.channelMember.findMany({ where: { channelId }, select: { userId: true } })
  return rows.map((row) => row.userId)
}

function shapeMessage(message) {
  const grouped = new Map()
  for (const reaction of message.reactions || []) {
    const bucket = grouped.get(reaction.emoji) || { emoji: reaction.emoji, users: [] }
    bucket.users.push(reaction.userId)
    grouped.set(reaction.emoji, bucket)
  }
  return {
    id: message.id,
    body: message.body,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    edited: message.edited,
    author: message.author,
    reactions: [...grouped.values()],
  }
}

const ensured = new Set()

const BOT_LINES = [
  "Welcome to Pulse. I'm the workspace bot: this DM is where I leave setup notes, not small talk.",
  'Start in #general, create a channel when the team needs one, or open a DM from the left. Enter sends, Shift + Enter starts a new line.',
  'Type "help" to see the setup questions I can answer.',
]

async function createBotReply(channelId, body, senderId) {
  try {
    const botMember = await prisma.channelMember.findFirst({
      where: { channelId, user: { isBot: true }, channel: { type: 'DM' } },
      select: { userId: true },
    })
    if (!botMember || botMember.userId === senderId) return
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true, title: true },
    })
    if (!sender) return
    const reply = await prisma.message.create({
      data: { channelId, authorId: botMember.userId, body: await botReplyText(body, sender) },
      include: {
        author: { select: { id: true, name: true, avatarColor: true, isBot: true } },
        reactions: { select: { emoji: true, userId: true } },
      },
    })
    const payload = { channelId, message: shapeMessage(reply) }
    for (const userId of await memberIds(channelId)) emitToUser(userId, 'message:new', payload)
  } catch {}
}
async function ensureBotDm(userId) {
  if (ensured.has(userId)) return
  let bot = await prisma.user.findFirst({ where: { isBot: true } })
  if (!bot) {
    bot = await prisma.user.create({
      data: {
        email: 'bot@pulse.local',
        name: 'Pulse',
        title: 'Workspace bot',
        avatarColor: '#0e9384',
        isBot: true,
        passwordHash: '!',
      },
    })
  }
  if (bot.id !== userId) {
    const name = `dm:${[userId, bot.id].sort().join(':')}`
    const existing = await prisma.channel.findUnique({ where: { name } })
    if (!existing) {
      const channel = await prisma.channel.create({
        data: {
          name,
          type: 'DM',
          createdById: bot.id,
          members: { create: [{ userId }, { userId: bot.id }] },
        },
      })
      for (const body of BOT_LINES) {
        await prisma.message.create({ data: { channelId: channel.id, authorId: bot.id, body } })
      }
    }
  }
  ensured.add(userId)
}

router.get('/', async (req, res) => {
  await ensureBotDm(req.user.id)

  const memberships = await prisma.channelMember.findMany({
    where: { userId: req.user.id },
    include: {
      channel: {
        include: {
          _count: { select: { members: true } },
          members: { include: { user: { select: { id: true, name: true, avatarColor: true, isBot: true } } } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { name: true } } },
          },
        },
      },
    },
  })

  const channels = []
  for (const item of memberships) {
    const channel = item.channel
    const unread = await prisma.message.count({
      where: {
        channelId: channel.id,
        createdAt: { gt: item.lastReadAt },
        authorId: { not: req.user.id },
      },
    })
    const other = channel.type === 'DM'
      ? channel.members.find((member) => member.user.id !== req.user.id)?.user || null
      : null
    const last = channel.messages[0] || null
    channels.push({
      id: channel.id,
      name: channel.name,
      topic: channel.topic,
      type: channel.type,
      memberCount: channel._count.members,
      unread,
      dmUser: other,
      lastMessage: last
        ? { body: last.body, createdAt: last.createdAt, author: last.author.name }
        : null,
    })
  }

  channels.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'PUBLIC' ? -1 : 1
    if (a.type === 'DM') {
      if (a.dmUser?.isBot !== b.dmUser?.isBot) return a.dmUser?.isBot ? -1 : 1
      return new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
    }
    return a.name.localeCompare(b.name)
  })

  res.json({ channels })
})

router.post('/', async (req, res) => {
  const raw = String(req.body.name || '').trim().toLowerCase()
  const name = raw.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const topic = String(req.body.topic || '').trim().slice(0, 160) || null

  if (name.length < 2 || name.length > 40) {
    return res.status(400).json({ error: 'Channel names need 2-40 letters, numbers or dashes' })
  }

  const existing = await prisma.channel.findUnique({ where: { name } })
  if (existing) return res.status(409).json({ error: 'That channel already exists' })

  const channel = await prisma.channel.create({
    data: {
      name,
      topic,
      type: 'PUBLIC',
      createdById: req.user.id,
      members: { create: { userId: req.user.id } },
    },
  })

  res.status(201).json({ channel: { id: channel.id, name: channel.name, topic: channel.topic, type: channel.type } })
})

router.post('/dm', async (req, res) => {
  const otherId = String(req.body.userId || '')
  if (!otherId || otherId === req.user.id) return res.status(400).json({ error: 'Pick someone to message' })

  const other = await prisma.user.findUnique({ where: { id: otherId }, select: { id: true } })
  if (!other) return res.status(404).json({ error: 'That person no longer exists' })

  const name = `dm:${[req.user.id, otherId].sort().join(':')}`
  let channel = await prisma.channel.findUnique({ where: { name }, include: { _count: { select: { members: true } } } })

  if (!channel) {
    channel = await prisma.channel.create({
      data: {
        name,
        type: 'DM',
        createdById: req.user.id,
        members: { create: [{ userId: req.user.id }, { userId: otherId }] },
      },
      include: { _count: { select: { members: true } } },
    })
  }

  res.json({ channel: { id: channel.id, type: channel.type, name: channel.name, memberCount: channel._count.members } })
})

router.post('/:id/join', async (req, res) => {
  const channel = await prisma.channel.findUnique({ where: { id: req.params.id } })
  if (!channel) return res.status(404).json({ error: 'Channel not found' })
  if (channel.type !== 'PUBLIC') return res.status(403).json({ error: 'You need an invite for this conversation' })

  const existing = await membership(channel.id, req.user.id)
  if (!existing) {
    await prisma.channelMember.create({ data: { channelId: channel.id, userId: req.user.id } })
  }
  res.json({ ok: true, channel: { id: channel.id, name: channel.name } })
})

router.get('/:id', async (req, res) => {
  const mine = await membership(req.params.id, req.user.id)
  if (!mine) return res.status(403).json({ error: 'Join this channel to see it' })

  const channel = await prisma.channel.findUnique({
    where: { id: req.params.id },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, avatarColor: true, title: true, lastSeenAt: true, isBot: true },
          },
        },
      },
    },
  })
  if (!channel) return res.status(404).json({ error: 'Channel not found' })

  res.json({
    channel: {
      id: channel.id,
      name: channel.name,
      topic: channel.topic,
      type: channel.type,
      createdAt: channel.createdAt,
      members: channel.members.map((member) => member.user),
    },
  })
})

router.get('/:id/messages', async (req, res) => {
  const mine = await membership(req.params.id, req.user.id)
  if (!mine) return res.status(403).json({ error: 'Join this channel to read it' })

  const take = Math.min(Number(req.query.limit) || 60, 100)
  const before = req.query.before ? new Date(String(req.query.before)) : null

  const rows = await prisma.message.findMany({
    where: { channelId: req.params.id, ...(before ? { createdAt: { lt: before } } : {}) },
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      author: { select: { id: true, name: true, avatarColor: true, isBot: true } },
      reactions: { select: { emoji: true, userId: true } },
    },
  })

  res.json({ messages: rows.reverse().map(shapeMessage) })
})

router.post('/:id/messages', async (req, res) => {
  const mine = await membership(req.params.id, req.user.id)
  if (!mine) return res.status(403).json({ error: 'Join this channel to post' })

  const body = String(req.body.body || '').trim()
  if (!body) return res.status(400).json({ error: 'Write something first' })
  if (body.length > 4000) return res.status(400).json({ error: 'Messages can be up to 4000 characters' })

  const message = await prisma.message.create({
    data: { channelId: req.params.id, authorId: req.user.id, body },
    include: {
      author: { select: { id: true, name: true, avatarColor: true, isBot: true } },
      reactions: { select: { emoji: true, userId: true } },
    },
  })

  await prisma.channelMember.update({
    where: { channelId_userId: { channelId: req.params.id, userId: req.user.id } },
    data: { lastReadAt: new Date() },
  })

  const payload = { channelId: req.params.id, message: shapeMessage(message) }
  for (const userId of await memberIds(req.params.id)) emitToUser(userId, 'message:new', payload)
  await createBotReply(req.params.id, body, req.user.id)

  res.status(201).json(payload)
})

router.post('/:id/read', async (req, res) => {
  await prisma.channelMember.updateMany({
    where: { channelId: req.params.id, userId: req.user.id },
    data: { lastReadAt: new Date() },
  })
  res.json({ ok: true })
})

export { membership, memberIds, shapeMessage }
export default router
