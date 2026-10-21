import { PrismaClient } from '@prisma/client'

import { resolveDatabaseUrl } from './dbUrl.js'

if (!process.env.DATABASE_URL) {
  const resolved = resolveDatabaseUrl()
  if (resolved.url) process.env.DATABASE_URL = resolved.url
}

export const prisma = new PrismaClient()
