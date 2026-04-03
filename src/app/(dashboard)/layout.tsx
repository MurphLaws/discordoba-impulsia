import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar
        role={session.user.role}
        userId={session.user.id}
        userName={session.user.name ?? undefined}
        userEmail={session.user.email ?? undefined}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
