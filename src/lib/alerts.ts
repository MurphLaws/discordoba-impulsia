import { db } from './db'
import type { Severity, AlertType } from '@/generated/prisma'

const STAGNATION_DAYS = 7
const CRITICAL_DAYS = 3

export async function evaluateAlerts() {
  const activeProjects = await db.project.findMany({
    where: { status: { in: ['DRAFT', 'ACTIVE', 'STALLED'] } },
    include: { alerts: { where: { resolved: false } } },
  })

  const now = new Date()

  for (const project of activeProjects) {
    const daysSinceUpdate = Math.floor(
      (now.getTime() - project.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Stagnation alert
    if (daysSinceUpdate >= STAGNATION_DAYS) {
      const existing = project.alerts.find(
        (a) => a.type === 'STAGNATION' && !a.resolved
      )
      if (!existing) {
        const severity: Severity = daysSinceUpdate >= 14 ? 'RED' : 'AMBER'
        await db.alert.create({
          data: {
            projectId: project.id,
            type: 'STAGNATION',
            severity,
            message: `El proyecto no ha tenido actividad en ${daysSinceUpdate} días.`,
          },
        })
      }
    }

    // Overdue alert
    if (project.dueDate && project.dueDate < now) {
      const daysOverdue = Math.floor(
        (now.getTime() - project.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const existing = project.alerts.find(
        (a) => a.type === 'OVERDUE' && !a.resolved
      )
      if (!existing) {
        await db.alert.create({
          data: {
            projectId: project.id,
            type: 'OVERDUE',
            severity: 'RED',
            message: `El proyecto lleva ${daysOverdue} días de retraso respecto a su fecha límite.`,
          },
        })
      }
    }

    // Critical deadline alert (within 3 days)
    if (project.dueDate) {
      const daysUntilDue = Math.floor(
        (project.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysUntilDue >= 0 && daysUntilDue <= CRITICAL_DAYS) {
        const existing = project.alerts.find(
          (a) => a.type === 'CRITICAL_DEADLINE' && !a.resolved
        )
        if (!existing) {
          await db.alert.create({
            data: {
              projectId: project.id,
              type: 'CRITICAL_DEADLINE',
              severity: 'AMBER',
              message: `El proyecto vence en ${daysUntilDue} día(s).`,
            },
          })
        }
      }
    }
  }
}
