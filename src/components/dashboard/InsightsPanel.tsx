'use client'

import { useState } from 'react'
import { Loader, AlertCircle, Lightbulb } from 'lucide-react'
import type { PortfolioInsight } from '@/lib/openai'

interface InsightsPanelProps {
  className?: string
}

export default function InsightsPanel({ className }: InsightsPanelProps) {
  const [insights, setInsights] = useState<PortfolioInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Error al obtener recomendaciones')
        return
      }

      const data = await response.json()
      setInsights(data.insights || [])
    } catch (err) {
      setError('Error de conexión al servidor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Recomendaciones IA</h3>
          </div>
          <button
            onClick={handleGetInsights}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Cargando...
              </span>
            ) : (
              'Obtener Recomendaciones IA'
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{insight.reasoning}</p>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-semibold text-sm">→</span>
                  <p className="text-sm font-semibold text-blue-600">{insight.action}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <p className="text-center text-gray-500 py-8">
              Haz clic en el botón para obtener recomendaciones basadas en IA
            </p>
          )
        )}
      </div>
    </div>
  )
}
