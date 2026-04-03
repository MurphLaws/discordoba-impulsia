import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const role = session.user.role

  if (role === 'ARELIS') {
    redirect('/arelis')
  }

  if (role === 'GERENCIA') {
    redirect('/gerencia')
  }

  // Default to JAIRO
  redirect('/jairo')
}
