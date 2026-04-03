import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon?: React.ReactNode
  color?: 'default' | 'green' | 'amber' | 'red' | 'blue'
  trend?: {
    value: number
    label: string
    direction?: 'up' | 'down'
  }
}

const colorClasses: Record<string, string> = {
  default: 'bg-gray-100 text-gray-600',
  green: 'bg-green-100 text-green-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  blue: 'bg-blue-100 text-blue-600',
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = 'default',
  trend,
}: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded',
                  trend.direction === 'down'
                    ? 'text-red-600 bg-red-50'
                    : 'text-green-600 bg-green-50'
                )}
              >
                {trend.direction === 'down' ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
              colorClasses[color]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
