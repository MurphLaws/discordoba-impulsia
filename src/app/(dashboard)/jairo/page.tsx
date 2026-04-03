import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import MetricCard from '@/components/dashboard/MetricCard'
import ProjectCard from '@/components/projects/ProjectCard'
import OnboardingTour from '@/components/layout/OnboardingTour'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function JairoDashboard() {
  const session = await auth()
  if (!session || session.user.role !== 'JAIRO') redirect('/login')

  const projects = await db.project.findMany({
    where: { ownerId: session.user.id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      alerts: { where: { resolved: false } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const activeProjects = projects.filter(p => p.status !== 'DISCARDED' && p.stage !== 'LANZAMIENTO')
  const withAlerts = projects.filter(p => p.alerts.length > 0)
  const completedThisMonth = projects.filter(
    p => p.stage === 'LANZAMIENTO' && p.updatedAt >= startOfMonth
  )

  return (
    <div className="space-y-6">
      <OnboardingTour role="JAIRO" userId={session.user.id} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {session.user.name?.split(' ')[0] || 'usuario'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">Aquí están tus proyectos activos</p>
        </div>
        <Link href="/jairo/new-project">
          <Button className="bg-[#1e3a5f] hover:bg-[#162d4a]">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo proyecto
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard title="Proyectos activos" value={activeProjects.length} color="blue" />
        <MetricCard
          title="Con alertas"
          value={withAlerts.length}
          color={withAlerts.length > 0 ? 'amber' : 'default'}
        />
        <MetricCard title="Lanzados este mes" value={completedThisMonth.length} color="green" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mis proyectos</h2>
        {projects.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-500 mb-4">No tienes proyectos registrados aún</p>
            <Link href="/jairo/new-project">
              <Button className="bg-[#1e3a5f] hover:bg-[#162d4a]">
                <Plus className="h-4 w-4 mr-2" />
                Registrar primera oportunidad
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} href={`/jairo/projects/${project.id}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
