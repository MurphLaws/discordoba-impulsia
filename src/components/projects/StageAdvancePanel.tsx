'use client'

import { useState } from 'react'
import { ChevronRight, AlertCircle } from 'lucide-react'
import { stageLabel } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface StageAdvancePanelProps {
  project: { id: string; stage: string; status: string }
  onAdvanced?: () => void
}

const STAGE_ORDER = [
  'OPORTUNIDAD',
  'VIABILIDAD_TECNICA',
  'MUESTRA',
  'VALIDACION',
  'LANZAMIENTO',
]

const STAGE_TRANSITIONS: Record<string, string | null> = {
  OPORTUNIDAD: 'VIABILIDAD_TECNICA',
  VIABILIDAD_TECNICA: 'MUESTRA',
  MUESTRA: 'VALIDACION',
  VALIDACION: 'LANZAMIENTO',
  LANZAMIENTO: null,
  DESCARTADO: null,
}

export default function StageAdvancePanel({ project, onAdvanced }: StageAdvancePanelProps) {
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const currentStageIndex = STAGE_ORDER.indexOf(project.stage)
  const nextStage = STAGE_TRANSITIONS[project.stage]
  const canAdvance = nextStage !== null && nextStage !== undefined

  const handleAdvance = async () => {
    if (!note.trim()) {
      setError('La nota es requerida')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${project.id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toStage: nextStage,
          note: note.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al avanzar etapa')
      }

      setSuccess(true)
      setNote('')
      setAdvanceDialogOpen(false)
      onAdvanced?.()

      // Reset success after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleDiscard = async () => {
    if (!note.trim()) {
      setError('La razón es requerida')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${project.id}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toStage: 'DESCARTADO',
          note: note.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al descartar proyecto')
      }

      setSuccess(true)
      setNote('')
      setDiscardDialogOpen(false)
      onAdvanced?.()

      // Reset success after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Etapa del Proyecto</h3>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Proyecto actualizado exitosamente
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Visual Stepper */}
      <div className="mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STAGE_ORDER.map((stage, index) => (
            <div key={stage} className="flex items-center gap-2 whitespace-nowrap">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${
                  index <= currentStageIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-xs font-medium ${
                  index <= currentStageIndex ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {stageLabel(stage)}
              </span>
              {index < STAGE_ORDER.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Stage Display */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Etapa Actual</p>
        <p className="text-lg font-semibold text-blue-900">{stageLabel(project.stage)}</p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {canAdvance && (
          <button
            onClick={() => setAdvanceDialogOpen(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Avanzar Etapa
          </button>
        )}
        <button
          onClick={() => setDiscardDialogOpen(true)}
          className="w-full px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
        >
          Descartar Proyecto
        </button>
      </div>

      {/* Advance Dialog */}
      <Dialog open={advanceDialogOpen} onOpenChange={setAdvanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avanzar a {nextStage && stageLabel(nextStage)}</DialogTitle>
            <DialogDescription>
              Añade una nota sobre esta transición de etapa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota <span className="text-red-500">*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe por qué se avanza a esta etapa..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdvanceDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAdvance}
              disabled={loading || !note.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Guardando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discard Dialog */}
      <Dialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descartar Proyecto</DialogTitle>
            <DialogDescription>
              Proporciona la razón por la que se descarta este proyecto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón <span className="text-red-500">*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="¿Por qué se descarta este proyecto?..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscardDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDiscard}
              disabled={loading || !note.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Guardando...' : 'Descartar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
