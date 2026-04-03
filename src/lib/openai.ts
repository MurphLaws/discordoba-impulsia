import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export interface PortfolioInsight {
  title: string
  reasoning: string
  action: string
}

export async function getPortfolioInsights(summary: {
  totalProjects: number
  byStage: Record<string, number>
  stalledProjects: { title: string; stage: string; daysSinceUpdate: number }[]
  overdueProjects: { title: string; stage: string; daysOverdue: number }[]
  criticalProjects: { title: string; priority: string }[]
}): Promise<PortfolioInsight[]> {
  const prompt = `Eres un asistente de gestión de portafolio para Discordoba S.A.S.
Basándote en estos datos del portafolio:
${JSON.stringify(summary, null, 2)}

Proporciona exactamente 3 recomendaciones concretas de priorización en español.
Responde ÚNICAMENTE con un array JSON válido con este formato exacto:
[
  { "title": "Título corto", "reasoning": "Justificación breve", "action": "Acción concreta a tomar" }
]`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) return []

  try {
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : parsed.recommendations || []
  } catch {
    return []
  }
}
