'use client'

import { useState } from 'react'
import { Loader, RefreshCw } from 'lucide-react'

export default function AlertsActions() {
  const [loading, setLoading] = useState(false)

  const handleEvaluateAlerts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'evaluate' }),
      })

      if (response.ok) {
        // Reload page to show new alerts
        window.location.reload()
      } else {
        alert('Error al evaluar alertas')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleEvaluateAlerts}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
    >
      {loading ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      {loading ? 'Evaluando...' : 'Evaluar Alertas'}
    </button>
  )
}
