'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (locked) return

    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= 3) {
        setLocked(true)
        setError('Demasiados intentos. Espera 5 minutos.')
        setTimeout(() => {
          setLocked(false)
          setAttempts(0)
          setError('')
        }, 5 * 60 * 1000)
      } else {
        setError('Credenciales incorrectas')
      }
    } else {
      router.refresh()
      router.push('/')
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-100/50 p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Bienvenido de vuelta</h2>
        <p className="text-sm text-gray-400 mt-1">Ingresa con tu correo y contraseña</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@discordoba.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || locked}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || locked}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading || locked}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium animate-fade-in">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2a5080] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white h-10 rounded-xl shadow-md shadow-[#1e3a5f]/15 transition-all duration-300 hover:shadow-lg hover:shadow-[#1e3a5f]/20"
          disabled={loading || locked}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/recover"
          className="text-sm text-[#1e3a5f]/70 hover:text-[#1e3a5f] font-medium transition-colors duration-200"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </div>
  )
}
