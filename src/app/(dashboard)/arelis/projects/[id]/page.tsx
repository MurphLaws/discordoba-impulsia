import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { stageLabel, priorityLabel, stageColor, formatDate, daysAgo } from '@/lib/utils'
import StageAdvancePanel from '@/components/projects/StageAdvancePanel'
import ActivityFeed from '@/components/projects/ActivityFeed'
import TaskList from '@/components/projects/TaskList'
import { Calendar, AlertCircle, Users, Clock } from 'lucide-react'

type RouteParams = {
  params: Promise<{ id: string }>
}

export default async function ArelisProjectDetailPage({ params }: RouteParams) {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user.role !== 'ARELIS') redirect('/')

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
        include: { assignee: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      },
      alerts: { where: { resolved: false }, orderBy: { createdAt: 'desc' } },
      stageHistory: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })

  if (!project) {
    redirect('/arelis')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <p className="text-gray-600">{project.client}</p>
          </div>
          <span
            className={`inline-block px-3 py-1 text-sm font-medium rounded whitespace-nowrap ${stageColor(
              project.stage
            )}`}
          >
            {stageLabel(project.stage)}
          </span>
        </div>

        {/* Status Badges */}
        <div className="flex gap-3 flex-wrap">
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {project.businessLine}
          </span>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              project.priority === 'CRITICAL'
                ? 'bg-red-100 text-red-700'
                : project.priority === 'HIGH'
                  ? 'bg-amber-100 text-amber-700'
                  : project.priority === 'MEDIUM'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
            }`}
          >
            {priorityLabel(project.priority)}
          </span>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              project.status === 'ACTIVE'
                ? 'bg-green-100 text-green-700'
                : project.status === 'STALLED'
                  ? 'bg-amber-100 text-amber-700'
                  : project.status === 'DISCARDED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
            }`}
          >
            {project.status === 'ACTIVE'
              ? 'Activo'
              : project.status === 'STALLED'
                ? 'Estancado'
                : project.status === 'DISCARDED'
                  ? 'Descartado'
                  : 'Borrador'}
          </span>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Details and Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
            <p className="text-gray-700 leading-relaxed">{project.description}</p>
          </div>

          {/* Client & Business Info */}
          {(project.notes || project.businessLine) && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Línea de Negocio</p>
                  <p className="text-gray-900">{project.businessLine}</p>
                </div>
                {project.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notas</p>
                    <p className="text-gray-900">{project.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Feed */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad</h3>
            <ActivityFeed
              projectId={id}
              initialActivities={project.activities as any}
              canAdd={true}
              userId={session.user.id}
            />
          </div>

          {/* Task List */}
          <TaskList
            projectId={id}
            initialTasks={project.tasks as any}
            canManage={true}
          />
        </div>

        {/* Right Column - Stage Panel, Team, Dates, Alerts */}
        <div className="space-y-6">
          {/* Stage Advance Panel */}
          <StageAdvancePanel
            project={{
              id: project.id,
              stage: project.stage,
              status: project.status,
            }}
          />

          {/* Team */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Equipo
            </h3>
            <div className="space-y-4">
              {project.owner && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Propietario</p>
                  <p className="text-sm text-gray-900">
                    {project.owner.name || project.owner.email}
                  </p>
                </div>
              )}
              {project.leader && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Líder</p>
                  <p className="text-sm text-gray-900">
                    {project.leader.name || project.leader.email}
                  </p>
                </div>
              )}
              {project.coresp && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Co-responsable</p>
                  <p className="text-sm text-gray-900">
                    {project.coresp.name || project.coresp.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Fechas
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Creado</p>
                <p className="text-sm text-gray-900">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Actualizado</p>
                <p className="text-sm text-gray-900">
                  {formatDate(project.updatedAt)} ({daysAgo(project.updatedAt)})
                </p>
              </div>
              {project.dueDate && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Fecha de Entrega</p>
                  <p className="text-sm text-gray-900">{formatDate(project.dueDate)}</p>
                </div>
              )}
              {project.discardedAt && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Descartado</p>
                  <p className="text-sm text-gray-900">{formatDate(project.discardedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          {project.alerts.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Alertas
              </h3>
              <div className="space-y-3">
                {project.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg text-sm ${
                      alert.severity === 'RED'
                        ? 'bg-red-50 border border-red-200 text-red-700'
                        : alert.severity === 'AMBER'
                          ? 'bg-amber-50 border border-amber-200 text-amber-700'
                          : 'bg-green-50 border border-green-200 text-green-700'
                    }`}
                  >
                    {alert.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage History */}
          {project.stageHistory.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Historial de Etapas
              </h3>
              <div className="space-y-3">
                {project.stageHistory.map((record) => (
                  <div key={record.id} className="pb-3 border-b border-gray-200 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {record.fromStage && stageLabel(record.fromStage)} →{' '}
                          {stageLabel(record.toStage)}
                        </p>
                        {record.note && (
                          <p className="text-xs text-gray-700">{record.note}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                        {daysAgo(record.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
