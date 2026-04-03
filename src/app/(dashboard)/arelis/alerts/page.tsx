import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { severityColor, formatDate, stageLabel } from '@/lib/utils'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import AlertsFilter from '@/components/alerts/AlertsFilter'
import AlertsActions from '@/components/alerts/AlertsActions'

export default async function AlertsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const alerts = await db.alert.findMany({
    where: { resolved: false },
    include: { project: { select: { id: true, title: true, stage: true } } },
    orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
  })

  const counts = {
    todas: alerts.length,
    critical: alerts.filter((a) => a.severity === 'RED').length,
    warning: alerts.filter((a) => a.severity === 'AMBER').length,
    info: alerts.filter((a) => a.severity === 'GREEN').length,
  }

  const getSeverityIcon = (severity: string) => {
    if (severity === 'RED') return <AlertCircle className="w-5 h-5" />
    if (severity === 'AMBER') return <AlertTriangle className="w-5 h-5" />
    return <Info className="w-5 h-5" />
  }

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      STAGNATION: 'Estancamiento',
      OVERDUE: 'Vencido',
      CRITICAL_DEADLINE: 'Plazo Crítico',
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Centro de Alertas</h2>
          <p className="text-gray-600 mt-1">Monitorea proyectos en riesgo y toma acciones.</p>
        </div>
        <div className="bg-blue-100 text-blue-700 rounded-lg px-4 py-2 font-semibold">
          {counts.todas} Alertas Activas
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <AlertsActions />
        </div>

        <div className="px-6">
          <AlertsFilter activeFilter="todas" onFilterChange={() => {}} counts={counts} />
        </div>

        {alerts.length === 0 ? (
          <div className="p-12 text-center">
            <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No hay alertas activas</p>
            <p className="text-gray-400 text-sm mt-1">Tu portafolio está en buen estado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-6 ${severityColor(alert.severity)}`}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">{getSeverityIcon(alert.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{alert.project?.title}</h4>
                          <span className="inline-block bg-white bg-opacity-40 px-2 py-1 rounded text-xs font-medium">
                            {getAlertTypeLabel(alert.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Etapa: {stageLabel(alert.project?.stage || '')}</span>
                          <span>{formatDate(alert.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <a
                          href={`/arelis/projects/${alert.project?.id}`}
                          className="px-3 py-1.5 rounded text-xs font-medium bg-white bg-opacity-30 hover:bg-opacity-50 transition-colors"
                        >
                          Ver Proyecto
                        </a>
                        <button
                          onClick={async () => {
                            await fetch('/api/alerts', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ alertId: alert.id }),
                            })
                            // Reload page after resolving
                            window.location.reload()
                          }}
                          className="px-3 py-1.5 rounded text-xs font-medium bg-white bg-opacity-30 hover:bg-opacity-50 transition-colors"
                        >
                          Resolver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
