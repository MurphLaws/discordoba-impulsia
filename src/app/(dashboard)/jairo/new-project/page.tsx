import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ProjectForm from '@/components/projects/ProjectForm'

export default async function NewProjectPage() {
  const session = await auth()
  if (!session || session.user.role !== 'JAIRO') redirect('/login')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Nuevo Proyecto</h2>
        <p className="text-gray-600 mt-1">Registra una nueva oportunidad.</p>
      </div>
      <ProjectForm mode="jairo" />
    </div>
  )
}
