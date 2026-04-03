'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { stageLabel } from '@/lib/utils'

interface PortfolioFunnelProps {
  projects: Array<{ stage: string; id: string }>
}

const STAGES = ['OPORTUNIDAD', 'VIABILIDAD_TECNICA', 'MUESTRA', 'VALIDACION', 'LANZAMIENTO']
const STAGE_COLORS: Record<string, string> = {
  OPORTUNIDAD: '#94a3b8',
  VIABILIDAD_TECNICA: '#3b82f6',
  MUESTRA: '#a855f7',
  VALIDACION: '#eab308',
  LANZAMIENTO: '#10b981',
}

export default function PortfolioFunnel({ projects }: PortfolioFunnelProps) {
  const stageCounts: Record<string, number> = {}
  STAGES.forEach((stage) => {
    stageCounts[stage] = 0
  })

  projects.forEach((project) => {
    if (STAGES.includes(project.stage)) {
      stageCounts[project.stage]++
    }
  })

  const data = STAGES.map((stage) => ({
    stage: stageLabel(stage),
    stageKey: stage,
    count: stageCounts[stage],
  }))

  const hasProjects = data.some((d) => d.count > 0)

  if (!hasProjects) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400 font-medium">No hay proyectos activos en el embudo</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-6">Embudo del Portafolio</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis dataKey="stage" type="category" width={140} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [value, 'Proyectos']}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #f1f5f9',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
              fontSize: '13px',
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
