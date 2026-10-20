import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import {
  Activity,
  ArrowRight,
  AtSign,
  Bell,
  Check,
  ChevronDown,
  Command,
  Hash,
  MessageSquare,
  Minus,
  Pencil,
  Plus,
  Radio,
  Send,
  SmilePlus,
  Terminal,
  Trash2,
  Users,
  Zap,
} from 'lucide-react'
import { useAuth } from '../store/auth'

const features = [
  {
    icon: Hash,
    title: 'Channels that stay tidy',
    body: 'Public rooms for work that everyone should see, and private conversations when it is just two people.',
  },
  {
    icon: Radio,
    title: 'Presence in real time',
    body: 'See who is around before you send. Typing indicators and live message delivery over websockets.',
  },
  {
    icon: Bell,
    title: 'Unread, not unseen',
    body: 'Per-channel read state means the badges clear the moment you catch up, not when you close the tab.',
  },
  {
    icon: SmilePlus,
    title: 'React instead of reply',
    body: 'Quick reactions on every message. A thumbs up beats a message that just says thumbs up.',
  },
  {
    icon: Command,
    title: 'Keyboard first',
    body: 'Enter sends, Shift + Enter breaks the line, and the composer grows with what you type.',
  },
  {
    icon: Activity,
    title: 'Small and honest',
    body: 'No bots that pretend to be people, no fake activity, no endless settings. Just the chat you need.',
  },
]

const tech = ['React 19', 'Vite', 'Tailwind CSS 4', 'Express', 'Prisma', 'Socket.IO', 'JWT auth', 'SQLite / Postgres']

const navLinks = [
  ['Product', '#product'],
  ['Features', '#features'],
  ['API', '#api'],
  ['Run it', '#run'],
  ['FAQ', '#faq'],
]

const endpoints = [
  ['GET', '/api/health', 'no auth'],
  ['POST', '/api/auth/signup', 'returns a token'],
  ['POST', '/api/auth/login', 'returns a token'],
  ['GET', '/api/auth/me', 'current user'],
  ['GET', '/api/channels', 'channels and DMs'],
  ['POST', '/api/channels', 'create a channel'],
  ['POST', '/api/channels/dm', 'open a direct message'],
  ['GET', '/api/channels/:id/messages', 'history'],
  ['POST', '/api/channels/:id/messages', 'send'],
  ['POST', '/api/channels/:id/read', 'mark read'],
  ['PATCH', '/api/messages/:id', 'edit your own'],
  ['DELETE', '/api/messages/:id', 'delete your own'],
  ['POST', '/api/messages/:id/reactions', 'toggle a reaction'],
  ['GET', '/api/users', 'workspace members'],
  ['POST', '/api/users/ping', 'presence heartbeat'],
]

const methodTone = {
  GET: 'border-teal-600/25 bg-teal-600/10 text-teal-700',
  POST: 'border-emerald-600/25 bg-emerald-600/10 text-emerald-700',
  PATCH: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  DELETE: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
}

const gestures = [
  ['Enter', 'Send the message'],
  ['Shift + Enter', 'Start a new line'],
  ['Hover', 'React, edit or delete'],
  ['Click away', 'Dismiss any dialog'],
]

const limits = [
  {
    title: 'Not an enterprise suite',
    body: 'One workspace, one team. There is no org admin, no SSO and no permission matrix to configure before you can say hello.',
  },
  {
    title: 'No bot that pretends',
    body: 'The seeded Pulse account posts the welcome messages and stops there. It does not answer, score you or invent replies.',
  },
  {
    title: 'No file uploads yet',
    body: 'Messages are text. Paste a link and it stays a link. Attachments are on the list, not quietly faked in the UI.',
  },
  {
    title: 'No fake numbers',
    body: 'Every count on this page is real: three seeded channels, six seeded messages, two seeded accounts, zero scripts.',
  },
]

const bandSolid = ['No bots', 'No fake activity', 'No noise']
const bandOutline = ['Channels', 'Direct messages', 'Presence', 'Reactions']

const keywords = [
  'channels',
  'direct messages',
  'presence',
  'typing',
  'reactions',
  'unread counts',
  'edit and delete',
  'websockets',
]

const stats = [
  ['0', 'bots pretending to be teammates'],
  ['0', 'tracking scripts on this page'],
  ['3', 'channels in the demo seed'],
  ['6', 'seed messages, zero filler'],
]

const trust = ['Seeded demo workspace', 'Realtime over websockets', 'React + Express + Prisma']

const steps = [
  {
    title: 'Create an account',
    body: 'Email, password, done. You land in #general with a workspace that already works.',
  },
  {
    title: 'Open more rooms',
    body: 'Add channels for the work everyone should see, or start a direct message for the rest.',
  },
  {
    title: 'Talk in real time',
    body: 'Presence, typing indicators and unread badges stay in sync over websockets. No refresh.',
  },
]

