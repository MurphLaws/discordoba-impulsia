import { auth } from '@/auth'
import { db } from '@/lib/db'

type RouteContext = {
  params: Promise<Record<string, string>>
}

export async function PATCH(_req: Request, ctx: RouteContext) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params

  const notification = await db.notification.update({
    where: { id },
    data: { read: true, readAt: new Date() },
  })

  return Response.json({ notification })
}
