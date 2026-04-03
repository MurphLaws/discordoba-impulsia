import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function NewProjectPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Nuevo Proyecto
        </h2>
        <p className="text-gray-600 mt-1">
          Registra una nueva oportunidad de desarrollo.
        </p>
      </div>

      {/* Placeholder - form will be added later */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <p className="text-gray-500">
          El formulario de nuevo proyecto aparecerá aquí
        </p>
      </div>
    </div>
  )
}
