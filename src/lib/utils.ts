import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    OPORTUNIDAD: 'Oportunidad',
    VIABILIDAD_TECNICA: 'Viabilidad Técnica',
    MUESTRA: 'Muestra',
    VALIDACION: 'Validación',
    LANZAMIENTO: 'Lanzamiento',
    DESCARTADO: 'Descartado',
  }
  return labels[stage] || stage
}

export function priorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    CRITICAL: 'Crítica',
  }
  return labels[priority] || priority
}

export function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    JAIRO: 'Solicitante',
    ARELIS: 'Gestora de Portafolio',
    GERENCIA: 'Gerencia',
  }
  return labels[role] || role
}

export function severityColor(severity: string): string {
  const colors: Record<string, string> = {
    GREEN: 'text-green-600 bg-green-50 border-green-200',
    AMBER: 'text-amber-600 bg-amber-50 border-amber-200',
    RED: 'text-red-600 bg-red-50 border-red-200',
  }
  return colors[severity] || ''
}

export function stageColor(stage: string): string {
  const colors: Record<string, string> = {
    OPORTUNIDAD: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
    VIABILIDAD_TECNICA: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    MUESTRA: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    VALIDACION: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
    LANZAMIENTO: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    DESCARTADO: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  }
  return colors[stage] || 'bg-gray-50 text-gray-600 ring-1 ring-gray-200'
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function daysAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  return `Hace ${days} días`
}