const faqs = [
  {
    q: 'Can I look around before signing up?',
    a: 'Yes. The login page has a demo account button: demo@pulse.app with password demo1234. It opens the seeded workspace with three channels and six real messages.',
  },
  {
    q: 'Where is the data stored?',
    a: 'SQLite while you develop locally, Postgres when you deploy. Prisma handles both, and the schema is in the repository.',
  },
  {
    q: 'What happens if websockets are blocked?',
    a: 'The client falls back to polling every five seconds, so messages and presence still update. Sockets are an upgrade, not a hard requirement.',
  },
  {
    q: 'Can I self-host it?',
    a: 'That is the point. Express and Vite, one repository, MIT licensed. Point it at your own Postgres and run it anywhere that supports Node.',
  },
  {
    q: 'How big can a team get?',
    a: 'Pulse is built for small teams. There is no artificial seat limit in the code, but the interface is deliberately one workspace, not an enterprise admin suite.',
  },
  {
    q: 'Is there a mobile app?',
    a: 'No native app. The web client is responsive, and on small screens the sidebar becomes a drawer so the conversation keeps the space.',
  },
]

const particles = [
  { left: '6%', top: '18%', size: 5, delay: 0, dur: 12 },
  { left: '16%', top: '62%', size: 4, delay: 1.4, dur: 15 },
  { left: '28%', top: '30%', size: 3, delay: 0.7, dur: 14 },
  { left: '44%', top: '12%', size: 4, delay: 2.1, dur: 16 },
  { left: '58%', top: '74%', size: 5, delay: 0.4, dur: 13 },
  { left: '70%', top: '20%', size: 3, delay: 1.1, dur: 15 },
  { left: '82%', top: '52%', size: 4, delay: 2.6, dur: 17 },
  { left: '92%', top: '28%', size: 3, delay: 1.8, dur: 12 },
  { left: '36%', top: '86%', size: 4, delay: 0.9, dur: 18 },
  { left: '64%', top: '44%', size: 3, delay: 2.9, dur: 14 },
]

function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((item, index) => (
        <span
          key={index}
          className="particle"
          style={{
            left: item.left,
            top: item.top,
            width: item.size,
            height: item.size,
            animationDelay: `${item.delay}s`,
            '--dur': `${item.dur}s`,
          }}
        />
      ))}
    </div>
  )
}

function Typewriter() {
  const words = ['moving.', 'flowing.', 'honest.', 'simple.']
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState('typing')

  useEffect(() => {
    const word = words[wordIndex]
    let timer
    if (phase === 'typing') {
      if (text.length < word.length) {
        timer = setTimeout(() => setText(word.slice(0, text.length + 1)), 85)
      } else {
        timer = setTimeout(() => setPhase('deleting'), 2000)
      }
    } else if (text.length > 0) {
      timer = setTimeout(() => setText(word.slice(0, text.length - 1)), 40)
    } else {
      timer = setTimeout(() => {
        setPhase('typing')
        setWordIndex((current) => (current + 1) % words.length)
      }, 240)
    }
    return () => clearTimeout(timer)
  }, [text, phase, wordIndex])

  return (
    <span className="sheen-text block bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-600 bg-clip-text text-transparent">
      {text || '\u00A0'}
      <span className="caret" aria-hidden="true" />
    </span>
  )
}

function Intro() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem('pulse_intro'))
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!visible) return
    sessionStorage.setItem('pulse_intro', '1')
    const timer = setTimeout(() => setLeaving(true), 1250)
    const remove = setTimeout(() => setVisible(false), 2100)
    return () => {
      clearTimeout(timer)
      clearTimeout(remove)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className={`intro-overlay${leaving ? ' intro-out' : ''}`} aria-hidden="true">
      <div className="intro-mark">
        <Logo size={58} />
      </div>
      <div className="intro-word">
        {[...'Pulse'].map((letter, index) => (
          <span key={index}>{letter}</span>
        ))}
      </div>
      <div className="intro-bar">
        <i />
      </div>
    </div>
  )
}

