const PATTERN = /(?:DATABASE|POSTGRES|STORAGE|NEON|PG)[A-Z0-9_]*(?:URL|URI)[A-Z0-9_]*$/i
const POSTGRES = /^postgres(ql)?:\/\//

function clean(value) {
  return String(value || '')
    .trim()
    .replace(/^["']|["']$/g, '')
}

export function resolveDatabaseUrl({ preferUnpooled = false } = {}) {
  const candidates = []

  for (const [key, raw] of Object.entries(process.env)) {
    if (!PATTERN.test(key)) continue
    const url = clean(raw)
    if (!POSTGRES.test(url)) continue

    let pooled = /-pooler/.test(url)
    try {
      pooled = /-pooler/.test(new URL(url).hostname)
    } catch {}
    const direct = /UNPOOLED|NON_POOLING|DIRECT/i.test(key)
    candidates.push({ key, url, pooled, direct })
  }

  if (!candidates.length) return { url: '', key: '', pooled: false }

  const rank = (item) => {
    if (preferUnpooled) return item.direct ? 0 : item.pooled ? 2 : 1
    return item.pooled ? 0 : 1
  }

  candidates.sort((a, b) => rank(a) - rank(b))
  const best = candidates[0]
  return { url: best.url, key: best.key, pooled: best.pooled }
}
