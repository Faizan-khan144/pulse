import jwt from 'jsonwebtoken'

export const SECRET = process.env.JWT_SECRET || 'pulse-dev-secret-change-in-prod'

export function signToken(user) {
  return jwt.sign({ id: user.id }, SECRET, { expiresIn: '30d' })
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    req.user = jwt.verify(token, SECRET)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
  next()
}
