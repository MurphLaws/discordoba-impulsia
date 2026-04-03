import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const connectionString = process.env.DATABASE_URL!

function makePrisma() {
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

declare global {
  var __prisma: ReturnType<typeof makePrisma> | undefined
}

export const db = globalThis.__prisma ?? makePrisma()
if (process.env.NODE_ENV !== 'production') globalThis.__prisma = db
