'use client'

import { cn } from '@/lib/utils'

interface AlertsFilterProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  counts: {
    todas: number
    critical: number
    warning: number
    info: number
  }
}

export default function AlertsFilter({ activeFilter, onFilterChange, counts }: AlertsFilterProps) {
  const filters = [
    { id: 'todas', label: 'Todas', count: counts.todas },
    { id: 'critical', label: 'Críticas', count: counts.critical, color: 'text-red-600' },
    { id: 'warning', label: 'Advertencia', count: counts.warning, color: 'text-amber-600' },
    { id: 'info', label: 'Informativas', count: counts.info, color: 'text-green-600' },
  ]

  return (
    <div className="flex gap-4 border-b border-gray-200">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            activeFilter === filter.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          )}
        >
          <span className={filter.color}>{filter.label}</span>
          <span className="ml-2 bg-gray-100 rounded-full px-2.5 py-0.5 text-xs font-semibold text-gray-700">
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  )
}
