import { PrismaClient } from '@prisma/client'

const url =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL

if (url && !process.env.DATABASE_URL) process.env.DATABASE_URL = url

export const prisma = new PrismaClient()