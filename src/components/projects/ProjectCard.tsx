import Link from 'next/link'
import { Clock, AlertCircle } from 'lucide-react'
import {
  stageLabel,
  priorityLabel,
  stageColor,
  formatDate,
  daysAgo,
} from '@/lib/utils'

interface ProjectCardProps {
  project: {
    id: string
    title: string
    client: string
    businessLine: string
    stage: string
    priority: string
    status: string
    dueDate?: Date | null
    updatedAt: Date
    owner: {
      name: string | null
      email: string
    }
  }
  showOwner?: boolean
  href?: string
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

const statusColors: Record<string, string> = {
  DRAFT: 'text-gray-600',
  ACTIVE: 'text-green-600',
  STALLED: 'text-amber-600',
  COMPLETED: 'text-green-600',
  DISCARDED: 'text-red-600',
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activo',
  STALLED: 'Estancado',
  COMPLETED: 'Completado',
  DISCARDED: 'Descartado',
}

export default function ProjectCard({
  project,
  showOwner = false,
  href,
}: ProjectCardProps) {
  const isOverdue =
    project.dueDate && new Date(project.dueDate) < new Date()

  const card = (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header with Stage Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
          <p className="text-sm text-gray-600">{project.client}</p>
        </div>
        <span
          className={`inline-block px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ml-2 ${stageColor(
            project.stage
          )}`}
        >
          {stageLabel(project.stage)}
        </span>
      </div>

      {/* Business Line and Priority */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-gray-600">{project.businessLine}</span>
        <span
          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
            priorityColors[project.priority] || priorityColors.MEDIUM
          }`}
        >
          {priorityLabel(project.priority)}
        </span>
      </div>

      {/* Due Date */}
      {project.dueDate && (
        <div className="flex items-center gap-2 mb-3 text-sm">
          <Clock
            className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}
          />
          <span
            className={
              isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'
            }
          >
            {formatDate(project.dueDate)}
          </span>
          {isOverdue && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      )}

      {/* Owner Info */}
      {showOwner && (
        <div className="flex items-center gap-2 mb-3 text-sm">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-gray-700">
              {(project.owner.name || project.owner.email)
                .substring(0, 1)
                .toUpperCase()}
            </span>
          </div>
          <span className="text-gray-600">
            {project.owner.name || project.owner.email}
          </span>
        </div>
      )}

      {/* Footer with Status and Updated Date */}
      <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-200">
        <span
          className={`font-medium ${
            statusColors[project.status] || statusColors.DRAFT
          }`}
        >
          {statusLabels[project.status] || project.status}
        </span>
        <span className="text-gray-500">
          Actualizado {daysAgo(project.updatedAt)}
        </span>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{card}</Link>
  }
  return card
}
