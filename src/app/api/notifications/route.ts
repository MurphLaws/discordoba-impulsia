import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unread') === 'true'

  const notifications = await db.notification.findMany({
    where: {
      userId: session.user.id,
      ...(unreadOnly && { read: false }),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unreadCount = await db.notification.count({
    where: { userId: session.user.id, read: false },
  })

  return Response.json({ notifications, unreadCount })
}

export async function PATCH() {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  await db.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true, readAt: new Date() },
  })

  return Response.json({ success: true })
}
