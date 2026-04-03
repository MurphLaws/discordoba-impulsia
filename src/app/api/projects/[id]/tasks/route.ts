import { auth } from '@/auth'
import { db } from '@/lib/db'

type RouteContext = {
  params: Promise<Record<string, string>>
}

export async function GET(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await ctx.params
  const tasks = await db.task.findMany({
    where: { projectId: id },
    include: { assignee: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return Response.json({ tasks })
}

export async function POST(request: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'ARELIS') return Response.json({ error: 'Sin permisos' }, { status: 403 })

  const { id } = await ctx.params
  const { title, assigneeId, dueDate } = await request.json()

  const task = await db.task.create({
    data: {
      projectId: id,
      title,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  })
  return Response.json({ task }, { status: 201 })
}
