import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import AlertsActions from '@/components/alerts/AlertsActions'
import AlertsList from '@/components/alerts/AlertsList'

export default async function AlertsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const alerts = await db.alert.findMany({
    where: { resolved: false },
    include: { project: { select: { id: true, title: true, stage: true } } },
    orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
  })

  // Serialize dates for client component
  const serializedAlerts = alerts.map((a) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    message: a.message,
    createdAt: a.createdAt.toISOString(),
    project: a.project,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Centro de Alertas</h2>
          <p className="text-gray-600 mt-1">Monitorea proyectos en riesgo y toma acciones.</p>
        </div>
        <div className="bg-blue-100 text-blue-700 rounded-lg px-4 py-2 font-semibold">
          {alerts.length} Alertas Activas
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <AlertsActions />
        </div>
        <AlertsList initialAlerts={serializedAlerts} />
      </div>
    </div>
  )
}
