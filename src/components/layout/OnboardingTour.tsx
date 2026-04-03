'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight } from 'lucide-react'

interface OnboardingTourProps {
  role: string
  userId: string
}

interface Step {
  title: string
  description: string
}

const tourSteps: Record<string, Step[]> = {
  JAIRO: [
    {
      title: 'Tu dashboard personal',
      description:
        'Aquí verás todos tus proyectos y su estado actual.',
    },
    {
      title: 'Crear oportunidades',
      description:
        'Registra nuevas oportunidades de desarrollo para tu empresa.',
    },
    {
      title: 'Seguimiento en tiempo real',
      description:
        'Recibe notificaciones de cada avance en tus proyectos.',
    },
  ],
  ARELIS: [
    {
      title: 'Visión completa del portafolio',
      description:
        'Gestiona todos los proyectos de la empresa desde aquí.',
    },
    {
      title: 'Asignación y cronogramas',
      description:
        'Asigna responsables, fechas y prioridades a cada proyecto.',
    },
    {
      title: 'Reportes e insights',
      description:
        'Genera reportes y obtén recomendaciones de IA para priorizar.',
    },
  ],
  GERENCIA: [
    {
      title: 'KPIs en tiempo real',
      description:
        'Monitorea el rendimiento del portafolio con métricas clave.',
    },
    {
      title: 'Alertas críticas',
      description:
        'Identifica proyectos en riesgo y toma decisiones estratégicas.',
    },
    {
      title: 'Portafolio completo',
      description: 'Visualiza el embudo de proyectos por etapa.',
    },
  ],
}

export default function OnboardingTour({
  role,
  userId,
}: OnboardingTourProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = tourSteps[role] || []

  useEffect(() => {
    const storageKey = `impulsia_tour_shown_${userId}`
    const hasSeenTour = localStorage.getItem(storageKey)

    if (!hasSeenTour && steps.length > 0) {
      setIsVisible(true)
      localStorage.setItem(storageKey, 'true')
    }
  }, [userId, steps.length])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible || steps.length === 0) {
    return null
  }

  const step = steps[currentStep]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Bienvenido a ImpulsIA
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {step.title}
            </h3>
            <p className="text-gray-600 mb-6">{step.description}</p>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-[#1e3a5f]'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Step Counter */}
            <p className="text-xs text-gray-500 text-center mb-6">
              Paso {currentStep + 1} de {steps.length}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Saltar tour
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#162d4a] transition-colors text-sm font-medium"
            >
              {currentStep === steps.length - 1 ? 'Completado' : 'Siguiente'}
              {currentStep < steps.length - 1 && (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
