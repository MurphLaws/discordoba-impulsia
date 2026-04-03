'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useTransition } from 'react'

interface PortfolioSearchFilterProps {
  currentFilters?: {
    search?: string
    stage?: string
    priority?: string
    status?: string
  }
}

export default function PortfolioSearchFilter({ currentFilters = {} }: PortfolioSearchFilterProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const STAGES = [
    { value: 'OPORTUNIDAD', label: 'Oportunidad' },
    { value: 'VIABILIDAD_TECNICA', label: 'Viabilidad Técnica' },
    { value: 'MUESTRA', label: 'Muestra' },
    { value: 'VALIDACION', label: 'Validación' },
    { value: 'LANZAMIENTO', label: 'Lanzamiento' },
  ]

  const PRIORITIES = [
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'CRITICAL', label: 'Crítica' },
  ]

  const STATUSES = [
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'STALLED', label: 'Estancado' },
    { value: 'COMPLETED', label: 'Completado' },
  ]

  const handleSearch = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (value) params.set('search', value)
      if (currentFilters.stage) params.set('stage', currentFilters.stage)
      if (currentFilters.priority) params.set('priority', currentFilters.priority)
      if (currentFilters.status) params.set('status', currentFilters.status)
      router.push(`/gerencia/portfolio?${params.toString()}`)
    })
  }

  const handleFilter = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (currentFilters.search) params.set('search', currentFilters.search)
      if (key !== 'stage' && currentFilters.stage) params.set('stage', currentFilters.stage)
      if (key !== 'priority' && currentFilters.priority) params.set('priority', currentFilters.priority)
      if (key !== 'status' && currentFilters.status) params.set('status', currentFilters.status)

      if (value) {
        params.set(key, value)
      }

      router.push(`/gerencia/portfolio?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    startTransition(() => {
      router.push('/gerencia/portfolio')
    })
  }

  const hasFilters =
    currentFilters.search || currentFilters.stage || currentFilters.priority || currentFilters.status

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar proyecto o cliente..."
          defaultValue={currentFilters.search || ''}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={isPending}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={currentFilters.stage || ''}
          onChange={(e) => handleFilter('stage', e.target.value)}
          disabled={isPending}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50"
        >
          <option value="">Todas las etapas</option>
          {STAGES.map((stage) => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.priority || ''}
          onChange={(e) => handleFilter('priority', e.target.value)}
          disabled={isPending}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50"
        >
          <option value="">Todas las prioridades</option>
          {PRIORITIES.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.status || ''}
          onChange={(e) => handleFilter('status', e.target.value)}
          disabled={isPending}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50"
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
