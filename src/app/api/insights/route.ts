import { auth } from '@/auth'
import { db } from '@/lib/db'
import { getPortfolioInsights } from '@/lib/openai'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'ARELIS') {
    return Response.json({ error: 'Sin permisos' }, { status: 403 })
  }

  try {
    const STAGES = ['OPORTUNIDAD', 'VIABILIDAD_TECNICA', 'MUESTRA', 'VALIDACION', 'LANZAMIENTO']

    // Fetch all projects
    const projects = await db.project.findMany({
      where: { status: { not: 'DISCARDED' } },
      include: { alerts: { where: { resolved: false } } },
    })

    // Build summary object
    const byStageObj: Record<string, number> = {}
    STAGES.forEach((stage) => {
      byStageObj[stage] = projects.filter((p) => p.stage === stage).length
    })

    // Find stalled and overdue projects for detailed analysis
    const now = new Date()
    const stalledProjects = projects
      .filter((p) => p.status === 'STALLED')
      .map((p) => ({
        title: p.title,
        stage: p.stage,
        daysSinceUpdate: Math.floor(
          (now.getTime() - p.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
      }))

    const overdueProjects = projects
      .filter((p) => p.dueDate && p.dueDate < now)
      .map((p) => ({
        title: p.title,
        stage: p.stage,
        daysOverdue: Math.floor(
          (now.getTime() - p.dueDate!.getTime()) / (1000 * 60 * 60 * 24)
        ),
      }))

    const criticalProjects = projects
      .filter((p) => p.priority === 'CRITICAL')
      .map((p) => ({
        title: p.title,
        priority: p.priority,
      }))

    const summary = {
      totalProjects: projects.length,
      byStage: byStageObj,
      stalledProjects,
      overdueProjects,
      criticalProjects,
    }

    // Call OpenAI
    const insights = await getPortfolioInsights(summary)

    if (!insights || insights.length === 0) {
      return Response.json(
        { error: 'No se pudieron generar insights' },
        { status: 503 }
      )
    }

    return Response.json({ insights })
  } catch (error) {
    console.error('Error getting insights:', error)
    return Response.json(
      { error: 'Error al obtener insights de IA' },
      { status: 503 }
    )
  }
}
