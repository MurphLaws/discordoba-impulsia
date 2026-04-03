'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { DefaultSession } from 'next-auth'
import UserMenu from './UserMenu'

const PAGE_TITLES: Record<string, string> = {
  '/jairo': 'Mi Dashboard',
  '/jairo/new-project': 'Nuevo Proyecto',
  '/jairo/notifications': 'Notificaciones',
  '/arelis': 'Dashboard del Portafolio',
  '/arelis/new-project': 'Nuevo Proyecto',
  '/arelis/alerts': 'Centro de Alertas',
  '/arelis/reports': 'Reportes',
  '/gerencia': 'Dashboard Ejecutivo',
  '/gerencia/portfolio': 'Portafolio',
}

interface TopbarProps {
  user: DefaultSession['user'] & {
    id: string
    role: string
  }
}

export default function Topbar({ user }: TopbarProps) {
  const pathname = usePathname()

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path || pathname === path + '/'
  )?.[1] || 'Dashboard'

  const unreadCount = 0 // TODO: Fetch from server/API

  return (
    <div className="bg-white border-b border-gray-200 h-14 px-6 flex items-center justify-between shrink-0">
      {/* Page Title */}
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {/* User Menu */}
        <UserMenu user={user} />
      </div>
    </div>
  )
}
