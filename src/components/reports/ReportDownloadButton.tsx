'use client'

import { useState } from 'react'
import { Download, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportDownloadButtonProps {
  type: 'portfolio_summary' | 'stage_details' | 'alerts_report' | 'activity_report'
  format: 'pdf' | 'xlsx'
  label: string
  className?: string
}

export default function ReportDownloadButton({
  type,
  format,
  label,
  className,
}: ReportDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, format }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Error al descargar reporte')
        return
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}_${Date.now()}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      alert('Error de conexión al descargar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        format === 'pdf'
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-green-100 text-green-700 hover:bg-green-200',
        className
      )}
    >
      {loading ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {label}
    </button>
  )
}
