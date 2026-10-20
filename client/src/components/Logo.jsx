import { useId } from 'react'

export default function Logo({ size = 32, className = '' }) {
  const raw = useId().replace(/[:]/g, '')
  const tile = `pulse-tile-${raw}`
  const glow = `pulse-glow-${raw}`

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={tile} x1="3" y1="2" x2="29" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2bd4bb" />
          <stop offset="0.55" stopColor="#0f9d8a" />
          <stop offset="1" stopColor="#0a5b55" />
        </linearGradient>
        <radialGradient id={glow} cx="0" cy="0" r="1" gradientTransform="translate(9 7) rotate(48) scale(27)">
          <stop stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9.5" fill={`url(#${tile})`} />
      <rect x="1" y="1" width="30" height="30" rx="9.5" fill={`url(#${glow})`} />
      <rect
        x="1.55"
        y="1.55"
        width="28.9"
        height="28.9"
        rx="9"
        stroke="white"
        strokeOpacity="0.22"
        strokeWidth="0.9"
      />
      <path
        d="M7.6 7.1h12.9c1.3 0 2.3 1 2.3 2.3v7c0 1.3-1 2.3-2.3 2.3h-6.9l-3.9 2.8v-2.8H7.6c-1.3 0-2.3-1-2.3-2.3v-7c0-1.3 1-2.3 2.3-2.3Z"
        fill="white"
        fillOpacity="0.35"
      />
      <path
        d="M12.2 12.1h11.7c1.3 0 2.3 1 2.3 2.3v6c0 1.3-1 2.3-2.3 2.3h-4.4l-3.3 2.5v-2.5h-4c-1.3 0-2.3-1-2.3-2.3v-6c0-1.3 1-2.3 2.3-2.3Z"
        fill="white"
      />
      <circle cx="16.1" cy="17.4" r="1.2" fill="#0e9384" />
      <circle cx="20" cy="17.4" r="1.2" fill="#0e9384" fillOpacity="0.72" />
      <circle cx="23.9" cy="17.4" r="1.2" fill="#0e9384" fillOpacity="0.45" />
    </svg>
  )
}
