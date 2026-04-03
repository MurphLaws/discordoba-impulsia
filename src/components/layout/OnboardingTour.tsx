'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, Sparkles } from 'lucide-react'

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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-7 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2a5080] flex items-center justify-center shadow-md shadow-[#1e3a5f]/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Bienvenido a ImpulsIA
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-300 hover:text-gray-500 transition-colors duration-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-7 pb-4">
            <div className="bg-gray-50/70 rounded-xl p-5 mb-5">
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-[#1e3a5f] w-6'
                      : 'bg-gray-200 hover:bg-gray-300 w-1.5'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Step Counter */}
            <p className="text-[11px] text-gray-400 text-center font-medium">
              {currentStep + 1} de {steps.length}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-7 py-5 border-t border-gray-100 bg-gray-50/30">
            <button
              onClick={handleClose}
              className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              Saltar
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1e3a5f] to-[#2a5080] text-white rounded-xl hover:from-[#162d4a] hover:to-[#1e3a5f] shadow-md shadow-[#1e3a5f]/15 transition-all duration-300 text-sm font-semibold"
            >
              {currentStep === steps.length - 1 ? 'Comenzar' : 'Siguiente'}
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
