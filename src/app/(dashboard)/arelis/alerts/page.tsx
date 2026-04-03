import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function AlertsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Centro de Alertas
        </h2>
        <p className="text-gray-600 mt-1">
          Monitorea proyectos en riesgo y toma acciones.
        </p>
      </div>

      {/* Placeholder - alerts will be listed here */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">
          Las alertas aparecerán aquí
        </p>
      </div>
    </div>
  )
}
