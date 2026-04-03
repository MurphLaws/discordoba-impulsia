import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Bell } from 'lucide-react'
import MarkAllReadButton from '@/components/notifications/MarkAllReadButton'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const unread = notifications.filter(n => !n.read)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600 text-sm mt-1">{unread.length} sin leer</p>
        </div>
        {unread.length > 0 && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`bg-white border rounded-lg p-4 flex gap-3 ${
                !n.read ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  !n.read ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                <p className="text-gray-600 text-sm mt-0.5">{n.body}</p>
                <p className="text-gray-400 text-xs mt-1">{formatDate(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
