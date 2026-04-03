import { auth } from '@/auth'
import { db } from '@/lib/db'

type RouteContext = {
  params: Promise<Record<string, string>>
}

export async function GET(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await ctx.params

  const activities = await db.activity.findMany({
    where: { projectId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json({ activities })
}

export async function POST(request: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role === 'GERENCIA') return Response.json({ error: 'Sin permisos' }, { status: 403 })

  const { id } = await ctx.params
  const { type, content } = await request.json()

  if (!content?.trim()) return Response.json({ error: 'Contenido requerido' }, { status: 400 })

  const project = await db.project.findUnique({ where: { id } })
  if (!project) return Response.json({ error: 'No encontrado' }, { status: 404 })

  if (session.user.role === 'JAIRO' && project.ownerId !== session.user.id) {
    return Response.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const activity = await db.activity.create({
    data: {
      projectId: id,
      userId: session.user.id,
      type: type || 'PROGRESS',
      content,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  // Update project updatedAt to prevent stagnation alerts
  await db.project.update({ where: { id }, data: { updatedAt: new Date() } })

  return Response.json({ activity }, { status: 201 })
}
