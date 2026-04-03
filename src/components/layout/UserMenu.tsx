'use client'

import { signOut } from 'next-auth/react'
import { DefaultSession } from 'next-auth'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'
import { roleLabel } from '@/lib/utils'

interface UserMenuProps {
  user: DefaultSession['user'] & {
    id: string
    role: string
  }
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: true, redirectUrl: '/login' })
  }

  const initials = (user.name || user.email || 'U')
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
      >
        <div className="w-7 h-7 rounded-full bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-white">{initials}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">{user.email}</p>
              <span className="inline-block mt-2 text-xs font-medium px-2 py-1 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded">
                {roleLabel(user.role)}
              </span>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <Settings className="w-4 h-4" />
                Configuración
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-200"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
