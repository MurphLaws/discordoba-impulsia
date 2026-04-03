'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { stageLabel } from '@/lib/utils'
import type { Stage } from '@/generated/prisma/enums'

interface ProjectFormProps {
  mode: 'jairo' | 'arelis'
}

interface User {
  id: string
  name: string | null
  email: string
}

const STAGES: Stage[] = [
  'OPORTUNIDAD',
  'VIABILIDAD_TECNICA',
  'MUESTRA',
  'VALIDACION',
  'LANZAMIENTO',
]

export default function ProjectForm({ mode }: ProjectFormProps) {
  const router = useRouter()
  const [section, setSection] = useState(1)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client: '',
    businessLine: '',
    notes: '',
    priority: 'MEDIUM',
    leaderId: '',
    corespId: '',
    dueDate: '',
    stageDueDates: {
      OPORTUNIDAD: '',
      VIABILIDAD_TECNICA: '',
      MUESTRA: '',
      VALIDACION: '',
      LANZAMIENTO: '',
    },
  })

  // Fetch users if in Arelis mode
  useEffect(() => {
    if (mode === 'arelis') {
      const fetchUsers = async () => {
        setLoading(true)
        try {
          const res = await fetch('/api/users')
          if (res.ok) {
            const data = await res.json()
            setUsers(data.users)
          }
        } catch (error) {
          console.error('Error fetching users:', error)
          toast.error('Error cargando usuarios')
        } finally {
          setLoading(false)
        }
      }
      fetchUsers()
    }
  }, [mode])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStageDueDateChange = (stage: Stage, value: string) => {
    setFormData((prev) => ({
      ...prev,
      stageDueDates: {
        ...prev.stageDueDates,
        [stage]: value,
      },
    }))
  }

  const validateSection = () => {
    if (mode === 'jairo') {
      if (section === 1) {
        if (
          !formData.title.trim() ||
          !formData.description.trim() ||
          !formData.client.trim() ||
          !formData.businessLine.trim()
        ) {
          toast.error('Por favor completa todos los campos requeridos')
          return false
        }
      }
      if (section === 2) {
        // Section 2 has no required fields beyond section 1
        return true
      }
    } else {
      // Arelis mode
      if (section === 1) {
        if (
          !formData.title.trim() ||
          !formData.description.trim() ||
          !formData.client.trim() ||
          !formData.businessLine.trim()
        ) {
          toast.error('Por favor completa todos los campos requeridos')
          return false
        }
      }
      if (section === 2) {
        // Section 2 has no required fields
        return true
      }
      if (section === 3) {
        // Section 3 has no required fields
        return true
      }
    }
    return true
  }

  const handleNext = () => {
    if (!validateSection()) return
    const maxSections = mode === 'jairo' ? 2 : 3
    if (section < maxSections) {
      setSection(section + 1)
    }
  }

  const handlePrevious = () => {
    if (section > 1) {
      setSection(section - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateSection()) return

    // Final validation
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.client.trim() ||
      !formData.businessLine.trim()
    ) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setSubmitting(true)
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        client: formData.client,
        businessLine: formData.businessLine,
        notes: formData.notes || undefined,
        priority: formData.priority,
      }

      if (mode === 'arelis') {
        if (formData.leaderId) payload.leaderId = formData.leaderId
        if (formData.corespId) payload.corespId = formData.corespId
        // Build stageDueDates object
        const stageDueDates: Record<string, string> = {}
        for (const stage of STAGES) {
          const dateValue = (formData.stageDueDates as Record<string, string>)[stage]
          if (dateValue) {
            stageDueDates[stage] = dateValue
          }
        }
        if (Object.keys(stageDueDates).length > 0) {
          payload.stageDueDates = stageDueDates
        }
      }

      if (formData.dueDate) {
        payload.dueDate = formData.dueDate
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || 'Error al crear proyecto')
        return
      }

      toast.success('Proyecto creado exitosamente')
      const redirectUrl = mode === 'jairo' ? '/jairo' : '/arelis'
      router.push(redirectUrl)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear proyecto')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && mode === 'arelis') {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-8">
      {/* Section 1: Basic Info */}
      {section === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Proyecto
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="mb-2 block">
                  Título *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nombre del proyecto"
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="description" className="mb-2 block">
                  Descripción *
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe el proyecto..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-500 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  rows={4}
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="client" className="mb-2 block">
                  Cliente *
                </Label>
                <Input
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                  placeholder="Nombre del cliente"
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="businessLine" className="mb-2 block">
                  Línea de Negocio *
                </Label>
                <Input
                  id="businessLine"
                  name="businessLine"
                  value={formData.businessLine}
                  onChange={handleInputChange}
                  placeholder="Ej: Software, Consultoría"
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="notes" className="mb-2 block">
                  Notas
                </Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Notas adicionales..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-500 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  rows={3}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Priority and Team (Jairo) / Team and Dates (Arelis) */}
      {section === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {mode === 'jairo' ? 'Detalles y Prioridad' : 'Asignación del Equipo'}
            </h3>
            <div className="space-y-4">
              {mode === 'arelis' && (
                <>
                  <div>
                    <Label htmlFor="leaderId" className="mb-2 block">
                      Gestor del Proyecto
                    </Label>
                    <select
                      id="leaderId"
                      name="leaderId"
                      value={formData.leaderId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={submitting}
                    >
                      <option value="">Selecciona un usuario...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="corespId" className="mb-2 block">
                      Corresponsable (Opcional)
                    </Label>
                    <select
                      id="corespId"
                      name="corespId"
                      value={formData.corespId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={submitting}
                    >
                      <option value="">Selecciona un usuario...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="priority" className="mb-2 block">
                  Prioridad
                </Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={submitting}
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="CRITICAL">Crítica</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Dates (Arelis only) */}
      {section === 3 && mode === 'arelis' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fechas y Entregables
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dueDate" className="mb-2 block">
                  Fecha de Vencimiento
                </Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div>
                <Label className="mb-4 block font-semibold">
                  Fechas por Etapa
                </Label>
                <div className="space-y-3">
                  {STAGES.map((stage) => (
                    <div key={stage}>
                      <Label htmlFor={`stage-${stage}`} className="mb-2 block text-sm">
                        {stageLabel(stage)}
                      </Label>
                      <Input
                        id={`stage-${stage}`}
                        type="date"
                        value={(formData.stageDueDates as Record<string, string>)[stage] || ''}
                        onChange={(e) => handleStageDueDateChange(stage, e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={handlePrevious}
          disabled={section === 1 || submitting}
          variant="outline"
          className="border-gray-300"
        >
          Anterior
        </Button>

        <div className="flex gap-2">
          {mode === 'jairo' && section < 2 && (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-[#1e3a5f] text-white hover:bg-[#162a47]"
            >
              Siguiente
            </Button>
          )}
          {mode === 'arelis' && section < 3 && (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-[#1e3a5f] text-white hover:bg-[#162a47]"
            >
              Siguiente
            </Button>
          )}
          {((mode === 'jairo' && section === 2) || (mode === 'arelis' && section === 3)) && (
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#1e3a5f] text-white hover:bg-[#162a47]"
            >
              {submitting ? 'Creando...' : 'Crear Proyecto'}
            </Button>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: mode === 'jairo' ? 2 : 3 }).map((_, i) => (
          <div
            key={i + 1}
            className={`h-2 w-2 rounded-full transition-colors ${
              i + 1 <= section ? 'bg-[#1e3a5f]' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </form>
  )
}
