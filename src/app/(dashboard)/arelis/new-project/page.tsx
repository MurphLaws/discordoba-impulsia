import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ProjectForm from '@/components/projects/ProjectForm'

export default async function NewProjectPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (session.user.role !== 'ARELIS') redirect('/')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Nuevo Proyecto</h2>
        <p className="text-gray-600 mt-1">Crea un nuevo proyecto en el portafolio.</p>
      </div>
      <ProjectForm mode="arelis" />
    </div>
  )
}