function ScrollProgress() {
  const ref = useRef(null)

  useEffect(() => {
    function update() {
      const root = document.documentElement
      const max = root.scrollHeight - window.innerHeight
      const progress = max > 0 ? root.scrollTop / max : 0
      if (ref.current) ref.current.style.transform = `scaleX(${progress})`
      root.style.setProperty('--scroll', String(root.scrollTop))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />
}

function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2
    let ringX = pointerX
    let ringY = pointerY
    let frame = 0

    function move(event) {
      if (dot.current) dot.current.style.opacity = '1'
      if (ring.current) ring.current.style.opacity = '1'
      pointerX = event.clientX
      pointerY = event.clientY
      if (dot.current) dot.current.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`
      if (ring.current) {
        ring.current.classList.toggle(
          'is-hover',
          Boolean(event.target.closest('a, button, .app-card, input, textarea')),
        )
      }
    }

    function loop() {
      ringX += (pointerX - ringX) * 0.16
      ringY += (pointerY - ringY) * 0.16
      if (ring.current) ring.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      frame = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', move)
    frame = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <span ref={dot} className="cursor-dot" aria-hidden="true" />
      <span ref={ring} className="cursor-ring" aria-hidden="true" />
    </>
  )
}

function Counter({ value }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(Number(value))

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const target = Number(value)
    let frame = 0
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        setDisplay(0)
        function tick(now) {
          const progress = Math.min(1, (now - start) / 900)
          setDisplay(Math.round(target * (1 - Math.pow(1 - progress, 3))))
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return <span ref={ref}>{display}</span>
}

function Wire({ className, size = 260 }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="82" strokeDasharray="3 5" strokeOpacity="0.5" />
      <circle cx="100" cy="100" r="58" strokeDasharray="2 6" strokeOpacity="0.35" />
      <ellipse cx="100" cy="100" rx="82" ry="34" strokeOpacity="0.3" />
      <ellipse cx="100" cy="100" rx="34" ry="82" strokeOpacity="0.3" />
      <circle cx="100" cy="18" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="182" cy="100" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="100" cy="182" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="100" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function MiniBubble({ color, name, tag, time, children }) {
  return (
    <div className="flex gap-3">
      <span
        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-[11px] font-semibold text-white"
        style={{ background: color }}
      >
        {name[0]}
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2 text-[13px]">
          <span className="font-semibold text-slate-800">{name}</span>
          {tag ? <span className="text-[10px] text-[var(--faint)]">{tag}</span> : null}
          <span className="text-[10.5px] text-[var(--faint)]">{time}</span>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{children}</p>
      </div>
    </div>
  )
}

function MockChat() {
  return (
    <div className="elev relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
      <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--panel-2)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-3 inline-flex items-center gap-1.5 text-[11.5px] text-[var(--faint)]">
          <Hash className="h-3.5 w-3.5" /> general
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> connected
        </span>
      </div>

      <div className="space-y-5 p-5">
        <MiniBubble color="linear-gradient(140deg,#2dd4bf,#0f766e)" name="Pulse" tag="bot" time="9:41">
          Welcome to Pulse. This is <span className="font-medium text-teal-700">#general</span> - announcements, links
          and anything the whole team should see.
        </MiniBubble>
        <MiniBubble color="linear-gradient(140deg,#2dd4bf,#0f766e)" name="Pulse" tag="bot" time="9:41">
          Tip: press Enter to send, Shift + Enter for a new line. Hover a message to react or edit it.
        </MiniBubble>
        <MiniBubble color="linear-gradient(140deg,#fbbf24,#d97706)" name="Faizan" time="9:43">
          First build is up: channels, DMs, unread badges and reactions all working.
          <span className="ml-1.5 rounded bg-teal-600/10 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">
            edited
          </span>
        </MiniBubble>
        <div className="flex items-center gap-2 text-[11px] text-[var(--faint)]">
          <span className="flex gap-1">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
          </span>
          Pulse is typing
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] px-3.5 py-2.5 text-[13px] text-[var(--faint)]">
          <AtSign className="h-4 w-4" />
          Message #general
          <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-teal-600 px-2 py-1 text-[10.5px] font-medium text-white">
            <Send className="h-3 w-3" /> Send
          </span>
        </div>
      </div>
    </div>
  )
}

function ChannelsVisual() {
  const channels = [
    { name: 'general', unread: 0 },
    { name: 'design', unread: 0 },
    { name: 'random', unread: 1 },
  ]
  return (
    <div className="elev mx-auto w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--faint)]">Channels</span>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--faint)]">
          <Plus className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 space-y-1">
        {channels.map((channel, index) => (
          <div
            key={channel.name}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13.5px] ${
              index === 0 ? 'bg-teal-600/10 font-medium text-teal-900' : 'text-slate-600'
            }`}
          >
            <Hash className="h-4 w-4 text-[var(--faint)]" />
            {channel.name}
            {channel.unread ? (
              <span className="ml-auto rounded-full bg-teal-600 px-2 py-0.5 text-[10.5px] font-semibold text-white">
                {channel.unread}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between px-1">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--faint)]">
          Direct messages
        </span>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--faint)]">
          <MessageSquare className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13.5px] text-slate-600">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-teal-700 text-[10px] font-semibold text-white">
          P
        </span>
        Pulse
        <span className="ml-auto text-[10.5px] text-[var(--faint)]">workspace bot</span>
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-[var(--line-strong)] px-3.5 py-3 text-[11.5px] text-[var(--faint)]">
        Anyone in the workspace can join a public channel. Read state is per person.
      </div>
    </div>
  )
}

function DmVisual() {
  return (
    <div className="elev mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
      <div className="flex items-center gap-2.5 border-b border-[var(--line)] px-4 py-3.5">
        <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-[11px] font-semibold text-white">
          P
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
        </span>
        <div>
          <div className="text-[13px] font-semibold">Pulse</div>
          <div className="text-[10.5px] text-[var(--faint)]">Online now</div>
        </div>
        <span className="ml-auto rounded-full border border-[var(--line)] px-2 py-0.5 text-[10px] text-slate-500">
          DM
        </span>
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-teal-600/10 text-teal-700">
          <MessageSquare className="h-5 w-5" />
        </span>
        <p className="mt-4 text-[13.5px] font-semibold text-slate-700">This is the start of your conversation</p>
        <p className="mt-1.5 max-w-[240px] text-[11.5px] leading-relaxed text-slate-500">
          Direct messages are private between two people. Nothing is posted to a channel.
        </p>
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] px-3.5 py-2.5 text-[12px] text-[var(--faint)]">
          Message Pulse
          <Send className="ml-auto h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  )
}

