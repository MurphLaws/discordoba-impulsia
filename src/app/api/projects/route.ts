import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const stage = searchParams.get('stage')
  const status = searchParams.get('status')

  const where: any = {}
  if (session.user.role === 'JAIRO') {
    where.ownerId = session.user.id
  }
  if (stage) where.stage = stage
  if (status) where.status = status

  const projects = await db.project.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      leader: { select: { id: true, name: true, email: true } },
      alerts: { where: { resolved: false }, take: 1 },
      _count: { select: { tasks: true, activities: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return Response.json({ projects })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role === 'GERENCIA') return Response.json({ error: 'Sin permisos' }, { status: 403 })

  const body = await request.json()
  const { title, description, client, businessLine, notes, priority, leaderId, corespId, dueDate, stageDueDates } = body

  if (!title || !description || !client || !businessLine) {
    return Response.json({ error: 'Campos requeridos faltantes' }, { status: 400 })
  }

  const project = await db.project.create({
    data: {
      title,
      description,
      client,
      businessLine,
      notes,
      priority: priority || 'MEDIUM',
      ownerId: session.user.id,
      leaderId: leaderId || null,
      corespId: corespId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      stageDueDates: stageDueDates || null,
      status: 'DRAFT',
    },
  })

  // Create creation activity
  await db.activity.create({
    data: {
      projectId: project.id,
      userId: session.user.id,
      type: 'CREATION',
      content: `Proyecto creado por ${session.user.name || session.user.email}`,
    },
  })

  // Notify Arelis users if project created by Jairo
  if (session.user.role === 'JAIRO') {
    const arelisUsers = await db.user.findMany({ where: { role: 'ARELIS' } })
    await Promise.all(
      arelisUsers.map((u) =>
        db.notification.create({
          data: {
            userId: u.id,
            type: 'GENERAL',
            title: 'Nuevo proyecto registrado',
            body: `${session.user.name || session.user.email} registró "${title}"`,
            link: `/arelis/projects/${project.id}`,
          },
        })
      )
    )
  }

  return Response.json({ project }, { status: 201 })
}
