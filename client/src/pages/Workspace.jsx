import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Bell,
  Bot,
  CalendarDays,
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
import { cn, dayLabel, formatTime, isOnline, preview, sameDay } from '../lib/utils'

const QUICK_EMOJI = ['👍', '🔥', '🎉', '😂', '👀', '✅', '🙌', '💡']

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-28 backdrop-blur-sm a-fade"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-2xl app-pop"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
          <h3 className="text-[14px] font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-[var(--raised)] hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function BotTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-teal-600/20 bg-teal-600/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-teal-700">
      <Bot className="h-2.5 w-2.5" /> bot
    </span>
  )
}

function SectionLabel({ children, count, action }) {
  return (
    <div className="flex items-center gap-2 px-2 pb-1.5 pt-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{children}</span>
      <span className="rounded-full border border-[var(--line)] bg-white px-1.5 py-0.5 text-[9px] text-[var(--faint)]">
        {count}
      </span>
      {action ? <span className="ml-auto">{action}</span> : null}
    </div>
  )
}

function Sidebar({ channels, activeId, onSelect, onNewChannel, onNewDm, online, user, logout, compact }) {
  const [query, setQuery] = useState('')

  const filtered = (type) =>
    channels
      .filter((channel) => channel.type === type)
      .filter((channel) => {
        if (!query.trim()) return true
        const label = channel.type === 'DM' ? channel.dmUser?.name || '' : channel.name
        return label.toLowerCase().includes(query.trim().toLowerCase())
      })

  const rooms = filtered('PUBLIC')
  const direct = filtered('DM')

  return (
    <div className="flex h-full w-full flex-col bg-[var(--panel)]">
      <div className="flex h-[76px] items-center gap-2.5 border-b border-[var(--line)] px-4">
        <Logo size={34} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold tracking-tight">Pulse</span>
            <span className="rounded-full border border-teal-600/20 bg-teal-600/10 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.12em] text-teal-700">
              workspace
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {online.length} {online.length === 1 ? 'person' : 'people'} online
          </div>
        </div>
        {compact ? (
          <button onClick={compact} className="rounded-lg p-1.5 text-slate-500 hover:bg-[var(--raised)]">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="px-3 pt-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onNewChannel}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--line)] bg-white px-2 py-2 text-[11.5px] font-medium text-slate-600 transition hover:border-teal-600/30 hover:text-teal-800"
          >
            <Plus className="h-3.5 w-3.5" /> Channel
          </button>
          <button
            onClick={onNewDm}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--line)] bg-white px-2 py-2 text-[11.5px] font-medium text-slate-600 transition hover:border-teal-600/30 hover:text-teal-800"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" /> Message
          </button>
        </div>
        <label className="mt-2.5 flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-2.5 transition focus-within:border-teal-600/40 focus-within:bg-white">
          <Search className="h-3.5 w-3.5 shrink-0 text-[var(--faint)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter conversations"
            className="w-full bg-transparent py-2 text-[12px] text-slate-700 outline-none placeholder:text-[var(--faint)]"
          />
          {query ? (
            <button onClick={() => setQuery('')} className="text-[var(--faint)] hover:text-slate-600">
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </label>
      </div>

      <div className="thin-scroll mt-4 flex-1 overflow-y-auto px-2.5 pb-4">
        <SectionLabel
          count={rooms.length}
          action={
            <button
              onClick={onNewChannel}
              className="rounded-md p-1 text-[var(--faint)] transition hover:bg-[var(--raised)] hover:text-slate-800"
              title="New channel"
            >
              <Plus className="h-3 w-3" />
            </button>
          }
        >
          Channels
        </SectionLabel>
        <div className="space-y-0.5">
          {rooms.length === 0 ? (
            <p className="px-2 py-2 text-[11.5px] text-[var(--faint)]">No channels match.</p>
          ) : null}
          {rooms.map((channel) => {
            const active = channel.id === activeId
            return (
              <button
                key={channel.id}
                onClick={() => onSelect(channel.id)}
                className={cn(
                  'group relative flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors duration-200',
                  active
                    ? 'bg-teal-600/10 text-teal-900'
                    : channel.unread
                      ? 'text-slate-700 hover:bg-[var(--panel-2)]'
                      : 'text-slate-600 hover:bg-[var(--panel-2)]',
                )}
              >
                {active ? (
                  <span className="absolute inset-y-2 left-0 w-[2.5px] rounded-full bg-teal-500" />
                ) : null}
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border',
                    active
                      ? 'border-teal-600/20 bg-white text-teal-700'
                      : 'border-[var(--line)] bg-white text-slate-400',
                  )}
                >
                  <Hash className="h-3.5 w-3.5" />
                </span>
                <span className={cn('truncate text-[13px]', channel.unread && 'font-medium')}>{channel.name}</span>
                {channel.unread ? (
                  <span className="ml-auto rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {channel.unread}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        <div className="mt-5">
          <SectionLabel
            count={direct.length}
            action={
              <button
                onClick={onNewDm}
                className="rounded-md p-1 text-[var(--faint)] transition hover:bg-[var(--raised)] hover:text-slate-800"
                title="New message"
              >
                <MessageSquarePlus className="h-3 w-3" />
              </button>
            }
          >
            Direct messages
          </SectionLabel>
          <div className="space-y-0.5">
            {direct.length === 0 ? (
              <p className="px-2 py-2 text-[11.5px] text-[var(--faint)]">No conversations match.</p>
            ) : null}
            {direct.map((channel) => {
              const active = channel.id === activeId
              const person = channel.dmUser
              const bot = Boolean(person?.isBot)
              return (
                <button
                  key={channel.id}
                  onClick={() => onSelect(channel.id)}
                  className={cn(
                    'group relative flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors duration-200',
                    active
                      ? 'bg-teal-600/10 text-teal-900'
                      : bot
                        ? 'bg-teal-600/[0.04] text-slate-700 hover:bg-teal-600/[0.08]'
                        : 'text-slate-600 hover:bg-[var(--panel-2)]',
                  )}
                >
                  {active ? (
                    <span className="absolute inset-y-2 left-0 w-[2.5px] rounded-full bg-teal-500" />
                  ) : null}
                  <Avatar user={person} size="sm" online={isOnline(person, online)} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-medium">{person?.name || 'Direct message'}</span>
                      {bot ? <BotTag /> : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[10.5px] text-[var(--faint)]">
                      {channel.lastMessage?.body ? preview(channel.lastMessage.body, 28) : 'No messages yet'}
                    </span>
                  </span>
                  {channel.unread ? (
                    <span className="ml-auto rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {channel.unread}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--line)] p-2.5">
        <div className="flex items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-2">
          <Avatar user={user} size="sm" online />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-medium text-slate-700">{user?.name}</div>
            <div className="truncate text-[10.5px] text-slate-500">{user?.email}</div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
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
    <div
      className={cn(
        'group relative flex gap-3 px-4 py-1.5 transition-colors duration-200 hover:bg-[var(--panel-2)]/60 md:px-6',
        compact ? 'mt-0' : 'mt-4',
      )}
    >
      {compact ? (
        <div className="w-10 shrink-0 pt-1 text-right">
          <span className="hidden text-[10px] text-[var(--faint)] group-hover:inline">
            {formatTime(message.createdAt)}
          </span>
        </div>
      ) : (
        <Avatar user={message.author} size="md" className="mt-0.5" />
      )}
      <div className="min-w-0 flex-1">
        {compact ? null : (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[13.5px] font-semibold text-slate-800">{message.author.name}</span>
            {message.author.isBot ? <BotTag /> : null}
            <span className="text-[10.5px] text-[var(--faint)]">{formatTime(message.createdAt)}</span>
          </div>
        )}

        {editing ? (
          <div className="mt-1.5">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-teal-600/40 bg-white px-3 py-2 text-[13.5px] text-slate-800 outline-none"
              autoFocus
            />
            <div className="mt-2 flex items-center gap-2.5 text-[12px]">
              <button
                onClick={save}
                className="rounded-lg bg-teal-600 px-3 py-1.5 font-medium text-white transition hover:bg-teal-500"
              >
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
          <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-[1.65] text-slate-600">
            {message.body}
            {message.edited ? (
              <span className="ml-1.5 rounded bg-[var(--panel-2)] px-1 py-0.5 text-[9.5px] font-medium text-[var(--faint)]">
                edited
              </span>
            ) : null}
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
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] transition',
                    active
                      ? 'border-teal-600/40 bg-teal-600/10 text-teal-800'
                      : 'border-[var(--line)] bg-white text-slate-500 hover:border-slate-300',
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

      <div className="invisible absolute -top-3 right-3 flex items-center gap-0.5 rounded-xl border border-[var(--line)] bg-white p-1 opacity-0 shadow-lg shadow-slate-900/5 transition-all duration-200 group-hover:visible group-hover:opacity-100 focus-within:visible focus-within:opacity-100">
        <button
          onClick={() => setMenu((value) => !value)}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-[var(--panel-2)] hover:text-slate-900"
          title="React"
        >
          <SmilePlus className="h-3.5 w-3.5" />
        </button>
        {message.author.id === mine ? (
          <>
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-[var(--panel-2)] hover:text-slate-900"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(message.id)}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        ) : null}
      </div>

      {menu ? (
        <div className="absolute right-3 top-4 z-20 flex gap-1 rounded-xl border border-[var(--line)] bg-white p-1.5 shadow-xl app-pop">
          {QUICK_EMOJI.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(message.id, emoji)
                setMenu(false)
              }}
              className="rounded-lg px-1.5 py-1 text-base transition hover:bg-[var(--panel-2)]"
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
    node.style.height = `${Math.min(node.scrollHeight, 168)}px`
  }

  function submit() {
    const body = value.trim()
    if (!body || disabled) return
    onSend(body)
    setValue('')
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.focus()
    }
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

  const label =
    channel?.type === 'DM'
      ? `Message ${channel?.dmUser?.name || ''}`
      : `Message #${channel?.name || ''}`

  return (
    <div className="shrink-0 border-t border-[var(--line)] bg-[var(--panel)] px-3 py-3 md:px-6 md:py-4">
      <div className="mx-auto w-full max-w-3xl">
        <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--panel-2)]/70 p-1.5 transition-all duration-300 focus-within:border-teal-600/40 focus-within:bg-white focus-within:shadow-[0_18px_36px_-28px_rgba(16,18,45,0.45)]">
          <textarea
            ref={ref}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={label}
            className="max-h-44 w-full resize-none bg-transparent px-3 py-2 text-[14px] leading-relaxed text-slate-800 outline-none placeholder:text-[var(--faint)]"
          />
          <div className="flex items-center gap-2 px-1 pb-0.5 pt-1">
            <button
              type="button"
              onClick={() => setEmojiOpen((open) => !open)}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-[var(--raised)] hover:text-slate-800"
              title="Emoji"
            >
              <SmilePlus className="h-4 w-4" />
            </button>
            <span className="hidden items-center gap-1.5 text-[10px] text-[var(--faint)] sm:flex">
              <kbd className="rounded-md border border-[var(--line)] bg-white px-1.5 py-0.5 text-[9.5px] text-slate-500">
                Enter
              </kbd>
              send
              <span className="text-[var(--line-strong)]">/</span>
              <kbd className="rounded-md border border-[var(--line)] bg-white px-1.5 py-0.5 text-[9.5px] text-slate-500">
                Shift + Enter
              </kbd>
              new line
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim() || disabled}
              className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-3.5 py-2 text-[12px] font-medium text-white shadow-[0_8px_18px_-10px_rgba(15,157,138,0.9)] transition hover:brightness-105 disabled:opacity-40 disabled:shadow-none"
            >
              {disabled ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Send
            </button>
          </div>
          {emojiOpen ? (
            <div className="absolute bottom-16 right-2 z-20 flex gap-1 rounded-xl border border-[var(--line)] bg-white p-1.5 shadow-xl app-pop">
              {QUICK_EMOJI.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setValue((current) => current + emoji)
                    setEmojiOpen(false)
                    ref.current?.focus()
                  }}
                  className="rounded-lg px-1.5 py-1 text-base transition hover:bg-[var(--panel-2)]"
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function MembersPanel({ channel, selfId, online, onClose }) {
  const members = channel?.members || []
  const isDm = channel?.type === 'DM'
  const botMember = members.find((member) => member.isBot)
  const onlineMembers = members.filter((member) => isOnline(member, online))
  const offlineMembers = members.filter((member) => !isOnline(member, online))

  const row = (member) => (
    <div key={member.id} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-white">
      <Avatar user={member} size="sm" online={isOnline(member, online)} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[12.5px] font-medium text-slate-700">{member.name}</span>
          {member.isBot ? <BotTag /> : null}
          {member.id === selfId ? <span className="text-[9.5px] text-[var(--faint)]">you</span> : null}
        </div>
        <div className="truncate text-[10.5px] text-[var(--faint)]">{member.title || 'Member'}</div>
      </div>
    </div>
  )

  return (
    <aside className="hidden w-[286px] shrink-0 flex-col border-l border-[var(--line)] bg-[var(--panel-2)]/40 xl:flex">
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-[var(--line)] px-4">
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Members
          <span className="rounded-full border border-[var(--line)] bg-white px-1.5 py-0.5 text-[9px] text-[var(--faint)]">
            {members.length}
          </span>
        </span>
        <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="thin-scroll flex-1 overflow-y-auto p-2.5">
        {onlineMembers.length ? (
          <>
            <div className="px-2 pb-1 pt-1 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
              Online - {onlineMembers.length}
            </div>
            {onlineMembers.map(row)}
          </>
        ) : null}
        {offlineMembers.length ? (
          <>
            <div className="px-2 pb-1 pt-3 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--faint)]">
              Offline - {offlineMembers.length}
            </div>
            {offlineMembers.map(row)}
          </>
        ) : null}

        <div className="mt-4 rounded-xl border border-[var(--line)] bg-white p-4">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--faint)]">About</div>
          <p className="mt-2 text-[11.5px] leading-relaxed text-slate-600">
            {isDm
              ? botMember
                ? 'The workspace bot. Ask it "help", "channels", "team" or "whoami" in this DM.'
                : `A private conversation between you and ${members.find((member) => member.id !== selfId)?.name || 'your teammate'}.`
              : channel?.topic || 'No topic set for this channel yet.'}
          </p>
          <div className="mt-3 space-y-1.5 border-t border-[var(--line)] pt-3 text-[10.5px] text-slate-500">
            <div className="flex items-center justify-between">
              <span>Type</span>
              <span className="font-medium text-slate-700">{isDm ? 'Direct message' : 'Public channel'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Members</span>
              <span className="font-medium text-slate-700">{members.length}</span>
            </div>
            {channel?.createdAt ? (
              <div className="flex items-center justify-between">
                <span>Created</span>
                <span className="font-medium text-slate-700">
                  {new Date(channel.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
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
        if (!activeId && list.length) {
          const first = list.find((item) => item.dmUser?.isBot) || list[0]
          navigate(`/app/${first.id}`, { replace: true })
        }
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
    .filter((item) => !item.self && !item.isBot)
    .filter((item) => item.name.toLowerCase().includes(dmQuery.toLowerCase()))

  const isDm = activeChannel?.type === 'DM'
  const dmUser = activeChannel?.dmUser
  const memberTotal = channel?.members?.length || activeChannel?.memberCount || 1
  const title = isDm ? dmUser?.name || 'Direct message' : activeChannel?.name || 'channel'
  const subtitle = isDm
    ? dmUser?.isBot
      ? 'Workspace bot - setup notes'
      : isOnline(dmUser, online)
        ? 'Online now'
        : 'Direct message'
    : activeChannel?.topic || 'No topic yet'
  const memberStack = (channel?.members || []).slice(0, 3)

  return (
    <div className="flex h-full overflow-hidden bg-[var(--bg)]">
      <aside className="hidden w-[286px] shrink-0 border-r border-[var(--line)] md:block">
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
          <div className="w-[286px] max-w-[86%] border-r border-[var(--line)]">
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

      <main className="flex min-w-0 flex-1 p-2.5 md:p-4">
        <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-[0_30px_60px_-52px_rgba(16,18,45,0.55)]">
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[var(--line)] px-4 md:px-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-[var(--raised)] md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              {isDm ? (
                <Avatar user={dmUser} size="md" online={isOnline(dmUser, online)} />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-600/20 bg-gradient-to-br from-teal-600/15 to-emerald-500/5 text-teal-700">
                  <Hash className="h-[18px] w-[18px]" />
                </span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-[16px] font-semibold tracking-tight text-slate-900">{title}</h1>
                  {dmUser?.isBot ? <BotTag /> : null}
                  <span className="hidden rounded-full border border-[var(--line)] bg-[var(--panel-2)] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-slate-500 sm:inline-flex">
                    {isDm ? 'Direct' : 'Channel'}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11.5px] text-slate-500">{subtitle}</p>
              </div>

              <div className="ml-auto flex items-center gap-2.5">
                {!isDm && memberStack.length ? (
                  <div className="hidden items-center -space-x-2 sm:flex">
                    {memberStack.map((member) => (
                      <Avatar
                        key={member.id}
                        user={member}
                        size="xs"
                        online={isOnline(member, online)}
                        className="rounded-[10px] ring-2 ring-[var(--panel)]"
                      />
                    ))}
                    {memberTotal > memberStack.length ? (
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] border-2 border-[var(--panel)] bg-[var(--panel-2)] text-[9.5px] font-medium text-slate-500">
                        +{memberTotal - memberStack.length}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <button
                  onClick={() => setMembersOpen((open) => !open)}
                  className={cn(
                    'hidden items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11.5px] transition xl:inline-flex',
                    membersOpen
                      ? 'border-teal-600/25 bg-teal-600/10 text-teal-800'
                      : 'border-[var(--line)] bg-[var(--panel-2)] text-slate-500 hover:text-slate-800',
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                  {memberTotal}
                </button>
              </div>
            </header>

            <div className="chat-canvas flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex h-full items-center justify-center text-[13px] text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading conversation...
                </div>
              ) : (
                <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-end pb-4 pt-6">
                  <div className="px-4 a-fade md:px-6">
                    <div className="mx-auto max-w-sm text-center">
                      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-600/20 bg-teal-600/10 text-teal-700">
                        {isDm ? (
                          <Avatar user={dmUser} size="md" />
                        ) : (
                          <Hash className="h-5 w-5" />
                        )}
                      </span>
                      <h2 className="mt-4 text-[17px] font-semibold tracking-tight text-slate-800">
                        {isDm ? `Conversation with ${title}` : `#${title}`}
                      </h2>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">
                        {isDm
                          ? dmUser?.isBot
                            ? 'The workspace bot answers a few setup questions: help, channels, team and whoami. It never pretends to be a teammate.'
                            : 'This is the start of your private conversation. Nothing here is posted to a channel.'
                          : activeChannel?.topic || 'This channel is ready. Send the first message.'}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                        {channel?.createdAt ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[10px] text-slate-500">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(channel.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[10px] text-slate-500">
                          <Users className="h-3 w-3" />
                          {memberTotal} {memberTotal === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {messages.length === 0 ? (
                    <div className="mt-8 flex flex-col items-center gap-2 text-center">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--faint)]">
                        <Bell className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-[11.5px] text-[var(--faint)]">No messages yet. Start the conversation.</p>
                    </div>
                  ) : (
                    <div className="mt-8">
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
                              <div className="my-6 flex items-center gap-3 px-4 md:px-6">
                                <span className="h-px flex-1 bg-[var(--line)]" />
                                <span className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-[0.12em] text-slate-500">
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
              )}
            </div>

            <div className="h-6 shrink-0 px-4 text-[10.5px] text-slate-500 md:px-6">
              {typingNames.length ? (
                <span className="inline-flex items-center gap-1.5 a-fade">
                  <span className="flex gap-0.5">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-teal-500" />
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
            <MembersPanel
              channel={channel}
              selfId={user.id}
              online={online}
              onClose={() => setMembersOpen(false)}
            />
          ) : null}
        </div>
      </main>

      {newChannelOpen ? (
        <Modal title="Create a channel" onClose={() => setNewChannelOpen(false)}>
          <form onSubmit={createChannel} className="space-y-4">
            <label className="block">
              <span className="text-[12px] font-medium text-slate-600">Name</span>
              <div className="mt-1.5 flex items-center rounded-xl border border-[var(--line)] bg-[var(--panel-2)] px-3">
                <Hash className="h-4 w-4 text-slate-500" />
                <input
                  value={channelForm.name}
                  onChange={(event) => setChannelForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  autoFocus
                  className="w-full bg-transparent px-2 py-3 text-[13.5px] text-slate-800 outline-none placeholder:text-[var(--faint)]"
                  placeholder="engineering"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-[12px] font-medium text-slate-600">Topic (optional)</span>
              <input
                value={channelForm.topic}
                onChange={(event) => setChannelForm((current) => ({ ...current, topic: event.target.value }))}
                className="app-input mt-1.5 w-full px-4 py-3 text-[13.5px] text-slate-800 placeholder:text-[var(--faint)]"
                placeholder="What is this channel about?"
              />
            </label>
            {formError ? <p className="text-[12px] text-rose-600">{formError}</p> : null}
            <button type="submit" className="app-btn app-btn-primary w-full px-4 py-3 text-[13.5px]">
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
              className="w-full bg-transparent py-3 text-[13.5px] text-slate-800 outline-none placeholder:text-[var(--faint)]"
              placeholder="Search people"
            />
          </div>
          <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
            {dmCandidates.map((person) => (
              <button
                key={person.id}
                onClick={() => startDm(person.id)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-[var(--raised)]"
              >
                <Avatar user={person} size="sm" online={isOnline(person, online)} />
                <div className="min-w-0">
                  <div className="truncate text-[13px] text-slate-700">{person.name}</div>
                  <div className="truncate text-[11px] text-slate-500">{person.title || person.email}</div>
                </div>
              </button>
            ))}
            {dmCandidates.length === 0 ? (
              <p className="px-2 py-3 text-[12px] text-slate-500">No one matches that name yet.</p>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
