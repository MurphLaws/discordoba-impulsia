import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function PortfolioPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Portafolio
        </h2>
        <p className="text-gray-600 mt-1">
          Vista completa del portafolio de proyectos.
        </p>
      </div>

      {/* Placeholder - portfolio view will be displayed here */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">
          El portafolio de proyectos aparecerá aquí
        </p>
      </div>
    </div>
  )
}
