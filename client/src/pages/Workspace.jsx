import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Bell,
  Hash,
  Loader2,
  LogOut,
  Menu,
  MessageSquarePlus,
  Pencil,
  Plus,
  Search,
  Send,
  SmilePlus,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import Avatar from '../components/Avatar'
import Logo from '../components/Logo'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'
import { useAuth } from '../store/auth'
import { cn, dayLabel, formatTime, isOnline, sameDay } from '../lib/utils'

const QUICK_EMOJI = ['👍', '🔥', '🎉', '😂', '👀', '✅', '🙌', '💡']

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-28 backdrop-blur-sm a-fade" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-2xl app-pop"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
          <h3 className="text-[14px] font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-[var(--raised)] hover:text-slate-900">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function Sidebar({
  channels,
  activeId,
  onSelect,
  onNewChannel,
  onNewDm,
  online,
  user,
  logout,
  compact,
}) {
  const list = (type) => channels.filter((channel) => channel.type === type)

  return (
    <div className="flex h-full w-full flex-col bg-[var(--panel)]">
      <div className="flex h-[68px] items-center gap-2.5 border-b border-[var(--line)] px-4">
        <Logo size={36} />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold tracking-tight">Pulse</div>
          <div className="truncate text-[11.5px] text-slate-500">Your workspace</div>
        </div>
        {compact ? (
          <button onClick={compact} className="ml-auto rounded-lg p-1.5 text-slate-500 hover:bg-[var(--raised)] md:hidden">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 py-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Channels</span>
          <button onClick={onNewChannel} className="rounded-md p-1 text-slate-500 transition hover:bg-[var(--raised)] hover:text-slate-900">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-1.5 space-y-0.5">
          {list('PUBLIC').map((channel) => (
            <button
              key={channel.id}
              onClick={() => onSelect(channel.id)}
              className={cn(
                'group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition',
                channel.id === activeId
                  ? 'bg-teal-600/10 font-medium text-teal-900'
                  : channel.unread
                    ? 'text-slate-700 hover:bg-[var(--raised)]'
                    : 'text-slate-500 hover:bg-[var(--raised)] hover:text-slate-700',
              )}
            >
              <Hash className="h-4 w-4 shrink-0 text-slate-500" />
              <span className={cn('truncate', channel.unread && 'font-medium')}>{channel.name}</span>
              {channel.unread ? (
                <span className="ml-auto rounded-full bg-teal-600 px-2 py-0.5 text-[10.5px] font-semibold text-white">
                  {channel.unread}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between px-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Direct messages</span>
          <button onClick={onNewDm} className="rounded-md p-1 text-slate-500 transition hover:bg-[var(--raised)] hover:text-slate-900">
            <MessageSquarePlus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-1.5 space-y-0.5">
          {list('DM').length === 0 ? (
            <p className="px-2 py-2.5 text-[12.5px] text-slate-500">No conversations yet.</p>
          ) : null}
          {list('DM').map((channel) => (
            <button
              key={channel.id}
              onClick={() => onSelect(channel.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition',
                channel.id === activeId ? 'bg-teal-600/10 font-medium text-teal-900' : 'text-slate-500 hover:bg-[var(--raised)] hover:text-slate-700',
              )}
            >
              <Avatar user={channel.dmUser} size="xs" online={isOnline(channel.dmUser, online)} />
              <span className={cn('truncate', channel.unread && 'font-medium text-slate-700')}>
                {channel.dmUser?.name || 'Direct message'}
              </span>
              {channel.unread ? (
                <span className="ml-auto rounded-full bg-teal-600 px-2 py-0.5 text-[10.5px] font-semibold text-white">
                  {channel.unread}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--line)] p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-1 py-1">
          <Avatar user={user} size="sm" online />
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-medium text-slate-700">{user?.name}</div>
            <div className="truncate text-[11.5px] text-slate-500">{user?.title || user?.email}</div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="ml-auto rounded-lg p-1.5 text-slate-500 transition hover:bg-[var(--raised)] hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageRow({ message, mine, compact, onReact, onEdit, onDelete }) {
  const [menu, setMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(message.body)

  function save() {
    const body = draft.trim()
    if (body && body !== message.body) onEdit(message.id, body)
    setEditing(false)
  }

  return (
    <div className={cn('group relative flex gap-3.5 px-5', compact ? 'mt-0.5' : 'mt-4')}>
      {compact ? (
        <div className="w-10 shrink-0 pt-1 text-right">
          <span className="hidden text-[10.5px] text-slate-500 group-hover:inline">{formatTime(message.createdAt)}</span>
        </div>
      ) : (
        <Avatar user={message.author} size="md" className="mt-0.5" />
      )}
      <div className="min-w-0 flex-1">
        {compact ? null : (
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-semibold text-slate-800">{message.author.name}</span>
            <span className="text-[11.5px] text-slate-500">{formatTime(message.createdAt)}</span>
          </div>
        )}

        {editing ? (
          <div className="mt-1">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-teal-600/40 bg-[var(--panel-2)] px-3 py-2 text-sm text-slate-800 outline-none"
              autoFocus
            />
            <div className="mt-2 flex items-center gap-2.5 text-[12.5px]">
              <button onClick={save} className="rounded-lg bg-teal-600 px-3 py-1.5 font-medium text-white hover:bg-teal-500">
                Save
              </button>
              <button
                onClick={() => {
                  setDraft(message.body)
                  setEditing(false)
                }}
                className="rounded-lg px-2 py-1 text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words text-[14.5px] leading-[1.7] text-slate-600">
            {message.body}
            {message.edited ? <span className="ml-1.5 text-[11.5px] text-slate-500">(edited)</span> : null}
          </p>
        )}

        {message.reactions.length ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {message.reactions.map((reaction) => {
              const active = reaction.users.includes(mine)
              return (
                <button
                  key={reaction.emoji}
                  onClick={() => onReact(message.id, reaction.emoji)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11.5px] transition',
                    active
                      ? 'border-teal-600/50 bg-teal-600/15 text-teal-800'
                      : 'border-[var(--line)] bg-[var(--panel-2)] text-slate-500 hover:border-slate-300',
                  )}
                >
                  <span>{reaction.emoji}</span>
                  {reaction.users.length}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      <div className="absolute -top-3 right-3 hidden items-center gap-0.5 rounded-lg border border-[var(--line)] bg-[var(--panel-2)] p-1 shadow-lg group-hover:flex">
        <button
          onClick={() => setMenu((value) => !value)}
          className="rounded-md p-1.5 text-slate-500 transition hover:bg-[var(--raised)] hover:text-slate-900"
          title="React"
        >
          <SmilePlus className="h-3.5 w-3.5" />
        </button>
        {message.author.id === mine ? (
          <>
            <button
              onClick={() => setEditing(true)}
              className="rounded-md p-1.5 text-slate-500 transition hover:bg-[var(--raised)] hover:text-slate-900"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(message.id)}
              className="rounded-md p-1.5 text-slate-500 transition hover:bg-[var(--raised)] hover:text-rose-600"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        ) : null}
      </div>

      {menu ? (
        <div className="absolute right-3 top-4 z-20 flex gap-1 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-1.5 shadow-xl app-pop">
          {QUICK_EMOJI.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(message.id, emoji)
                setMenu(false)
              }}
              className="rounded-md px-1.5 py-1 text-base transition hover:bg-[var(--raised)]"
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function Composer({ channel, onSend, onTyping, disabled }) {
  const [value, setValue] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const ref = useRef(null)
  const lastTyping = useRef(0)

  useEffect(() => {
    setValue('')
  }, [channel?.id])

  function resize() {
    const node = ref.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, 180)}px`
  }

  function submit() {
    const body = value.trim()
    if (!body || disabled) return
    onSend(body)
    setValue('')
    if (ref.current) ref.current.style.height = 'auto'
    ref.current?.focus()
  }

  function onKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  function onChange(event) {
    setValue(event.target.value)
    resize()
    const now = Date.now()
    if (now - lastTyping.current > 2500) {
      lastTyping.current = now
      onTyping()
    }
  }

  return (
    <div className="border-t border-[var(--line)] bg-[var(--panel)] px-5 py-4">
      <div className="mx-auto w-full max-w-4xl">
      <div className="relative rounded-xl border border-[var(--line)] bg-[var(--panel-2)] focus-within:border-teal-600/60">
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={channel?.type === 'DM' ? `Message ${channel?.dmUser?.name || ''}` : `Message #${channel?.name || ''}`}
          className="max-h-44 w-full resize-none bg-transparent px-4 py-3.5 pr-28 text-[14.5px] text-slate-800 outline-none placeholder:text-[var(--faint)]"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEmojiOpen((open) => !open)}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-[var(--raised)] hover:text-slate-700"
            title="Emoji"
          >
            <SmilePlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim() || disabled}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-[12.5px] font-medium text-white transition hover:bg-teal-500 disabled:opacity-40"
          >
            {disabled ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Send
          </button>
        </div>
        {emojiOpen ? (
          <div className="absolute bottom-12 right-2 z-20 flex gap-1 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] p-1.5 shadow-xl app-pop">
            {QUICK_EMOJI.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setValue((current) => current + emoji)
                  setEmojiOpen(false)
                  ref.current?.focus()
                }}
                className="rounded-md px-1.5 py-1 text-base transition hover:bg-[var(--raised)]"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mt-2.5 flex items-center gap-3 px-0.5 text-[11px] text-slate-500">
        <span>
          <span className="rounded border border-[var(--line)] px-1 py-0.5">Enter</span> to send
        </span>
        <span>
          <span className="rounded border border-[var(--line)] px-1 py-0.5">Shift + Enter</span> for a new line
        </span>
      </div>
      </div>
    </div>
  )
}

export default function Workspace() {
  const { user, logout } = useAuth()
  const params = useParams()
  const navigate = useNavigate()
  const activeId = (params['*'] || '').split('/')[0] || ''

  const [channels, setChannels] = useState([])
  const [users, setUsers] = useState([])
  const [channel, setChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState([])
  const [typing, setTyping] = useState({})
  const [membersOpen, setMembersOpen] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newChannelOpen, setNewChannelOpen] = useState(false)
  const [dmOpen, setDmOpen] = useState(false)
  const [dmQuery, setDmQuery] = useState('')
  const [channelForm, setChannelForm] = useState({ name: '', topic: '' })
  const [formError, setFormError] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const activeChannel = useMemo(
    () => channels.find((item) => item.id === activeId) || null,
    [channels, activeId],
  )

  async function loadChannels() {
    const data = await api('/channels')
    setChannels(data.channels)
    return data.channels
  }

  async function loadUsers() {
    const data = await api('/users')
    setUsers(data.users)
  }

  useEffect(() => {
    Promise.all([loadChannels(), loadUsers()])
      .then(([list]) => {
        if (!activeId && list[0]) navigate(`/app/${list[0].id}`, { replace: true })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    const timer = setInterval(() => api('/users/ping').catch(() => {}), 25000)
    api('/users/ping').catch(() => {})
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!activeId) return
    setLoading(true)
    setMessages([])
    setTyping({})
    setSidebarOpen(false)
    Promise.all([api(`/channels/${activeId}`), api(`/channels/${activeId}/messages`)])
      .then(([details, list]) => {
        setChannel(details.channel)
        setMessages(list.messages)
        setChannels((current) =>
          current.map((item) => (item.id === activeId ? { ...item, unread: 0 } : item)),
        )
        api(`/channels/${activeId}/read`, { method: 'POST' }).catch(() => {})
      })
      .catch(() => setChannel(null))
      .finally(() => setLoading(false))
    const socket = getSocket()
    if (socket) socket.emit('channel:join', activeId)
    return () => {
      if (socket) socket.emit('channel:leave', activeId)
    }
  }, [activeId])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const upsert = (payload) =>
      setMessages((current) => {
        const index = current.findIndex((item) => item.id === payload.message.id)
        if (index === -1) return [...current, payload.message]
        const next = [...current]
        next[index] = payload.message
        return next
      })

    const onNew = (payload) => {
      if (payload.channelId === activeId) {
        upsert(payload)
        api(`/channels/${payload.channelId}/read`, { method: 'POST' }).catch(() => {})
      }
      loadChannels().catch(() => {})
    }
    const onUpdated = (payload) => {
      if (payload.channelId === activeId) upsert(payload)
    }
    const onDeleted = (payload) => {
      if (payload.channelId === activeId) {
        setMessages((current) => current.filter((item) => item.id !== payload.messageId))
      }
    }
    const onTyping = (payload) => {
      if (payload.channelId !== activeId || payload.user.id === user.id) return
      setTyping((current) => ({ ...current, [payload.user.id]: { name: payload.user.name, at: Date.now() } }))
    }
    const onPresence = (payload) => setOnline(payload.online || [])

    socket.on('message:new', onNew)
    socket.on('message:updated', onUpdated)
    socket.on('message:deleted', onDeleted)
    socket.on('reaction:updated', onUpdated)
    socket.on('typing:update', onTyping)
    socket.on('presence:update', onPresence)
    return () => {
      socket.off('message:new', onNew)
      socket.off('message:updated', onUpdated)
      socket.off('message:deleted', onDeleted)
      socket.off('reaction:updated', onUpdated)
      socket.off('typing:update', onTyping)
      socket.off('presence:update', onPresence)
    }
  }, [activeId, user.id])

  useEffect(() => {
    if (getSocket()) return
    if (!activeId) return
    const timer = setInterval(() => {
      api(`/channels/${activeId}/messages`)
        .then((data) => setMessages(data.messages))
        .catch(() => {})
      loadUsers().catch(() => {})
    }, 5000)
    return () => clearInterval(timer)
  }, [activeId])

  useEffect(() => {
    const timer = setInterval(() => {
      setTyping((current) => {
        const next = {}
        for (const [id, value] of Object.entries(current)) {
          if (Date.now() - value.at < 3200) next[id] = value
        }
        return next
      })
    }, 900)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, activeId])

  const typingNames = Object.values(typing).map((item) => item.name)

  async function sendMessage(body) {
    if (!activeId) return
    setSending(true)
    try {
      const data = await api(`/channels/${activeId}/messages`, { method: 'POST', body: { body } })
      setMessages((current) =>
        current.some((item) => item.id === data.message.id) ? current : [...current, data.message],
      )
      loadChannels().catch(() => {})
    } catch {
      return
    } finally {
      setSending(false)
    }
  }

  async function toggleReaction(messageId, emoji) {
    try {
      const data = await api(`/messages/${messageId}/reactions`, { method: 'POST', body: { emoji } })
      setMessages((current) => current.map((item) => (item.id === messageId ? data.message : item)))
    } catch {
      return
    }
  }

  async function editMessage(messageId, body) {
    try {
      const data = await api(`/messages/${messageId}`, { method: 'PATCH', body: { body } })
      setMessages((current) => current.map((item) => (item.id === messageId ? data.message : item)))
    } catch {
      return
    }
  }

  async function deleteMessage(messageId) {
    try {
      await api(`/messages/${messageId}`, { method: 'DELETE' })
      setMessages((current) => current.filter((item) => item.id !== messageId))
      loadChannels().catch(() => {})
    } catch {
      return
    }
  }

  async function createChannel(event) {
    event.preventDefault()
    setFormError('')
    try {
      const data = await api('/channels', { method: 'POST', body: channelForm })
      setNewChannelOpen(false)
      setChannelForm({ name: '', topic: '' })
      await loadChannels()
      navigate(`/app/${data.channel.id}`)
    } catch (err) {
      setFormError(err.message)
    }
  }

  async function startDm(otherId) {
    try {
      const data = await api('/channels/dm', { method: 'POST', body: { userId: otherId } })
      setDmOpen(false)
      setDmQuery('')
      await loadChannels()
      navigate(`/app/${data.channel.id}`)
    } catch (err) {
      setFormError(err.message)
    }
  }

  const dmCandidates = users
    .filter((item) => !item.self)
    .filter((item) => item.name.toLowerCase().includes(dmQuery.toLowerCase()))

  return (
    <div className="flex h-full overflow-hidden bg-[var(--bg)]">
      <aside className="hidden w-[272px] shrink-0 border-r border-[var(--line)] md:block">
        <Sidebar
          channels={channels}
          activeId={activeId}
          onSelect={(id) => navigate(`/app/${id}`)}
          onNewChannel={() => setNewChannelOpen(true)}
          onNewDm={() => setDmOpen(true)}
          online={online}
          user={user}
          logout={logout}
        />
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-[280px] max-w-[82%] border-r border-[var(--line)]">
            <Sidebar
              channels={channels}
              activeId={activeId}
              onSelect={(id) => {
                setSidebarOpen(false)
                navigate(`/app/${id}`)
              }}
              onNewChannel={() => {
                setSidebarOpen(false)
                setNewChannelOpen(true)
              }}
              onNewDm={() => {
                setSidebarOpen(false)
                setDmOpen(true)
              }}
                  online={online}
              user={user}
              logout={logout}
              compact={() => setSidebarOpen(false)}
            />
          </div>
          <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      ) : null}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[68px] items-center gap-3 border-b border-[var(--line)] px-5">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-1.5 text-slate-500 hover:bg-[var(--raised)] md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-800">
              {activeChannel?.type === 'DM' ? (
                <>
                  <Avatar user={activeChannel?.dmUser} size="xs" online={isOnline(activeChannel?.dmUser, online)} />
                  <span className="truncate">{activeChannel?.dmUser?.name || 'Direct message'}</span>
                </>
              ) : (
                <>
                  <Hash className="h-4 w-4 text-slate-500" />
                  <span className="truncate">{activeChannel?.name || 'channel'}</span>
                </>
              )}
            </div>
            <div className="truncate text-[11.5px] text-slate-500">
              {activeChannel?.type === 'DM'
                ? isOnline(activeChannel?.dmUser, online)
                  ? 'Online now'
                  : 'Direct message'
                : activeChannel?.topic || 'No topic yet'}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setMembersOpen((open) => !open)}
              className="hidden items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel-2)] px-2.5 py-1.5 text-[12.5px] text-slate-500 transition hover:border-slate-300 sm:inline-flex"
            >
              <Users className="h-3.5 w-3.5" />
              {channel?.members?.length || activeChannel?.memberCount || 1}
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex h-full items-center justify-center text-[13.5px] text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)] bg-teal-600/10 text-teal-700">
                    <Bell className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-[15px] font-semibold text-slate-700">
                    {activeChannel?.type === 'DM' ? `This is the start of your conversation with ${activeChannel?.dmUser?.name}` : `This is the start of #${activeChannel?.name}`}
                  </h3>
                  <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-slate-500">
                    Send the first message. Reactions, edits and unread counts all follow from here.
                  </p>
                </div>
              ) : (
                <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-end pb-4 pt-6">
                  {messages.map((message, index) => {
                    const previous = messages[index - 1]
                    const newDay = !previous || !sameDay(previous.createdAt, message.createdAt)
                    const compact =
                      !newDay &&
                      previous &&
                      previous.author.id === message.author.id &&
                      new Date(message.createdAt) - new Date(previous.createdAt) < 5 * 60000
                    return (
                      <div key={message.id}>
                        {newDay ? (
                          <div className="my-5 flex items-center gap-3 px-5">
                            <span className="h-px flex-1 bg-[var(--line)]" />
                            <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-500">
                              {dayLabel(message.createdAt)}
                            </span>
                            <span className="h-px flex-1 bg-[var(--line)]" />
                          </div>
                        ) : null}
                        <MessageRow
                          message={message}
                          mine={user.id}
                          compact={compact}
                          onReact={toggleReaction}
                          onEdit={editMessage}
                          onDelete={deleteMessage}
                        />
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <div className="h-5 px-4 text-[11.5px] text-slate-500">
              {typingNames.length ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex gap-0.5">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500 [animation-delay:0.1s]" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500 [animation-delay:0.2s]" />
                  </span>
                  {typingNames.join(', ')} {typingNames.length === 1 ? 'is' : 'are'} typing
                </span>
              ) : null}
            </div>

            <Composer
              channel={activeChannel}
              onSend={sendMessage}
              onTyping={() => getSocket()?.emit('typing', activeId)}
              disabled={!activeId || sending}
            />
          </div>

          {membersOpen ? (
            <aside className="hidden w-[264px] shrink-0 border-l border-[var(--line)] bg-[var(--panel)]/50 xl:block">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Members - {channel?.members?.length || 1}
                </span>
                <button onClick={() => setMembersOpen(false)} className="rounded p-1 text-slate-500 hover:bg-[var(--raised)] hover:text-slate-900">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-1 overflow-y-auto p-2">
                {(channel?.members || []).map((member) => (
                  <div key={member.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-[var(--raised)]">
                    <Avatar user={member} size="sm" online={isOnline(member, online)} />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-slate-700">
                        {member.name}
                        {member.id === user.id ? <span className="ml-1 text-[10.5px] text-slate-500">you</span> : null}
                      </div>
                      <div className="truncate text-[11px] text-slate-500">{member.title || 'Member'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      </main>

      {newChannelOpen ? (
        <Modal title="Create a channel" onClose={() => setNewChannelOpen(false)}>
          <form onSubmit={createChannel} className="space-y-4">
            <label className="block">
              <span className="text-[12.5px] font-medium text-slate-600">Name</span>
              <div className="mt-1.5 flex items-center rounded-xl border border-[var(--line)] bg-[var(--panel-2)] px-3">
                <Hash className="h-4 w-4 text-slate-500" />
                <input
                  value={channelForm.name}
                  onChange={(event) => setChannelForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  autoFocus
                  className="w-full bg-transparent px-2 py-3 text-[14px] text-slate-800 outline-none placeholder:text-[var(--faint)]"
                  placeholder="engineering"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-[12.5px] font-medium text-slate-600">Topic (optional)</span>
              <input
                value={channelForm.topic}
                onChange={(event) => setChannelForm((current) => ({ ...current, topic: event.target.value }))}
                className="app-input mt-1.5 w-full px-4 py-3 text-[14px] text-slate-800 placeholder:text-[var(--faint)]"
                placeholder="What is this channel about?"
              />
            </label>
            {formError ? <p className="text-[12.5px] text-rose-600">{formError}</p> : null}
            <button
              type="submit"
              className="app-btn app-btn-primary w-full px-4 py-3 text-[14px]"
            >
              Create channel
            </button>
          </form>
        </Modal>
      ) : null}

      {dmOpen ? (
        <Modal
          title="Start a direct message"
          onClose={() => {
            setDmOpen(false)
            setDmQuery('')
          }}
        >
          <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--panel-2)] px-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={dmQuery}
              onChange={(event) => setDmQuery(event.target.value)}
              autoFocus
              className="w-full bg-transparent py-3 text-[14px] text-slate-800 outline-none placeholder:text-[var(--faint)]"
              placeholder="Search people"
            />
          </div>
          <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
            {dmCandidates.map((person) => (
              <button
                key={person.id}
                onClick={() => startDm(person.id)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition hover:bg-[var(--raised)]"
              >
                <Avatar user={person} size="sm" online={isOnline(person, online)} />
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] text-slate-700">{person.name}</div>
                  <div className="truncate text-[11.5px] text-slate-500">{person.title || person.email}</div>
                </div>
              </button>
            ))}
            {dmCandidates.length === 0 ? (
              <p className="px-2 py-3 text-[12.5px] text-slate-500">No one matches that name yet.</p>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
