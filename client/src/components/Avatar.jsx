import { cn, initials } from '../lib/utils'

const sizes = {
  xs: 'h-7 w-7 text-[10.5px]',
  sm: 'h-9 w-9 text-[11.5px]',
  md: 'h-10 w-10 text-[13px]',
  lg: 'h-12 w-12 text-[15px]',
}

export default function Avatar({ user, size = 'md', online = false, className = '' }) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-[10px] font-semibold text-white shadow-sm',
          sizes[size],
        )}
        style={{ background: `linear-gradient(140deg, ${user?.avatarColor || '#0e9384'}, rgba(0,0,0,0.35))` }}
      >
        {initials(user?.name || '?')}
      </span>
      {online ? (
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--panel)] bg-emerald-500" />
      ) : null}
    </span>
  )
}
