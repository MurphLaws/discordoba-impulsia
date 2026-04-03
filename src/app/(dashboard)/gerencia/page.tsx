import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import OnboardingTour from '@/components/layout/OnboardingTour'
import MetricCard from '@/components/dashboard/MetricCard'
import PortfolioFunnel from '@/components/dashboard/PortfolioFunnel'
import { db } from '@/lib/db'
import { formatDate, stageLabel, priorityLabel, severityColor } from '@/lib/utils'
import { TrendingUp, AlertCircle, Zap, CheckCircle2, FolderOpen } from 'lucide-react'

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

  const totalProjects = projects.length
  const launchingProjects = projects.filter((p) => p.stage === 'LANZAMIENTO').length
  const criticalProjects = projects.filter((p) => p.priority === 'CRITICAL').length
  const activeAlerts = alerts.length

  return (
    <div className="max-w-7xl">
      <OnboardingTour role={session.user.role} userId={session.user.id} />

      <div className="space-y-8">
        <div className="animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Ejecutivo</h2>
          <p className="text-gray-400 mt-1.5 text-sm">Monitorea el rendimiento del portafolio con métricas clave.</p>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="animate-fade-in-up stagger-1">
            <MetricCard
              title="Total de Proyectos"
              value={totalProjects}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
            />
          </div>
          <div className="animate-fade-in-up stagger-2">
            <MetricCard
              title="En Lanzamiento"
              value={launchingProjects}
              icon={<Zap className="w-5 h-5" />}
              color="green"
            />
          </div>
          <div className="animate-fade-in-up stagger-3">
            <MetricCard
              title="Proyectos Críticos"
              value={criticalProjects}
              icon={<AlertCircle className="w-5 h-5" />}
              color="red"
            />
          </div>
          <div className="animate-fade-in-up stagger-4">
            <MetricCard
              title="Alertas Activas"
              value={activeAlerts}
              icon={<AlertCircle className="w-5 h-5" />}
              color="amber"
            />
          </div>
        </div>

        {/* Funnel and Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-5">
          <div className="lg:col-span-2">
            <PortfolioFunnel
              projects={projects.map((p) => ({ id: p.id, stage: p.stage }))}
            />
          </div>

          {/* Critical Alerts */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-5">Alertas Críticas</h3>
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm text-gray-400 font-medium">Sin alertas activas</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className={`p-3.5 rounded-xl border transition-all duration-200 hover:shadow-sm ${severityColor(alert.severity)}`}>
                    <p className="text-xs font-semibold text-gray-900 mb-0.5">{alert.project?.title}</p>
                    <p className="text-xs text-gray-600">{alert.message}</p>
                  </div>
                ))}
                {alerts.length > 5 && (
                  <a
                    href="/arelis/alerts"
                    className="text-xs text-[#1e3a5f] hover:text-[#2a5080] font-semibold mt-2 inline-block transition-colors duration-200"
                  >
                    Ver todas las alertas ({alerts.length})
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-fade-in-up stagger-6">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Proyectos del Portafolio</h3>
          </div>
          {projects.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
                <FolderOpen className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No hay proyectos en el portafolio</p>
              <p className="text-gray-400 text-sm mt-1">Los proyectos aparecerán aquí cuando sean creados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Proyecto</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Etapa</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Prioridad</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Cliente</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Fecha Límite</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <a href={`/gerencia/projects/${project.id}`} className="text-sm font-medium text-[#1e3a5f] hover:text-[#2a5080] transition-colors duration-200">
                          {project.title}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 bg-gray-50 text-gray-700 rounded-lg text-[11px] font-semibold">
                          {stageLabel(project.stage)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{priorityLabel(project.priority)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{project.client}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 tabular-nums">
                        {project.dueDate ? formatDate(project.dueDate) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                            project.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : project.status === 'STALLED'
                              ? 'bg-amber-50 text-amber-700'
                              : project.status === 'COMPLETED'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-50 text-gray-600'
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
          )}
        </div>
      </div>
    </div>
  )
}
