import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clean up existing seed data
  console.log('Cleaning up existing data...')
  await prisma.notification.deleteMany()
  await prisma.task.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.stageHistory.deleteMany()
  await prisma.alert.deleteMany()
  await prisma.project.deleteMany()
  await prisma.token.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  console.log('Creating users...')
  const passwordHash = await bcrypt.hash('Demo1234!', 10)

  await prisma.user.create({
    data: {
      email: 'jairo@discordoba.co',
      passwordHash,
      role: 'JAIRO',
      name: 'Jairo Ortega',
      activated: true,
    },
  })

  await prisma.user.create({
    data: {
      email: 'arelis@discordoba.co',
      passwordHash,
      role: 'ARELIS',
      name: 'Arelis Sánchez',
      activated: true,
    },
  })

  await prisma.user.create({
    data: {
      email: 'gerencia@discordoba.co',
      passwordHash,
      role: 'GERENCIA',
      name: 'Ana Gerente',
      activated: true,
    },
  })

  console.log('Seed complete!')
}

main()
  .then(() => {
    console.log('Database seeded successfully')
    process.exit(0)
  })
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
