import { PrismaClient } from '../src/generated/prisma'
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
  console.log('Creating demo users...')
  const passwordHash = await bcrypt.hash('Demo1234!', 10)

  const jairo = await prisma.user.create({
    data: {
      email: 'jairo@discordoba.co',
      passwordHash,
      role: 'JAIRO',
      name: 'Jairo Ortega',
      activated: true,
    },
  })

  const arelis = await prisma.user.create({
    data: {
      email: 'arelis@discordoba.co',
      passwordHash,
      role: 'ARELIS',
      name: 'Arelis Sánchez',
      activated: true,
    },
  })

  const gerencia = await prisma.user.create({
    data: {
      email: 'gerencia@discordoba.co',
      passwordHash,
      role: 'GERENCIA',
      name: 'Ana Gerente',
      activated: true,
    },
  })

  console.log('Creating sample projects...')

  // Project 1: Plataforma E-commerce Empresa XYZ
  const project1 = await prisma.project.create({
    data: {
      title: 'Plataforma E-commerce Empresa XYZ',
      description: 'Desarrollo de plataforma de comercio electrónico con integración de pagos y gestión de inventario en tiempo real',
      client: 'XYZ Corp',
      businessLine: 'Tecnología',
      stage: 'OPORTUNIDAD',
      priority: 'HIGH',
      ownerId: jairo.id,
    },
  })

  // Activity: CREATION for project 1
  await prisma.activity.create({
    data: {
      projectId: project1.id,
      userId: jairo.id,
      type: 'CREATION',
      content: 'Proyecto creado en sistema de demo',
    },
  })

  // Activity: PROGRESS for project 1
  await prisma.activity.create({
    data: {
      projectId: project1.id,
      userId: jairo.id,
      type: 'PROGRESS',
      content: 'Realizado análisis inicial de requisitos con el cliente',
    },
  })

  // Project 2: Análisis de Viabilidad Sistema ERP
  const project2 = await prisma.project.create({
    data: {
      title: 'Análisis de Viabilidad Sistema ERP',
      description: 'Evaluación técnica y financiera para implementación de ERP empresarial',
      client: 'ABC Industries',
      businessLine: 'ERP',
      stage: 'VIABILIDAD_TECNICA',
      priority: 'MEDIUM',
      ownerId: jairo.id,
      leaderId: arelis.id,
    },
  })

  // Activity: CREATION for project 2
  await prisma.activity.create({
    data: {
      projectId: project2.id,
      userId: jairo.id,
      type: 'CREATION',
      content: 'Proyecto creado en sistema de demo',
    },
  })

  // Activity: PROGRESS for project 2
  await prisma.activity.create({
    data: {
      projectId: project2.id,
      userId: arelis.id,
      type: 'PROGRESS',
      content: 'Se completó análisis técnico preliminar',
    },
  })

  // StageHistory for project 2
  await prisma.stageHistory.create({
    data: {
      projectId: project2.id,
      fromStage: 'OPORTUNIDAD',
      toStage: 'VIABILIDAD_TECNICA',
      note: 'Aprobado para análisis técnico',
      createdBy: jairo.id,
    },
  })

  // Project 3: Muestra Prototipo App Móvil
  const dueDate3 = new Date()
  dueDate3.setDate(dueDate3.getDate() + 30)

  const project3 = await prisma.project.create({
    data: {
      title: 'Muestra Prototipo App Móvil',
      description: 'Desarrollo y presentación de prototipo de aplicación móvil para cliente tech',
      client: 'Tech Startup',
      businessLine: 'Móvil',
      stage: 'MUESTRA',
      priority: 'CRITICAL',
      ownerId: jairo.id,
      leaderId: arelis.id,
      dueDate: dueDate3,
    },
  })

  // Activity: CREATION for project 3
  await prisma.activity.create({
    data: {
      projectId: project3.id,
      userId: jairo.id,
      type: 'CREATION',
      content: 'Proyecto creado en sistema de demo',
    },
  })

  // Activity: PROGRESS for project 3
  await prisma.activity.create({
    data: {
      projectId: project3.id,
      userId: arelis.id,
      type: 'PROGRESS',
      content: 'Prototipo de interfaz completado y listo para demostración',
    },
  })

  // StageHistory for project 3
  await prisma.stageHistory.create({
    data: {
      projectId: project3.id,
      fromStage: 'OPORTUNIDAD',
      toStage: 'MUESTRA',
      note: 'Prototipo desarrollado y aprobado',
      createdBy: jairo.id,
    },
  })

  // Project 4: Validación Software Contabilidad
  const project4 = await prisma.project.create({
    data: {
      title: 'Validación Software Contabilidad',
      description: 'Testing y validación de sistema contable para cumplimiento normativo',
      client: 'Contadores & Co',
      businessLine: 'Fintech',
      stage: 'VALIDACION',
      priority: 'MEDIUM',
      ownerId: jairo.id,
    },
  })

  // Activity: CREATION for project 4
  await prisma.activity.create({
    data: {
      projectId: project4.id,
      userId: jairo.id,
      type: 'CREATION',
      content: 'Proyecto creado en sistema de demo',
    },
  })

  // Activity: PROGRESS for project 4
  await prisma.activity.create({
    data: {
      projectId: project4.id,
      userId: jairo.id,
      type: 'PROGRESS',
      content: 'Completados tests unitarios y de integración',
    },
  })

  // StageHistory for project 4
  await prisma.stageHistory.create({
    data: {
      projectId: project4.id,
      fromStage: 'OPORTUNIDAD',
      toStage: 'VALIDACION',
      note: 'Pasó viabilidad técnica',
      createdBy: jairo.id,
    },
  })

  // Project 5: Lanzamiento CRM Corporativo
  const project5 = await prisma.project.create({
    data: {
      title: 'Lanzamiento CRM Corporativo',
      description: 'Implementación y lanzamiento de plataforma CRM para gestión de relaciones con clientes',
      client: 'Global Corp',
      businessLine: 'CRM',
      stage: 'LANZAMIENTO',
      priority: 'HIGH',
      status: 'ACTIVE',
      ownerId: jairo.id,
    },
  })

  // Activity: CREATION for project 5
  await prisma.activity.create({
    data: {
      projectId: project5.id,
      userId: jairo.id,
      type: 'CREATION',
      content: 'Proyecto creado en sistema de demo',
    },
  })

  // Activity: PROGRESS for project 5
  await prisma.activity.create({
    data: {
      projectId: project5.id,
      userId: jairo.id,
      type: 'PROGRESS',
      content: 'Sistema desplegado en ambiente de producción',
    },
  })

  // StageHistory for project 5
  await prisma.stageHistory.create({
    data: {
      projectId: project5.id,
      fromStage: 'OPORTUNIDAD',
      toStage: 'LANZAMIENTO',
      note: 'Completada validación y lista para producción',
      createdBy: jairo.id,
    },
  })

  // Project 6: Sistema Inventario Almacén
  const project6 = await prisma.project.create({
    data: {
      title: 'Sistema Inventario Almacén',
      description: 'Desarrollo de sistema de gestión de inventario con seguimiento en tiempo real',
      client: 'LogiStore',
      businessLine: 'Logística',
      stage: 'OPORTUNIDAD',
      priority: 'LOW',
      ownerId: jairo.id,
    },
  })

  // Activity: CREATION for project 6
  await prisma.activity.create({
    data: {
      projectId: project6.id,
      userId: jairo.id,
      type: 'CREATION',
      content: 'Proyecto creado en sistema de demo',
    },
  })

  // Activity: PROGRESS for project 6
  await prisma.activity.create({
    data: {
      projectId: project6.id,
      userId: jairo.id,
      type: 'PROGRESS',
      content: 'Reunión inicial realizada con equipo de logística',
    },
  })

  console.log('Creating tasks for projects 1 and 3...')

  // Tasks for Project 1
  const task1_1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Recopilar requisitos funcionales',
      assigneeId: jairo.id,
      completed: true,
      completedAt: new Date(),
    },
  })

  await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Diseñar arquitectura de base de datos',
      assigneeId: jairo.id,
    },
  })

  await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Preparar propuesta de timeline',
      assigneeId: arelis.id,
    },
  })

  // Tasks for Project 3
  const task3_1 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: 'Diseñar interfaz de usuario',
      assigneeId: arelis.id,
      completed: true,
      completedAt: new Date(),
    },
  })

  await prisma.task.create({
    data: {
      projectId: project3.id,
      title: 'Implementar funcionalidades principales',
      assigneeId: jairo.id,
    },
  })

  await prisma.task.create({
    data: {
      projectId: project3.id,
      title: 'Realizar sesión de testing con cliente',
      assigneeId: arelis.id,
    },
  })

  console.log('Creating sample notification...')

  // Create notification for jairo
  await prisma.notification.create({
    data: {
      userId: jairo.id,
      type: 'GENERAL',
      title: 'Bienvenido a ImpulsIA',
      body: 'Tu cuenta ha sido activada. Puedes comenzar a registrar proyectos.',
      read: false,
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
