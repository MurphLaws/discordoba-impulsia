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
    await signOut({ redirect: true })
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
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200 text-sm"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2a5080] flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-[11px] font-bold text-white">{initials}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 z-50 py-1 animate-scale-in origin-top-right">
            {/* User Info */}
            <div className="px-4 py-3.5 border-b border-gray-100">
              <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
              <span className="inline-block mt-2.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-[#1e3a5f]/8 text-[#1e3a5f] rounded-lg">
                {roleLabel(user.role)}
              </span>
            </div>

            {/* Menu Items */}
            <div className="py-1.5 px-1.5">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-150">
                <Settings className="w-4 h-4" />
                Configuración
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-150"
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
