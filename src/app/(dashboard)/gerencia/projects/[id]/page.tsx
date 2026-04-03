import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate, stageLabel, priorityLabel } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params

  const project = await db.project.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true } },
      leader: { select: { name: true, email: true } },
      alerts: { where: { resolved: false } },
      _count: { select: { tasks: true, activities: true } },
    },
  })

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Proyecto no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a
          href="/gerencia"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </a>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
          <p className="text-gray-600 mt-1">{project.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Info */}
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proyecto</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Cliente</p>
              <p className="text-gray-900 mt-1">{project.client}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Línea de Negocio</p>
              <p className="text-gray-900 mt-1">{project.businessLine}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Prioridad</p>
              <p className="text-gray-900 mt-1">{priorityLabel(project.priority)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Etapa</p>
              <p className="text-gray-900 mt-1">{stageLabel(project.stage)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Estado</p>
              <p className="text-gray-900 mt-1">{project.status}</p>
            </div>
          </div>
        </div>

        {/* Dates and People */}
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas y Equipo</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Fecha Límite</p>
              <p className="text-gray-900 mt-1">
                {project.dueDate ? formatDate(project.dueDate) : 'No definida'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Propietario</p>
              <p className="text-gray-900 mt-1">{project.owner?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Líder del Proyecto</p>
              <p className="text-gray-900 mt-1">{project.leader?.name || 'Sin asignar'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Tareas</p>
              <p className="text-gray-900 mt-1">{project._count.tasks}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Actividades</p>
              <p className="text-gray-900 mt-1">{project._count.activities}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {project.notes && (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{project.notes}</p>
        </div>
      )}

      {/* Alerts */}
      {project.alerts.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Activas</h3>
          <div className="space-y-3">
            {project.alerts.map((alert) => (
              <div key={alert.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-900">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
