import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import OnboardingTour from '@/components/layout/OnboardingTour'
import MetricCard from '@/components/dashboard/MetricCard'
import PortfolioFunnel from '@/components/dashboard/PortfolioFunnel'
import ProjectCard from '@/components/projects/ProjectCard'
import { BarChart3, AlertTriangle, Zap, Activity, FolderOpen } from 'lucide-react'

export default async function ArelisPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user.role !== 'ARELIS') redirect('/')

  const projects = await db.project.findMany({
    where: {
      stage: { not: 'DESCARTADO' },
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      leader: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length
  const stalledProjects = projects.filter((p) => p.status === 'STALLED').length
  const criticalProjects = projects.filter((p) => p.priority === 'CRITICAL').length

  const recentProjects = projects.slice(0, 6)

  return (
    <div className="space-y-8 max-w-7xl">
      <OnboardingTour role={session.user.role} userId={session.user.id} />

      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard del Portafolio</h1>
        <p className="text-gray-400 mt-1.5 text-sm">
          Gestiona todos los proyectos de la empresa desde aquí.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="animate-fade-in-up stagger-1">
          <MetricCard
            title="Proyectos Total"
            value={totalProjects}
            icon={<BarChart3 className="w-5 h-5" />}
            color="blue"
          />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <MetricCard
            title="Activos"
            value={activeProjects}
            icon={<Activity className="w-5 h-5" />}
            color="green"
          />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <MetricCard
            title="En Riesgo"
            value={stalledProjects}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="amber"
          />
        </div>
        <div className="animate-fade-in-up stagger-4">
          <MetricCard
            title="Críticos"
            value={criticalProjects}
            icon={<Zap className="w-5 h-5" />}
            color="red"
          />
        </div>
      </div>

      {/* Funnel and Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-5">
        <div className="lg:col-span-2">
          <PortfolioFunnel
            projects={projects.map((p) => ({
              stage: p.stage,
              id: p.id,
            }))}
          />
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-5">Insights</h3>
          <div className="space-y-3 text-sm">
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl transition-all duration-200 hover:bg-blue-50">
              <p className="font-semibold text-blue-900 text-sm">
                {activeProjects} proyectos en movimiento
              </p>
              <p className="text-xs text-blue-600/70 mt-1">
                Están en etapas activas de desarrollo
              </p>
            </div>
            <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-xl transition-all duration-200 hover:bg-amber-50">
              <p className="font-semibold text-amber-900 text-sm">
                {stalledProjects} proyecto{stalledProjects !== 1 ? 's' : ''} estancado{stalledProjects !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-600/70 mt-1">
                Requieren atención inmediata
              </p>
            </div>
            <div className="p-4 bg-red-50/70 border border-red-100 rounded-xl transition-all duration-200 hover:bg-red-50">
              <p className="font-semibold text-red-900 text-sm">
                {criticalProjects} proyecto{criticalProjects !== 1 ? 's' : ''} crítico{criticalProjects !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-600/70 mt-1">
                Alta prioridad, seguimiento constante
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects Row */}
      <div className="animate-fade-in-up stagger-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Proyectos Recientes
        </h2>
        {recentProjects.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
              <FolderOpen className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No hay proyectos disponibles</p>
            <p className="text-gray-400 text-sm mt-1">Los proyectos aparecerán aquí cuando sean creados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project as any}
                showOwner={true}
                href={`/arelis/projects/${project.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
