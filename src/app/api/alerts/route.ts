import { auth } from '@/auth'
import { db } from '@/lib/db'
import { evaluateAlerts } from '@/lib/alerts'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const alerts = await db.alert.findMany({
    where: { resolved: false },
    include: { project: { select: { id: true, title: true, stage: true, ownerId: true } } },
    orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
  })

  return Response.json({ alerts })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'ARELIS') {
    return Response.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const body = await request.json()
  const { action } = body

  if (action === 'evaluate') {
    try {
      await evaluateAlerts()
      const newAlerts = await db.alert.findMany({
        where: { resolved: false },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      const newCount = newAlerts.length
      return Response.json({ success: true, count: newCount })
    } catch (error) {
      console.error('Error evaluating alerts:', error)
      return Response.json({ error: 'Error al evaluar alertas' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Acción no válida' }, { status: 400 })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'ARELIS') {
    return Response.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const body = await request.json()
  const { alertId } = body

  if (!alertId) {
    return Response.json({ error: 'alertId requerido' }, { status: 400 })
  }

  const alert = await db.alert.update({
    where: { id: alertId },
    data: { resolved: true, resolvedAt: new Date() },
  })

  return Response.json({ alert })
}