function PresenceVisual() {
  return (
    <div className="elev mx-auto w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--faint)]">Members</span>
        <span className="inline-flex items-center gap-1.5 text-[10.5px] text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> live
        </span>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            name: 'Pulse',
            title: 'Workspace bot',
            color: 'linear-gradient(140deg,#2dd4bf,#0f766e)',
            online: true,
          },
          {
            name: 'Faizan Khan',
            title: 'Product engineer',
            color: 'linear-gradient(140deg,#fbbf24,#d97706)',
            online: true,
          },
        ].map((member) => (
          <div key={member.name} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5">
            <span
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-semibold text-white"
              style={{ background: member.color }}
            >
              {member.name[0]}
              {member.online ? (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              ) : null}
            </span>
            <div>
              <div className="text-[13px] font-medium text-slate-700">{member.name}</div>
              <div className="text-[10.5px] text-[var(--faint)]">{member.title}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-[var(--panel-2)] px-3.5 py-3 text-[11.5px] text-slate-500">
        <span className="flex gap-1">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
        </span>
        Faizan is typing
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--faint)]">
        <Zap className="h-3.5 w-3.5 text-teal-600" />
        Presence updates over the socket, then falls back to last seen.
      </div>
    </div>
  )
}

function ReactionsVisual() {
  const emoji = ['👍', '🔥', '🎉', '😂', '👀', '✅', '🙌', '💡']
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="elev rounded-2xl border border-[var(--line)] bg-white p-5">
        <MiniBubble color="linear-gradient(140deg,#fbbf24,#d97706)" name="Faizan" time="9:43">
          First build is up: channels, DMs, unread badges and reactions all working.
        </MiniBubble>
        <div className="mt-4 flex items-center gap-2 pl-11">
          <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--panel-2)] px-2 py-1 text-[11px] text-slate-500">
            <SmilePlus className="h-3 w-3" /> Add reaction
          </span>
          <span className="rounded-md border border-[var(--line)] px-1.5 py-0.5 text-[10px] text-[var(--faint)]">
            hover a message
          </span>
        </div>
      </div>
      <div className="elev absolute -bottom-8 right-2 flex gap-1 rounded-xl border border-[var(--line)] bg-white p-2">
        {emoji.map((item, index) => (
          <span
            key={item}
            className="reaction-pop inline-flex h-8 w-8 items-center justify-center rounded-lg text-[15px] hover:bg-[var(--raised)]"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {item}
          </span>
        ))}
      </div>
      <div className="absolute -left-4 top-1/2 hidden -translate-y-1/2 items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2 shadow-lg shadow-slate-900/10 sm:flex float-slow">
        <Command className="h-3.5 w-3.5 text-teal-600" />
        <span className="text-[11px] text-slate-600">Enter to send</span>
      </div>
    </div>
  )
}

function TerminalVisual() {
  return (
    <div className="elev overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
      <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--panel-2)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-3 inline-flex items-center gap-1.5 text-[11px] text-[var(--faint)]">
          <Terminal className="h-3.5 w-3.5" /> pulse/server
        </span>
      </div>
      <div className="space-y-2 px-5 py-5 font-mono text-[12px] leading-relaxed">
        <div className="text-slate-500">
          <span className="text-teal-600">$</span>{' '}
          <span className="type-cmd">npm install</span>
        </div>
        <div className="a-fade text-[var(--faint)]" style={{ animationDelay: '1.8s' }}>
          added 214 packages in 9s
        </div>
        <div className="a-fade text-slate-500" style={{ animationDelay: '2.1s' }}>
          <span className="text-teal-600">$</span> npm run seed
        </div>
        <div className="a-fade text-[var(--faint)]" style={{ animationDelay: '2.3s' }}>
          seeded 3 channels, 6 messages
        </div>
        <div className="a-fade text-slate-500" style={{ animationDelay: '2.5s' }}>
          <span className="text-teal-600">$</span> npm run dev
        </div>
        <div className="a-fade text-[var(--faint)]" style={{ animationDelay: '2.7s' }}>
          api on :4100 - client on :5174
        </div>
        <div className="a-fade flex items-center gap-2 text-emerald-700" style={{ animationDelay: '2.9s' }}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> ready in 2.6s
        </div>
      </div>
    </div>
  )
}

