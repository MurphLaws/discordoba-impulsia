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
          icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
        },
        {
          href: '/jairo/new-project',
          label: 'Nuevo proyecto',
          icon: <Plus className="w-[18px] h-[18px]" />,
        },
        {
          href: '/jairo/notifications',
          label: 'Notificaciones',
          icon: <Bell className="w-[18px] h-[18px]" />,
          badge: true,
        },
      ]
    }

    if (role === 'ARELIS') {
      return [
        {
          href: '/arelis',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
        },
        {
          href: '/arelis/new-project',
          label: 'Nuevo proyecto',
          icon: <Plus className="w-[18px] h-[18px]" />,
        },
        {
          href: '/arelis/alerts',
          label: 'Alertas',
          icon: <AlertTriangle className="w-[18px] h-[18px]" />,
          badge: true,
        },
        {
          href: '/arelis/reports',
          label: 'Reportes',
          icon: <FileText className="w-[18px] h-[18px]" />,
        },
      ]
    }

    if (role === 'GERENCIA') {
      return [
        {
          href: '/gerencia',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
        },
        {
          href: '/gerencia/portfolio',
          label: 'Portafolio',
          icon: <Briefcase className="w-[18px] h-[18px]" />,
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
    <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
      <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
        Navegación
      </p>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
            isActive(item.href)
              ? 'bg-white/15 text-white shadow-sm shadow-black/10'
              : 'text-white/60 hover:bg-white/8 hover:text-white/90'
          }`}
        >
          {item.icon}
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500/90 text-white text-[10px] font-bold">
              {item.count || '0'}
            </span>
          )}
        </Link>
      ))}

      {/* Logout Button */}
      <div className="pt-6">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
          Cuenta
        </p>
        <button
          onClick={async () => {
            await signOut({ redirect: true })
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/50 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  )
}
