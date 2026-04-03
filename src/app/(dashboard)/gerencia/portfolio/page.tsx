import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate, stageLabel, priorityLabel, stageColor } from '@/lib/utils'
import PortfolioSearchFilter from '@/components/portfolio/PortfolioSearchFilter'

interface PortfolioPageProps {
  searchParams: Promise<{ search?: string; stage?: string; priority?: string; status?: string }>
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const session = await auth()
  if (!session) redirect('/login')

  const { search, stage, priority, status } = await searchParams

  const where: any = {
    status: { not: 'DISCARDED' },
  }

  if (search) {
    where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { client: { contains: search, mode: 'insensitive' } }]
  }

  if (stage) where.stage = stage
  if (priority) where.priority = priority
  if (status) where.status = status

  const projects = await db.project.findMany({
    where,
    include: {
      owner: { select: { name: true } },
      leader: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Portafolio de Proyectos</h2>
        <p className="text-gray-600 mt-1">Vista completa del portafolio de proyectos activos.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
        <PortfolioSearchFilter currentFilters={{ search, stage, priority, status }} />
      </div>

      <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 font-medium">No hay proyectos que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Proyecto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Línea de Negocio</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Etapa</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Líder</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Fecha Límite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <a
                        href={`/gerencia/projects/${project.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {project.title}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{project.client}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{project.businessLine}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${stageColor(project.stage)}`}>
                        {stageLabel(project.stage)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{priorityLabel(project.priority)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{project.leader?.name || 'Sin asignar'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {project.dueDate ? formatDate(project.dueDate) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 text-center">
        Mostrando {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
