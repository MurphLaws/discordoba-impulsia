import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import MetricCard from '@/components/dashboard/MetricCard'
import ProjectCard from '@/components/projects/ProjectCard'
import OnboardingTour from '@/components/layout/OnboardingTour'
import Link from 'next/link'
import { Plus, FolderOpen, AlertTriangle, Rocket } from 'lucide-react'
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
    <div className="space-y-8 max-w-6xl">
      <OnboardingTour role="JAIRO" userId={session.user.id} />

      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Bienvenido, {session.user.name?.split(' ')[0] || 'usuario'}
          </h1>
          <p className="text-gray-400 text-sm mt-1.5">Aquí están tus proyectos activos</p>
        </div>
        <Link href="/jairo/new-project">
          <Button className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5080] hover:from-[#162d4a] hover:to-[#1e3a5f] shadow-md shadow-[#1e3a5f]/15 hover:shadow-lg hover:shadow-[#1e3a5f]/20 transition-all duration-300 rounded-xl h-10 px-5">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo proyecto
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="animate-fade-in-up stagger-1">
          <MetricCard
            title="Proyectos activos"
            value={activeProjects.length}
            icon={<FolderOpen className="w-5 h-5" />}
            color="blue"
          />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <MetricCard
            title="Con alertas"
            value={withAlerts.length}
            icon={<AlertTriangle className="w-5 h-5" />}
            color={withAlerts.length > 0 ? 'amber' : 'default'}
          />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <MetricCard
            title="Lanzados este mes"
            value={completedThisMonth.length}
            icon={<Rocket className="w-5 h-5" />}
            color="green"
          />
        </div>
      </div>

      <div className="animate-fade-in-up stagger-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Mis proyectos</h2>
        {projects.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
              <FolderOpen className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1.5">No tienes proyectos registrados</p>
            <p className="text-gray-400 text-sm mb-6">Comienza registrando tu primera oportunidad</p>
            <Link href="/jairo/new-project">
              <Button className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5080] hover:from-[#162d4a] hover:to-[#1e3a5f] shadow-md shadow-[#1e3a5f]/15 rounded-xl h-10 px-5">
                <Plus className="h-4 w-4 mr-2" />
                Registrar primera oportunidad
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project, i) => (
              <div key={project.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                <ProjectCard project={project} href={`/jairo/projects/${project.id}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
