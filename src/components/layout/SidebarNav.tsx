'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Plus,
  Bell,
  AlertTriangle,
  FileText,
  Briefcase,
  LogOut,
} from 'lucide-react'

interface SidebarNavProps {
  role: string
}

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: boolean
  count?: number
}

export default function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = (() => {
    if (role === 'JAIRO') {
      return [
        {
          href: '/jairo',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          href: '/jairo/new-project',
          label: 'Nuevo proyecto',
          icon: <Plus className="w-5 h-5" />,
        },
        {
          href: '/jairo/notifications',
          label: 'Notificaciones',
          icon: <Bell className="w-5 h-5" />,
          badge: true,
        },
      ]
    }

    if (role === 'ARELIS') {
      return [
        {
          href: '/arelis',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          href: '/arelis/new-project',
          label: 'Nuevo proyecto',
          icon: <Plus className="w-5 h-5" />,
        },
        {
          href: '/arelis/alerts',
          label: 'Alertas',
          icon: <AlertTriangle className="w-5 h-5" />,
          badge: true,
        },
        {
          href: '/arelis/reports',
          label: 'Reportes',
          icon: <FileText className="w-5 h-5" />,
        },
      ]
    }

    if (role === 'GERENCIA') {
      return [
        {
          href: '/gerencia',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
          href: '/gerencia/portfolio',
          label: 'Portafolio',
          icon: <Briefcase className="w-5 h-5" />,
        },
      ]
    }

    return []
  })()

  const isActive = (href: string) => {
    if (href === '/jairo' || href === '/arelis' || href === '/gerencia') {
      return pathname === href || pathname === href + '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive(item.href)
              ? 'bg-white/10 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          {item.icon}
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-semibold">
              {item.count || '0'}
            </span>
          )}
        </Link>
      ))}

      {/* Logout Button */}
      <button
        onClick={async () => {
          await signOut({ redirect: true, redirectUrl: '/login' })
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors mt-8"
      >
        <LogOut className="w-5 h-5" />
        <span>Cerrar sesión</span>
      </button>
    </nav>
  )
}
