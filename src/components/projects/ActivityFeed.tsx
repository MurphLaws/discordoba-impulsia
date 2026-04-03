'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FileText,
  GitBranch,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { daysAgo, cn } from '@/lib/utils'
import type { Activity, ActivityType } from '@/generated/prisma'

interface ActivityFeedProps {
  projectId: string
  initialActivities?: Activity[]
  canAdd?: boolean
  userId?: string
}

const activityIcons: Record<string, React.ReactNode> = {
  PROGRESS: <CheckCircle className="w-5 h-5 text-green-600" />,
  BLOCKER: <AlertCircle className="w-5 h-5 text-red-600" />,
  INFO_REQUEST: <HelpCircle className="w-5 h-5 text-blue-600" />,
  DECISION: <FileText className="w-5 h-5 text-purple-600" />,
  STAGE_CHANGE: <GitBranch className="w-5 h-5 text-amber-600" />,
  ASSIGNMENT: <Users className="w-5 h-5 text-indigo-600" />,
  CREATION: <Zap className="w-5 h-5 text-yellow-600" />,
}

const activityColors: Record<string, string> = {
  PROGRESS: 'bg-green-50 border-green-200',
  BLOCKER: 'bg-red-50 border-red-200',
  INFO_REQUEST: 'bg-blue-50 border-blue-200',
  DECISION: 'bg-purple-50 border-purple-200',
  STAGE_CHANGE: 'bg-amber-50 border-amber-200',
  ASSIGNMENT: 'bg-indigo-50 border-indigo-200',
  CREATION: 'bg-yellow-50 border-yellow-200',
}

export default function ActivityFeed({
  projectId,
  initialActivities = [],
  canAdd = false,
  userId,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<
    (Activity & { user: { name: string | null; email: string } })[]
  >(initialActivities as any)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [type, setType] = useState<ActivityType>('PROGRESS')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/projects/${projectId}/activities`)
        if (res.ok) {
          const data = await res.json()
          setActivities(data.activities)
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!initialActivities.length) {
      fetchActivities()
    }
  }, [projectId, initialActivities])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('El contenido no puede estar vacío')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content }),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || 'Error al crear actividad')
        return
      }

      const { activity } = await res.json()
      setActivities([activity, ...activities])
      setContent('')
      setType('PROGRESS')
      toast.success('Actividad registrada')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al registrar actividad')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {canAdd && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
        >
          <div>
            <Label htmlFor="activity-type" className="mb-2 block">
              Tipo de Actividad
            </Label>
            <select
              id="activity-type"
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
            >
              <option value="PROGRESS">Progreso</option>
              <option value="BLOCKER">Bloqueador</option>
              <option value="INFO_REQUEST">Solicitud de Información</option>
              <option value="DECISION">Decisión</option>
              <option value="STAGE_CHANGE">Cambio de Etapa</option>
              <option value="ASSIGNMENT">Asignación</option>
            </select>
          </div>

          <div>
            <Label htmlFor="activity-content" className="mb-2 block">
              Contenido
            </Label>
            <textarea
              id="activity-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe aquí..."
              className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-500 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              rows={3}
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#1e3a5f] text-white hover:bg-[#162a47]"
            >
              {submitting ? 'Guardando...' : 'Guardar Actividad'}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">
          {activities.length > 0 ? `Actividades (${activities.length})` : 'Sin actividades'}
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay actividades registradas aún
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={cn(
                  'border rounded-lg p-4 space-y-2',
                  activityColors[activity.type]
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    {activityIcons[activity.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {activity.user.name || activity.user.email}
                      </span>
                      <span className="text-xs text-gray-500">
                        {daysAgo(activity.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 break-words">
                      {activity.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
