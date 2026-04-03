import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import OnboardingTour from '@/components/layout/OnboardingTour'
import MetricCard from '@/components/dashboard/MetricCard'
import PortfolioFunnel from '@/components/dashboard/PortfolioFunnel'
import { db } from '@/lib/db'
import { formatDate, stageLabel, priorityLabel, severityColor } from '@/lib/utils'
import { TrendingUp, AlertCircle, Zap, CheckCircle2 } from 'lucide-react'

export default async function GerenciaPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const [projects, alerts] = await Promise.all([
    db.project.findMany({
      include: { alerts: { where: { resolved: false } } },
      orderBy: { updatedAt: 'desc' },
    }),
    db.alert.findMany({
      where: { resolved: false },
      include: { project: { select: { title: true } } },
      take: 10,
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    }),
  ])

  // Count metrics
  const totalProjects = projects.length
  const launchingProjects = projects.filter((p) => p.stage === 'LANZAMIENTO').length
  const criticalProjects = projects.filter((p) => p.priority === 'CRITICAL').length
  const activeAlerts = alerts.length

  return (
    <div>
      <OnboardingTour role={session.user.role} userId={session.user.id} />

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo</h2>
          <p className="text-gray-600 mt-1">Monitorea el rendimiento del portafolio con métricas clave.</p>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Proyectos"
            value={totalProjects}
            icon={<TrendingUp className="w-6 h-6" />}
            color="blue"
          />
          <MetricCard
            title="En Lanzamiento"
            value={launchingProjects}
            icon={<Zap className="w-6 h-6" />}
            color="green"
          />
          <MetricCard
            title="Proyectos Críticos"
            value={criticalProjects}
            icon={<AlertCircle className="w-6 h-6" />}
            color="red"
          />
          <MetricCard
            title="Alertas Activas"
            value={activeAlerts}
            icon={<AlertCircle className="w-6 h-6" />}
            color="amber"
          />
        </div>

        {/* Funnel and Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PortfolioFunnel
              projects={projects.map((p) => ({ id: p.id, stage: p.stage }))}
            />
          </div>

          {/* Critical Alerts */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Críticas</h3>
            {alerts.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Sin alertas activas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${severityColor(alert.severity)}`}>
                    <p className="text-xs font-semibold text-gray-900 mb-1">{alert.project?.title}</p>
                    <p className="text-xs text-gray-700">{alert.message}</p>
                  </div>
                ))}
                {alerts.length > 5 && (
                  <a
                    href="/arelis/alerts"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                  >
                    Ver todas las alertas ({alerts.length})
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Proyectos del Portafolio</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Proyecto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Etapa</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Fecha Límite</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <a href={`/gerencia/projects/${project.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        {project.title}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {stageLabel(project.stage)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{priorityLabel(project.priority)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{project.client}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {project.dueDate ? formatDate(project.dueDate) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                          project.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : project.status === 'STALLED'
                            ? 'bg-amber-100 text-amber-700'
                            : project.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
