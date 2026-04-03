import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import OnboardingTour from '@/components/layout/OnboardingTour'
import MetricCard from '@/components/dashboard/MetricCard'
import PortfolioFunnel from '@/components/dashboard/PortfolioFunnel'
import ProjectCard from '@/components/projects/ProjectCard'
import { BarChart3, AlertTriangle, Zap, Activity } from 'lucide-react'

export default async function ArelisPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user.role !== 'ARELIS') redirect('/')

  // Fetch all projects for Arelis
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

  // Calculate metrics
  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length
  const stalledProjects = projects.filter((p) => p.status === 'STALLED').length
  const criticalProjects = projects.filter((p) => p.priority === 'CRITICAL').length

  // Get recent projects (most recently updated)
  const recentProjects = projects.slice(0, 6)

  return (
    <div className="space-y-6">
      <OnboardingTour role={session.user.role} userId={session.user.id} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard del Portafolio</h1>
        <p className="text-gray-600 mt-2">
          Gestiona todos los proyectos de la empresa desde aquí.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Proyectos Total"
          value={totalProjects}
          icon={<BarChart3 className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Activos"
          value={activeProjects}
          icon={<Activity className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="En Riesgo"
          value={stalledProjects}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="amber"
        />
        <MetricCard
          title="Críticos"
          value={criticalProjects}
          icon={<Zap className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Funnel and Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioFunnel
            projects={projects.map((p) => ({
              stage: p.stage,
              id: p.id,
            }))}
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights</h3>
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-900">
                {activeProjects} proyectos en movimiento
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Están en etapas activas de desarrollo
              </p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="font-medium text-amber-900">
                {stalledProjects} proyecto{stalledProjects !== 1 ? 's' : ''} estancado{stalledProjects !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Requieren atención inmediata
              </p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-medium text-red-900">
                {criticalProjects} proyecto{criticalProjects !== 1 ? 's' : ''} crítico{criticalProjects !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-700 mt-1">
                Alta prioridad, seguimiento constante
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects Row */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Proyectos Recientes
        </h2>
        {recentProjects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No hay proyectos disponibles</p>
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
