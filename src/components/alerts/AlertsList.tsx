'use client'

import { useState } from 'react'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { severityColor, formatDate, stageLabel } from '@/lib/utils'
import AlertsFilter from './AlertsFilter'

interface Alert {
  id: string
  type: string
  severity: string
  message: string
  createdAt: string
  project: { id: string; title: string; stage: string } | null
}

export default function AlertsList({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [filter, setFilter] = useState('todas')
  const [resolving, setResolving] = useState<string | null>(null)

  const counts = {
    todas: alerts.length,
    critical: alerts.filter((a) => a.severity === 'RED').length,
    warning: alerts.filter((a) => a.severity === 'AMBER').length,
    info: alerts.filter((a) => a.severity === 'GREEN').length,
  }

  const filtered = filter === 'todas'
    ? alerts
    : filter === 'critical'
    ? alerts.filter((a) => a.severity === 'RED')
    : filter === 'warning'
    ? alerts.filter((a) => a.severity === 'AMBER')
    : alerts.filter((a) => a.severity === 'GREEN')

  const getSeverityIcon = (severity: string) => {
    if (severity === 'RED') return <AlertCircle className="w-5 h-5" />
    if (severity === 'AMBER') return <AlertTriangle className="w-5 h-5" />
    return <Info className="w-5 h-5" />
  }

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      STAGNATION: 'Estancamiento',
      OVERDUE: 'Vencido',
      CRITICAL_DEADLINE: 'Plazo Critico',
    }
    return labels[type] || type
  }

  async function handleResolve(alertId: string) {
    setResolving(alertId)
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      })
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId))
      }
    } catch {
      // ignore
    } finally {
      setResolving(null)
    }
  }

  return (
    <>
      <div className="px-6">
        <AlertsFilter activeFilter={filter} onFilterChange={setFilter} counts={counts} />
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center">
          <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No hay alertas activas</p>
          <p className="text-gray-400 text-sm mt-1">Tu portafolio esta en buen estado</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filtered.map((alert) => (
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
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolving === alert.id}
                        className="px-3 py-1.5 rounded text-xs font-medium bg-white bg-opacity-30 hover:bg-opacity-50 transition-colors disabled:opacity-50"
                      >
                        {resolving === alert.id ? 'Resolviendo...' : 'Resolver'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
