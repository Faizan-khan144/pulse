import bcrypt from 'bcryptjs'
import { prisma } from '../src/db.js'

const DEMO_EMAIL = 'demo@pulse.app'
const DEMO_PASSWORD = 'demo1234'

const bot = {
  email: 'bot@pulse.local',
  name: 'Pulse',
  title: 'Workspace bot',
  avatarColor: '#0e9384',
  isBot: true,
}

const demo = {
  email: DEMO_EMAIL,
  name: 'Faizan Khan',
  title: 'Product engineer',
  avatarColor: '#f59e0b',
}

const channels = [
  { name: 'general', topic: 'Company-wide announcements and chatter' },
  { name: 'design', topic: 'Crits, specs and screenshots' },
  { name: 'random', topic: 'Non-work banter' },
]

const lines = [
  {
    channel: 'general',
    from: bot,
    body: 'Welcome to Pulse. This is #general - announcements, links and anything the whole team should see.',
  },
  {
    channel: 'general',
    from: bot,
    body: 'Tip: press Enter to send, Shift + Enter for a new line. Hover a message to react, edit or delete it.',
  },
  {
    channel: 'general',
    from: demo,
    body: 'First build is up: channels, DMs, unread badges and reactions all working.',
  },
  {
    channel: 'design',
    from: demo,
    body: 'Composer spec: textarea grows with content, 4000 character cap, Enter sends.',
  },
  {
    channel: 'design',
    from: bot,
    body: 'Spacing scale is 4 / 8 / 12 / 16 / 24. Radius 10px everywhere.',
  },
  {
    channel: 'random',
    from: bot,
    body: 'Coffee count today: 3.',
  },
]

async function upsertUser(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    if (Boolean(data.isBot) !== existing.isBot) {
      return prisma.user.update({ where: { id: existing.id }, data: { isBot: Boolean(data.isBot) } })
    }
    return existing
  }
  return prisma.user.create({
    data: { ...data, passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10) },
  })
}

async function main() {
  const botUser = await upsertUser(bot)
  const demoUser = await upsertUser(demo)

  for (const channelData of channels) {
    let channel = await prisma.channel.findUnique({ where: { name: channelData.name } })
    if (!channel) {
      channel = await prisma.channel.create({
        data: { ...channelData, type: 'PUBLIC', createdById: demoUser.id },
      })
    }
    for (const user of [botUser, demoUser]) {
      const member = await prisma.channelMember.findUnique({
        where: { channelId_userId: { channelId: channel.id, userId: user.id } },
      })
      if (!member) await prisma.channelMember.create({ data: { channelId: channel.id, userId: user.id } })
    }
  }

  const existingMessages = await prisma.message.count()
  if (!existingMessages) {
    for (const line of lines) {
      const channel = await prisma.channel.findUnique({ where: { name: line.channel } })
      const author = line.from.email === bot.email ? botUser : demoUser
      await prisma.message.create({
        data: { channelId: channel.id, authorId: author.id, body: line.body },
      })
    }
  }

  console.log(`seeded ${channels.length} channels, ${lines.length} messages`)
  console.log(`demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
  await prisma.$disconnect()
}

main()
