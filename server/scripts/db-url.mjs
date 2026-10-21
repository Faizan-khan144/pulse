import { resolveDatabaseUrl } from '../src/dbUrl.js'

const { url, key, pooled } = resolveDatabaseUrl({ preferUnpooled: true })

if (!url) {
  console.error('== no postgres url found. Connect Neon under Storage or add DATABASE_URL.')
  process.exit(1)
}

let host = ''
try {
  host = new URL(url).hostname
} catch {}

console.error(`== using ${key} | host ${host}${pooled ? ' | pooled' : ''}`)
process.stdout.write(url)
