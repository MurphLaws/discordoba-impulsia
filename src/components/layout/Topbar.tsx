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

  const unreadCount = 0

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
      {/* Page Title */}
      <h1 className="text-[15px] font-semibold text-gray-800 tracking-tight">{title}</h1>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button className="relative p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200">
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        <div className="w-px h-6 bg-gray-100 mx-1" />

        {/* User Menu */}
        <UserMenu user={user} />
      </div>
    </div>
  )
}
