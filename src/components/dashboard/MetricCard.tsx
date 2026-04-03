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
  default: 'bg-gray-50 text-gray-500',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-blue-50 text-[#1e3a5f]',
}

const accentBar: Record<string, string> = {
  default: 'bg-gray-200',
  green: 'bg-emerald-400',
  amber: 'bg-amber-400',
  red: 'bg-red-400',
  blue: 'bg-[#1e3a5f]',
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
    <div className="group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md p-6 transition-all duration-300 overflow-hidden">
      {/* Top accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-0.5', accentBar[color])} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{title}</p>
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-3xl font-bold text-gray-900 tabular-nums tracking-tight">{value}</h3>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full',
                  trend.direction === 'down'
                    ? 'text-red-600 bg-red-50'
                    : 'text-emerald-600 bg-emerald-50'
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
            <p className="text-xs text-gray-400 mt-2.5">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
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