function MessageVisual() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="elev rounded-2xl border border-[var(--line)] bg-white p-5">
        <div className="rounded-xl border border-teal-600/25 bg-teal-600/[0.04] p-3.5">
          <div className="mb-3 flex items-center justify-between pl-11">
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-teal-700">
              Hover toolbar
            </span>
            <span className="flex items-center gap-0.5 rounded-lg border border-[var(--line)] bg-white p-1 shadow-sm shadow-slate-900/5">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500">
                <SmilePlus className="h-3.5 w-3.5" />
              </span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-teal-600/10 text-teal-700">
                <Pencil className="h-3.5 w-3.5" />
              </span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500">
                <Trash2 className="h-3.5 w-3.5" />
              </span>
            </span>
          </div>
          <MiniBubble color="linear-gradient(140deg,#fbbf24,#d97706)" name="Faizan" time="9:43">
            Naming is settled: #design for reviews, #random for everything else. Shipping the read state fix tonight.
            <span className="ml-1.5 rounded bg-teal-600/10 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">
              edited
            </span>
          </MiniBubble>
          <div className="mt-3 flex items-center gap-1.5 pl-11">
            <span className="inline-flex items-center gap-1 rounded-md border border-teal-600/25 bg-white px-1.5 py-0.5 text-[10.5px] text-slate-600">
              👍 1
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-white px-1.5 py-0.5 text-[10.5px] text-slate-600">
              🔥 1
            </span>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-dashed border-[var(--line-strong)] text-[var(--faint)]">
              <Plus className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ['Ownership', 'edit/delete'],
            ['History', 'edited label'],
            ['Reactions', 'live counts'],
          ].map(([label, note]) => (
            <div key={label} className="rounded-lg border border-[var(--line)] bg-[var(--panel-2)] px-2 py-2">
              <div className="text-[10px] font-semibold text-slate-600">{label}</div>
              <div className="mt-0.5 text-[9.5px] text-[var(--faint)]">{note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ComposerVisual() {
  return (
    <div className="elev mx-auto w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-5">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-amber-300 to-amber-600 text-[11px] font-semibold text-white">
          F
        </span>
        <div>
          <div className="text-[12.5px] font-semibold text-slate-800">#general</div>
          <div className="text-[10.5px] text-[var(--faint)]">3 members - live</div>
        </div>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-[var(--faint)]">
          <span className="flex gap-1">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
          </span>
          typing
        </span>
      </div>
      <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-3.5">
        <p className="text-[12.5px] leading-relaxed text-slate-600">
          Reading the reconnect logs now, fix lands before the standup<span className="caret" aria-hidden="true" />
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[10px] text-[var(--faint)]">Shift + Enter for a new line</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-2.5 py-1 text-[10.5px] font-medium text-white">
            <Send className="h-3 w-3" /> Send
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--panel-2)] px-3 py-2 text-[10.5px] text-slate-500">
        <Command className="h-3.5 w-3.5 text-teal-600" />
        Enter sends, and the box grows with the message
      </div>
    </div>
  )
}

function Showcase({ eyebrow, title, body, bullets, visual, flip = false }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
      <div className="reveal grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className={flip ? 'lg:order-2' : ''}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">{eyebrow}</span>
          <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.03em] sm:text-[38px]">{title}</h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600">{body}</p>
          <ul className="mt-7 space-y-3 text-[13.5px] text-slate-600">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className={flip ? 'lg:order-1' : ''}>{visual}</div>
      </div>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {faqs.map((item, index) => {
        const isOpen = open === index
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-[14.5px] font-medium text-slate-800">{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[var(--faint)] transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-5 text-[13.5px] leading-relaxed text-slate-600">{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const heroRef = useRef(null)
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sections = navLinks
      .map(([, href]) => document.getElementById(href.slice(1)))
      .filter(Boolean)
      .sort((a, b) => a.offsetTop - b.offsetTop)

    function update() {
      setScrolled(window.scrollY > 16)
      let current = ''
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= 150) current = `#${section.id}`
      }
      setActive(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    const node = heroRef.current
    if (!node) return
    function move(event) {
      const rect = node.getBoundingClientRect()
      node.style.setProperty('--mx', `${event.clientX - rect.left}px`)
      node.style.setProperty('--my', `${event.clientY - rect.top}px`)
    }
    node.addEventListener('mousemove', move)
    return () => node.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <Intro />
      <ScrollProgress />
      <Cursor />
      <div className="min-h-full bg-[var(--bg)]">
        <header
          className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 ${
            scrolled
              ? 'border-[var(--line)] bg-[var(--bg)]/85 shadow-[0_26px_50px_-42px_rgba(16,18,45,0.65)]'
              : 'border-transparent bg-[var(--bg)]/55'
          }`}
        >
          <div
            className={`relative mx-auto flex max-w-7xl items-center gap-3 px-5 transition-[height] duration-500 sm:px-6 ${
              scrolled ? 'h-[58px]' : 'h-[72px]'
            }`}
          >
            <div
              className={`nav-hairline transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
            />
            <Link to="/" className="group flex items-center gap-2.5">
              <span className="inline-flex transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-105">
                <Logo size={30} />
              </span>
              <span className="flex flex-col">
                <span className="text-[15px] font-semibold leading-none tracking-tight">Pulse</span>
                <span className="mt-[5px] text-[8.5px] font-medium uppercase tracking-[0.22em] text-[var(--faint)]">
                  team chat
                </span>
              </span>
            </Link>

            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full border border-[var(--line)] bg-[var(--panel-2)]/80 p-1 backdrop-blur lg:flex">
              {navLinks.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  aria-current={active === href ? 'true' : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] transition-all duration-300 ${
                    active === href
                      ? 'bg-white font-medium text-slate-900 shadow-[0_1px_2px_rgba(16,18,45,0.08)]'
                      : 'text-[var(--muted)] hover:bg-white/70 hover:text-slate-900'
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-1.5">
              <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/60 px-2.5 py-1 text-[10.5px] text-slate-500 xl:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                open source
              </span>
              {user ? (
                <Link to="/app" className="app-btn app-btn-primary px-4 py-2 text-[12.5px]">
                  Open Pulse <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden rounded-full border border-transparent px-3.5 py-2 text-[12.5px] text-slate-600 transition-colors duration-300 hover:border-[var(--line)] hover:bg-white hover:text-slate-900 sm:block"
                  >
                    Log in
                  </Link>
                  <Link to="/signup" className="app-btn app-btn-primary px-4 py-2 text-[12.5px]">
                    Get started <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main>
          <section ref={heroRef} className="relative overflow-hidden">
            <div className="hero-grid pointer-events-none absolute inset-0" />
            <div className="hero-spot pointer-events-none absolute inset-0" />
            <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[520px] max-w-3xl rounded-full bg-teal-500/10 blur-3xl" />
            <Particles />
            <div className="pointer-events-none absolute -left-32 top-64 hidden text-teal-800/20 lg:block parallax-slow">
              <Wire className="spin-slow" size={320} />
            </div>
            <div className="pointer-events-none absolute -right-24 top-10 hidden text-teal-800/20 lg:block parallax-fast">
              <Wire className="float-slower" size={230} />
            </div>

            <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:pb-28 lg:pt-20">
              <div>
                <span className="a-up inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3.5 py-1.5 text-[12px] text-slate-600 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Realtime chat you can run yourself
                </span>

                <h1 className="a-up st-1 mt-7 text-[52px] font-bold leading-[0.98] tracking-[-0.045em] text-slate-900 sm:text-[68px] lg:text-[76px]">
                  Keep the conversation
                  <Typewriter />
                </h1>

                <p className="a-up st-2 mt-7 max-w-xl text-[17px] leading-relaxed text-slate-600">
                  Pulse is a fast, minimal chat workspace for small teams: channels, direct messages, presence,
                  reactions and honest unread counts. Fast to open, quiet to use, and yours to host.
                </p>

                <div className="a-up st-3 mt-9 flex flex-wrap items-center gap-3">
                  <Link to={user ? '/app' : '/signup'} className="app-btn app-btn-primary px-7 py-4 text-[15px]">
                    {user ? 'Open the workspace' : 'Create your workspace'} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#product"
                    className="app-btn border border-[var(--line)] bg-white px-7 py-4 text-[15px] text-slate-700 hover:border-[var(--line-strong)]"
                  >
                    <MessageSquare className="h-4 w-4" /> See the product
                  </a>
                </div>

                <div className="a-up st-4 mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[12.5px] text-slate-500">
                  {trust.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-teal-600" /> {item}
                    </span>
                  ))}
                </div>

                <p className="a-up st-5 mt-4 text-[12.5px] text-slate-500">
                  Demo account: demo@pulse.app - password demo1234
                </p>
              </div>

              <div className="a-up st-3 relative">
                <div className="float-slower">
                  <MockChat />
                </div>

                <div className="float-slow absolute -left-48 top-14 hidden items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 shadow-lg shadow-slate-900/10 lg:flex">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[11.5px] font-medium text-slate-600">Live over websockets</span>
                </div>

                <div className="float-slow absolute -bottom-6 right-4 hidden items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2 shadow-lg shadow-slate-900/10 sm:flex [animation-delay:1.2s]">
                  <span className="rounded-md border border-[var(--line)] bg-[var(--panel-2)] px-1.5 py-0.5 text-[10.5px] text-slate-500">
                    Enter
                  </span>
                  <span className="text-[11.5px] text-slate-600">to send</span>
                </div>
              </div>
            </div>

            <div className="relative mx-auto flex max-w-7xl justify-center pb-8">
              <a
                href="#product"
                className="bob-soft inline-flex flex-col items-center gap-1 text-[10.5px] uppercase tracking-[0.18em] text-[var(--faint)] transition-colors hover:text-slate-600"
              >
                Scroll
                <ChevronDown className="h-4 w-4" />
              </a>
            </div>
          </section>

          <section className="border-y border-[var(--line)] bg-white/60">
            <div className="marquee-mask overflow-hidden py-4">
              <div className="marquee-track gap-10 px-5 text-[11.5px] font-medium uppercase tracking-[0.14em] text-[var(--faint)]">
                {[...tech, ...tech].map((item, index) => (
                  <span key={`${item}-${index}`} className="inline-flex items-center gap-10">
                    {item}
                    <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" />
                  </span>
                ))}
              </div>
            </div>
            <div className="marquee-mask overflow-hidden border-t border-[var(--line)] py-3">
              <div className="marquee-track marquee-track-rev gap-8 px-5 text-[10.5px] font-medium uppercase tracking-[0.16em] text-[var(--faint)]">
                {[...keywords, ...keywords].map((item, index) => (
                  <span key={`${item}-${index}`} className="inline-flex items-center gap-8">
                    {item}
                    <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" />
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section id="product" className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(([value, label]) => (
                <div key={label}>
                  <div className="text-[56px] font-bold leading-none tracking-[-0.04em] text-slate-900">
                    <Counter value={value} />
                  </div>
                  <div className="mt-3 max-w-[180px] text-[12px] leading-relaxed text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="features" className="mx-auto max-w-6xl border-t border-[var(--line)] px-6 py-20">
            <div className="reveal flex flex-col gap-6 border-b border-[var(--line)] pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">Features</span>
                <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.03em] sm:text-[42px]">
                  Everything a small team needs. Nothing else.
                </h2>
              </div>
              <p className="max-w-sm text-[13.5px] leading-relaxed text-slate-500">
                No bots pretending to be teammates, no fake activity counters. Every number in Pulse comes from
                messages someone actually sent.
              </p>
            </div>
            <div className="reveal mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="app-card card-sheen p-6">
                  <span className="feature-icon inline-flex h-11 w-11 items-center justify-center rounded-xl border border-teal-600/15 bg-teal-600/10 text-teal-700">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-[15px] font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">{feature.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-[var(--line)] bg-white">
            <div className="mx-auto max-w-6xl px-6 py-20">
              <div className="reveal max-w-2xl">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">How it works</span>
                <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.03em] sm:text-[42px]">
                  Three steps to a live conversation.
                </h2>
              </div>
              <div className="mt-12 grid gap-8 md:grid-cols-3">
                {steps.map((step, index) => (
                  <div key={step.title} className="reveal relative">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-teal-600/20 bg-teal-600/10 text-[14px] font-semibold text-teal-800">
                      0{index + 1}
                    </span>
                    <h3 className="mt-5 text-[16px] font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">{step.body}</p>
                    {index < steps.length - 1 ? (
                      <span className="pointer-events-none absolute left-14 top-5 hidden h-px w-[calc(100%-3.5rem)] bg-gradient-to-r from-teal-600/25 to-transparent md:block" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="border-t border-[var(--line)]">
            <Showcase
              eyebrow="Channels"
              title="A room for every kind of work."
              body="General for everything the whole team should see, focused channels for the rest. Each person keeps their own read state, so unread badges mean something."
              bullets={[
                'Public channels with a topic and a member list',
                'Unread counts that clear when you actually read',
                'One click to create a channel, no settings maze',
              ]}
              visual={<ChannelsVisual />}
            />
          </div>

          <div className="border-t border-[var(--line)] bg-white">
            <Showcase
              eyebrow="Direct messages"
              title="Private when it needs to be."
              body="Two people, one thread, nothing broadcast to the team. DMs sit next to your channels and behave the same way: presence, typing, edits and reactions included."
              bullets={[
                'Start a DM from the people picker',
                'Same composer, same keyboard shortcuts',
                'Channels and DMs share one unread model',
              ]}
              visual={<DmVisual />}
              flip
            />
          </div>

          <div className="border-t border-[var(--line)]">
            <Showcase
              eyebrow="Presence"
              title="You can tell who is actually there."
              body="Online dots come from an open socket. If the socket drops, the client falls back to last seen and keeps polling, so the room never feels frozen."
              bullets={[
                'Live presence over Socket.IO, no manual refresh',
                'Typing indicators expire on their own',
                'Polling fallback for locked-down networks',
              ]}
              visual={<PresenceVisual />}
            />
          </div>

          <div className="border-t border-[var(--line)] bg-white">
            <Showcase
              eyebrow="Reactions"
              title="Small signals, less noise."
              body="A reaction says enough. Hover any message to react, edit or delete it, and keep the channel readable instead of turning it into a thread of single-word replies."
              bullets={[
                'Quick emoji picker on every message',
                'Edit and delete only your own messages',
                'Reaction counts update live for everyone',
              ]}
              visual={<ReactionsVisual />}
              flip
            />
          </div>

          <div className="border-t border-[var(--line)]">
            <Showcase
              eyebrow="One message"
              title="Small surface, careful details."
              body="A message carries who wrote it, when, and whether it changed. Hover it and the actions appear in place, so the channel stays readable instead of becoming a row of buttons."
              bullets={[
                'React, edit or delete from the hover toolbar',
                'Edited messages keep a quiet edited label',
                'Only the author can change their own words',
              ]}
              visual={<MessageVisual />}
            />
          </div>

          <section className="overflow-hidden border-y border-[var(--line)] bg-white py-10">
            <div className="marquee-mask">
              <div className="marquee-track band-marquee items-center gap-8 pr-8 text-[44px] font-bold tracking-[-0.04em] text-slate-900 sm:text-[62px]">
                {[...bandSolid, ...bandSolid].map((item, index) => (
                  <span key={`${item}-${index}`} className="inline-flex items-center gap-8 whitespace-nowrap">
                    {item}
                    <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                  </span>
                ))}
              </div>
            </div>
            <div className="marquee-mask mt-3">
              <div className="marquee-track marquee-track-rev band-marquee-slow items-center gap-8 pr-8 text-[44px] font-bold tracking-[-0.04em] sm:text-[62px]">
                {[...bandOutline, ...bandOutline].map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="outline-text inline-flex items-center gap-8 whitespace-nowrap"
                  >
                    {item}
                    <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500/40" />
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="border-b border-[var(--line)] bg-white">
            <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
              <div className="reveal">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">
                  Small gestures
                </span>
                <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.03em] sm:text-[42px]">
                  Fast without reaching for the mouse.
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
                  The composer is the whole interface. It sends on Enter, expands with the message, and keeps the keys
                  where your hands already are.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {gestures.map(([keys, action]) => (
                    <div
                      key={keys}
                      className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3"
                    >
                      <kbd className="rounded-md border border-[var(--line-strong)] bg-white px-2 py-1 font-sans text-[10.5px] font-medium text-slate-600 shadow-[0_1px_0_var(--line-strong)]">
                        {keys}
                      </kbd>
                      <span className="text-[12px] text-slate-600">{action}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 flex items-center gap-2 text-[12px] text-slate-500">
                  <Check className="h-3.5 w-3.5 text-teal-600" />
                  No command palette to learn, no modes to switch.
                </p>
              </div>
              <div className="reveal">
                <ComposerVisual />
              </div>
            </div>
          </section>

          <section id="api" className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="reveal lg:sticky lg:top-28">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">API</span>
                <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.03em] sm:text-[42px]">
                  The same routes the UI uses.
                </h2>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
                  There is no private API hiding behind the client. Everything below is an Express route in the
                  repository, protected by the same bearer token the app stores after login.
                </p>
                <ul className="mt-7 space-y-3 text-[13.5px] text-slate-600">
                  {[
                    'JSON in, JSON out, no SDK required',
                    'Auth on every route except health, signup and login',
                    'Edits and deletes are scoped to the author',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-7 inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 py-2 font-mono text-[11px] text-slate-600">
                  GET /api/health
                  <span className="rounded bg-emerald-600/10 px-1.5 py-0.5 font-sans text-[10px] font-medium text-emerald-700">
                    public
                  </span>
                </p>
              </div>
              <div className="reveal elev overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
                <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--panel-2)] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 inline-flex items-center gap-1.5 text-[11px] text-[var(--faint)]">
                    <Terminal className="h-3.5 w-3.5" /> pulse/api
                  </span>
                  <span className="ml-auto text-[10px] text-[var(--faint)]">{endpoints.length} routes</span>
                </div>
                <div className="divide-y divide-[var(--line)]">
                  {endpoints.map(([method, path, note]) => (
                    <div
                      key={`${method}-${path}`}
                      className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--panel-2)]"
                    >
                      <span
                        className={`inline-flex w-[52px] shrink-0 justify-center rounded-md border px-1.5 py-0.5 text-[9.5px] font-semibold ${methodTone[method]}`}
                      >
                        {method}
                      </span>
                      <code className="truncate font-mono text-[11.5px] text-slate-700">{path}</code>
                      <span className="ml-auto hidden shrink-0 text-[10px] text-[var(--faint)] sm:block">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-[var(--line)] bg-white">
            <div className="mx-auto max-w-6xl px-6 py-20">
              <div className="reveal max-w-2xl">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">Scope</span>
                <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.03em] sm:text-[42px]">
                  What it is not.
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                  Boundaries are part of the design. Pulse stays small on purpose, and saying what is missing is
                  cheaper than pretending everything is finished.
                </p>
              </div>
              <div className="reveal mt-10 grid gap-4 sm:grid-cols-2">
                {limits.map((limit, index) => (
                  <div key={limit.title} className="app-card p-6">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--bg)] text-slate-400">
                        <Minus className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-mono text-[10px] text-[var(--faint)]">0{index + 1}</span>
                    </div>
                    <h3 className="mt-4 text-[14.5px] font-semibold text-slate-900">{limit.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{limit.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="run" className="border-t border-[var(--line)]">
            <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
              <div className="reveal">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">
                  Run it locally
                </span>
                <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.03em] sm:text-[42px]">
                  Three commands. No containers.
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
                  Install, seed the demo workspace, then start the API and the client together. SQLite is the default
                  locally; the same Prisma schema points at Postgres in production.
                </p>
                <div className="mt-7 grid gap-3">
                  {[
                    ['npm install', 'installs client and server'],
                    ['npm run seed', 'creates the demo accounts and channels'],
                    ['npm run dev', 'runs the API on 4100 and Vite on 5174'],
                  ].map(([command, note]) => (
                    <div key={command} className="flex flex-wrap items-center gap-3">
                      <span className="rounded-lg border border-[var(--line)] bg-white px-2.5 py-1 font-mono text-[12px] text-slate-700">
                        {command}
                      </span>
                      <span className="text-[12.5px] text-slate-500">{note}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-[12.5px] text-slate-500">
                  Open source under the MIT license. The README has the full setup.
                </p>
              </div>
              <div className="reveal">
                <TerminalVisual />
              </div>
            </div>
          </section>

          <section id="faq" className="mx-auto max-w-6xl px-6 py-20">
            <div className="reveal grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">FAQ</span>
                <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.03em] sm:text-[42px]">
                  Straight answers.
                </h2>
                <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-slate-600">
                  If something is missing, the repository is the source of truth. No sales call required.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-[12px] text-slate-600">
                  <Users className="h-4 w-4 text-teal-600" />
                  Two seeded accounts, three channels, six messages
                </div>
              </div>
              <Faq />
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-6 pb-24">
            <div className="reveal relative overflow-hidden rounded-3xl border border-teal-600/20 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent p-10 text-center sm:p-14">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
              <h2 className="mx-auto max-w-2xl text-[32px] font-semibold tracking-[-0.03em] sm:text-[42px]">
                Start with one channel. Add the team later.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
                Sign up, land in #general, and send your first message. DMs and more channels are one click away.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to={user ? '/app' : '/signup'} className="app-btn app-btn-primary px-7 py-4 text-[15px]">
                  {user ? 'Open Pulse' : 'Create an account'} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="app-btn border border-[var(--line)] bg-white px-7 py-4 text-[15px] text-slate-700 hover:border-[var(--line-strong)]"
                >
                  Log in
                </Link>
              </div>
              <p className="mt-5 text-[12.5px] text-slate-500">Demo account: demo@pulse.app - password demo1234</p>
            </div>
          </section>
        </main>

        <footer className="border-t border-[var(--line)] bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-9 text-[12.5px] text-slate-500 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-2">
              <Logo size={18} /> Pulse
            </span>
            <span className="sm:ml-auto">Built by Faizan Khan - MIT licensed</span>
          </div>
        </footer>
      </div>
    </>
  )
}
