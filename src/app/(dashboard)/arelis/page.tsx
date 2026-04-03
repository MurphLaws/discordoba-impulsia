import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import OnboardingTour from '@/components/layout/OnboardingTour'

export default async function ArelisPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div>
      <OnboardingTour role={session.user.role} userId={session.user.id} />

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard del Portafolio
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona todos los proyectos de la empresa desde aquí.
          </p>
        </div>

        {/* Placeholder content - will be replaced with actual dashboard */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Tu vista de portafolio aparecerá aquí
          </p>
        </div>
      </div>
    </div>
  )
}
