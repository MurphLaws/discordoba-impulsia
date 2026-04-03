import { auth } from '@/auth'
import { db } from '@/lib/db'

type RouteContext<T extends string = ''> = {
  params: Promise<Record<string, string>>
}

export async function GET(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params

  const project = await db.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      leader: { select: { id: true, name: true, email: true } },
      coresp: { select: { id: true, name: true, email: true } },
      activities: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
      tasks: {
        include: { assignee: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      },
      alerts: { where: { resolved: false }, orderBy: { createdAt: 'desc' } },
      stageHistory: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!project) return Response.json({ error: 'No encontrado' }, { status: 404 })

  // Jairo can only see their own projects
  if (session.user.role === 'JAIRO' && project.ownerId !== session.user.id) {
    return Response.json({ error: 'Sin permisos' }, { status: 403 })
  }

  return Response.json({ project })
}

export async function PATCH(request: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role === 'GERENCIA') return Response.json({ error: 'Sin permisos' }, { status: 403 })

  const { id } = await ctx.params
  const body = await request.json()

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return Response.json({ error: 'No encontrado' }, { status: 404 })

  if (session.user.role === 'JAIRO' && project.ownerId !== session.user.id) {
    return Response.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const updated = await db.project.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description && { description: body.description }),
      ...(body.client && { client: body.client }),
      ...(body.businessLine && { businessLine: body.businessLine }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.priority && { priority: body.priority }),
      ...(body.leaderId !== undefined && { leaderId: body.leaderId }),
      ...(body.corespId !== undefined && { corespId: body.corespId }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      ...(body.stageDueDates !== undefined && { stageDueDates: body.stageDueDates }),
      ...(body.status && { status: body.status }),
    },
  })

  return Response.json({ project: updated })
}
