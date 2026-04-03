import { auth } from '@/auth'
import { db } from '@/lib/db'
import type { NextRequest } from 'next/server'

type RouteContext = {
  params: Promise<Record<string, string>>
}

// Stage transition matrix - valid forward progressions only
const VALID_TRANSITIONS: Record<string, string[]> = {
  OPORTUNIDAD: ['VIABILIDAD_TECNICA', 'DESCARTADO'],
  VIABILIDAD_TECNICA: ['MUESTRA', 'DESCARTADO'],
  MUESTRA: ['VALIDACION', 'DESCARTADO'],
  VALIDACION: ['LANZAMIENTO', 'DESCARTADO'],
  LANZAMIENTO: ['DESCARTADO'],
  DESCARTADO: [],
}

export async function POST(request: NextRequest, ctx: RouteContext) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'ARELIS') {
    return Response.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { id } = await ctx.params
  const { toStage, note } = await request.json()

  // Validate stage
  if (!toStage) {
    return Response.json({ error: 'Etapa destino requerida' }, { status: 400 })
  }

  // Get project
  const project = await db.project.findUnique({ where: { id } })
  if (!project) return Response.json({ error: 'No encontrado' }, { status: 404 })

  // Validate transition
  const validTransitions = VALID_TRANSITIONS[project.stage] || []
  if (!validTransitions.includes(toStage)) {
    return Response.json(
      {
        error: `No se puede pasar de ${project.stage} a ${toStage}`,
      },
      { status: 400 }
    )
  }

  // For DESCARTADO: note is required (it's the reason)
  if (toStage === 'DESCARTADO' && !note?.trim()) {
    return Response.json(
      { error: 'La razón es requerida para descartar' },
      { status: 400 }
    )
  }

  // For other stages: note should be provided (but not strictly required)
  // Update project
  const updatedProject = await db.project.update({
    where: { id },
    data: {
      stage: toStage as any,
      status: toStage === 'DESCARTADO' ? 'DISCARDED' : 'ACTIVE',
      ...(toStage === 'DESCARTADO' && {
        discardedAt: new Date(),
        discardReason: note,
      }),
      updatedAt: new Date(),
    },
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
      stageHistory: { orderBy: { createdAt: 'desc' } },
    },
  })

  // Create StageHistory record
  await db.stageHistory.create({
    data: {
      projectId: id,
      fromStage: project.stage as any,
      toStage: toStage as any,
      note: note || null,
      createdBy: session.user.id,
    },
  })

  // Get human-readable stage label
  const stageLabels: Record<string, string> = {
    OPORTUNIDAD: 'Oportunidad',
    VIABILIDAD_TECNICA: 'Viabilidad Técnica',
    MUESTRA: 'Muestra',
    VALIDACION: 'Validación',
    LANZAMIENTO: 'Lanzamiento',
    DESCARTADO: 'Descartado',
  }

  // Create Activity
  const activityContent =
    toStage === 'DESCARTADO'
      ? `Proyecto descartado${note ? ': ' + note : ''}`
      : `Proyecto avanzado a ${stageLabels[toStage] || toStage}`

  await db.activity.create({
    data: {
      projectId: id,
      userId: session.user.id,
      type: 'STAGE_CHANGE',
      content: activityContent,
    },
  })

  // Create Notifications for owner and leader
  const notifyUsers = [updatedProject.ownerId]
  if (updatedProject.leaderId) notifyUsers.push(updatedProject.leaderId)

  const notificationType =
    toStage === 'DESCARTADO' ? 'PROJECT_DISCARDED' : 'PROJECT_STAGE_ADVANCE'
  const notificationBody =
    toStage === 'DESCARTADO'
      ? `Proyecto "${updatedProject.title}" ha sido descartado`
      : `Proyecto "${updatedProject.title}" ha avanzado a ${stageLabels[toStage]}`

  await Promise.all(
    notifyUsers.map((userId) =>
      db.notification.create({
        data: {
          userId,
          type: notificationType as any,
          title: notificationBody,
          body: note || '',
          link: `/arelis/projects/${id}`,
        },
      })
    )
  )

  return Response.json({ project: updatedProject })
}
