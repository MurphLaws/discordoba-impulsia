import { auth } from '@/auth'
import { db } from '@/lib/db'

type RouteContext = {
  params: Promise<Record<string, string>>
}

export async function PATCH(request: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { taskId } = await ctx.params
  const { completed } = await request.json()

  const task = await db.task.update({
    where: { id: taskId },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  })
  return Response.json({ task })
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'ARELIS') return Response.json({ error: 'Sin permisos' }, { status: 403 })

  const { taskId } = await ctx.params
  await db.task.delete({ where: { id: taskId } })
  return Response.json({ success: true })
}
