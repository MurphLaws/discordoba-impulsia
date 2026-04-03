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
  LOW: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
  MEDIUM: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  HIGH: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  CRITICAL: 'bg-red-50 text-red-700 ring-1 ring-red-200',
}

const statusColors: Record<string, string> = {
  DRAFT: 'text-gray-500',
  ACTIVE: 'text-emerald-600',
  STALLED: 'text-amber-600',
  COMPLETED: 'text-emerald-600',
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
    <div className="group bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
      {/* Header with Stage Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-[#1e3a5f] transition-colors duration-200">{project.title}</h3>
          <p className="text-sm text-gray-500">{project.client}</p>
        </div>
        <span
          className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap ml-3 ${stageColor(
            project.stage
          )}`}
        >
          {stageLabel(project.stage)}
        </span>
      </div>

      {/* Business Line and Priority */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-gray-500 text-xs">{project.businessLine}</span>
        <span
          className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-lg ${
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
            className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}
          />
          <span
            className={`text-xs ${
              isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'
            }`}
          >
            {formatDate(project.dueDate)}
          </span>
          {isOverdue && (
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          )}
        </div>
      )}

      {/* Owner Info */}
      {showOwner && (
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2a5080] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-white">
              {(project.owner.name || project.owner.email)
                .substring(0, 1)
                .toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {project.owner.name || project.owner.email}
          </span>
        </div>
      )}

      {/* Footer with Status and Updated Date */}
      <div className="flex items-center justify-between text-xs pt-3.5 border-t border-gray-100">
        <span
          className={`font-semibold ${
            statusColors[project.status] || statusColors.DRAFT
          }`}
        >
          {statusLabels[project.status] || project.status}
        </span>
        <span className="text-gray-400">
          {daysAgo(project.updatedAt)}
        </span>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{card}</Link>
  }
  return card
}
