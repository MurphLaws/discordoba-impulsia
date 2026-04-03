import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import OnboardingTour from '@/components/layout/OnboardingTour'

export default async function GerenciaPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div>
      <OnboardingTour role={session.user.role} userId={session.user.id} />

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard Ejecutivo
          </h2>
          <p className="text-gray-600 mt-1">
            Monitorea el rendimiento del portafolio con métricas clave.
          </p>
        </div>

        {/* Placeholder content - will be replaced with actual dashboard */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Tu vista ejecutiva aparecerá aquí
          </p>
        </div>
      </div>
    </div>
  )
}
