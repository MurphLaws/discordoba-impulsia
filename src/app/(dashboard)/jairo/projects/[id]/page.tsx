import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { stageLabel, priorityLabel, stageColor, formatDate, daysAgo } from '@/lib/utils'
import ActivityFeed from '@/components/projects/ActivityFeed'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User, AlertTriangle } from 'lucide-react'

type RouteParams = {
  params: Promise<{ id: string }>
}

export default async function JairoProjectDetailPage({ params }: RouteParams) {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user.role !== 'JAIRO') redirect('/')

  const { id } = await params

  const project = await db.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      leader: { select: { id: true, name: true, email: true } },
      coresp: { select: { id: true, name: true, email: true } },
      activities: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
      tasks: {
        include: { assignee: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      },
      alerts: { where: { resolved: false } },
    },
  })

  if (!project) notFound()
  if (project.ownerId !== session.user.id) redirect('/jairo')

  const pendingTasks = project.tasks.filter((t) => !t.completed).length
  const completedTasks = project.tasks.filter((t) => t.completed).length
  const daysOpen = Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24))

  const priorityColors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700',
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    ACTIVE: 'bg-green-100 text-green-700',
    STALLED: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    DISCARDED: 'bg-red-100 text-red-700',
  }

  const statusLabels: Record<string, string> = {
    DRAFT: 'Borrador',
    ACTIVE: 'Activo',
    STALLED: 'Estancado',
    COMPLETED: 'Completado',
    DISCARDED: 'Descartado',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/jairo"
          className="mt-1 p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900 truncate">{project.title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColor(project.stage)}`}>
              {stageLabel(project.stage)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[project.priority]}`}>
              {priorityLabel(project.priority)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
              {statusLabels[project.status]}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Descripción</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{project.description}</p>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Cliente</p>
                <p className="text-sm text-gray-900 mt-1 font-medium">{project.client}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Línea de Negocio</p>
                <p className="text-sm text-gray-900 mt-1 font-medium">{project.businessLine}</p>
              </div>
            </div>

            {project.notes && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Notas</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{project.notes}</p>
              </div>
            )}
          </div>

          {/* Alerts */}
          {project.alerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-800">Alertas Activas</h3>
              </div>
              <div className="space-y-2">
                {project.alerts.map((alert) => (
                  <p key={alert.id} className="text-sm text-amber-700">{alert.message}</p>
                ))}
              </div>
            </div>
          )}

          {/* Activity Feed */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Historial de Actividad</h3>
            <ActivityFeed
              projectId={project.id}
              initialActivities={project.activities as any}
              canAdd={true}
              userId={session.user.id}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Resumen</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
                <p className="text-xs text-gray-500 mt-0.5">Tareas pendientes</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{daysOpen}</p>
                <p className="text-xs text-gray-500 mt-0.5">Días abierto</p>
              </div>
            </div>
            {completedTasks > 0 && (
              <p className="text-xs text-green-600 text-center">{completedTasks} tarea(s) completada(s)</p>
            )}
          </div>

          {/* Team */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4" /> Equipo
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Responsable</p>
                <p className="text-sm font-medium text-gray-900">
                  {project.owner.name || project.owner.email}
                </p>
              </div>
              {project.leader && (
                <div>
                  <p className="text-xs text-gray-500">Líder</p>
                  <p className="text-sm font-medium text-gray-900">
                    {project.leader.name || project.leader.email}
                  </p>
                </div>
              )}
              {project.coresp && (
                <div>
                  <p className="text-xs text-gray-500">Co-responsable</p>
                  <p className="text-sm font-medium text-gray-900">
                    {project.coresp.name || project.coresp.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Fechas
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Creado</span>
                <span className="text-gray-900">{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Actualizado</span>
                <span className="text-gray-900">{daysAgo(project.updatedAt)}</span>
              </div>
              {project.dueDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha límite</span>
                  <span className={`font-medium ${new Date(project.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatDate(project.dueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tasks preview */}
          {project.tasks.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Tareas
              </h3>
              <div className="space-y-2">
                {project.tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-start gap-2">
                    <div className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                      {task.completed && <span className="text-white text-xs">✓</span>}
                    </div>
                    <p className={`text-xs ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {task.title}
                    </p>
                  </div>
                ))}
                {project.tasks.length > 5 && (
                  <p className="text-xs text-gray-500">+{project.tasks.length - 5} más</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
