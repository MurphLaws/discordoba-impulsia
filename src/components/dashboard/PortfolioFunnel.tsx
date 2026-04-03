'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { stageLabel } from '@/lib/utils'

interface PortfolioFunnelProps {
  projects: Array<{ stage: string; id: string }>
}

const STAGES = ['OPORTUNIDAD', 'VIABILIDAD_TECNICA', 'MUESTRA', 'VALIDACION', 'LANZAMIENTO']
const STAGE_COLORS: Record<string, string> = {
  OPORTUNIDAD: '#6B7280',
  VIABILIDAD_TECNICA: '#3B82F6',
  MUESTRA: '#A855F7',
  VALIDACION: '#EAB308',
  LANZAMIENTO: '#10B981',
}

export default function PortfolioFunnel({ projects }: PortfolioFunnelProps) {
  // Count projects per stage (exclude DESCARTADO)
  const stageCounts: Record<string, number> = {}
  STAGES.forEach((stage) => {
    stageCounts[stage] = 0
  })

  projects.forEach((project) => {
    if (STAGES.includes(project.stage)) {
      stageCounts[project.stage]++
    }
  })

  // Prepare data for chart
  const data = STAGES.map((stage) => ({
    stage: stageLabel(stage),
    stageKey: stage,
    count: stageCounts[stage],
  }))

  // Check if there are any active projects
  const hasProjects = data.some((d) => d.count > 0)

  if (!hasProjects) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-500">No hay proyectos activos</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Embudo del Portafolio</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="stage" type="category" width={140} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [value, 'Proyectos']}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.stageKey]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
