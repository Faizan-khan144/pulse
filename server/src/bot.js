import { prisma } from './db.js'

export async function botReplyText(body, sender) {
  const text = body.toLowerCase()
  const first = String(sender.name || 'there').trim().split(/\s+/)[0]

  if (/\b(?:help|commands?|what can you do)\b/.test(text)) {
    return [
      'I can answer a few setup questions:',
      '- "channels" lists the channels in this workspace',
      '- "team" tells you how many people are here',
      '- "whoami" shows the account you are signed in with',
      'Anything else is better asked in a channel.',
    ].join('\n')
  }

  if (/\b(?:channels?|rooms?)\b/.test(text)) {
    const channels = await prisma.channel.findMany({
      where: { type: 'PUBLIC' },
      orderBy: { createdAt: 'asc' },
      select: { name: true },
    })
    if (!channels.length) {
      return 'There are no channels yet. Use the Channel button in the sidebar to create the first one.'
    }
    const list = channels.map((channel) => `#${channel.name}`).join(', ')
    return `This workspace has ${channels.length} ${channels.length === 1 ? 'channel' : 'channels'}: ${list}. Write in one from the sidebar, or create a new one there.`
  }

  if (/\b(?:team|members?|people)\b/.test(text)) {
    const people = await prisma.user.count({ where: { isBot: false } })
    return `There ${people === 1 ? 'is' : 'are'} ${people} ${people === 1 ? 'person' : 'people'} in this workspace. Open Members on a channel to see who is around.`
  }

  if (/\b(?:whoami|who am i|my account)\b/.test(text)) {
    return sender.title ? `You are ${sender.name}, ${sender.title}.` : `You are ${sender.name}.`
  }

  if (/\b(?:hi|hey|hello|yo|salam|assalam|hola)\b/.test(text)) {
    return `Hey ${first}. This DM is for setup, not small talk. Try "help" to see what I can answer, or open #general for the team.`
  }

  if (/\b(?:thanks|thank you|ty)\b/.test(text)) {
    return 'Anytime.'
  }

  return 'I am the setup bot, not a chatbot. I only answer a few things: "help", "channels", "team" and "whoami". Everything else is better asked in a channel.'
}
