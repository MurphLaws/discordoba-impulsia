'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import Link from 'next/link'

function PasswordStrengthIndicator({ password }: { password: string }) {
  const hasLength = password.length >= 8
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  const isStrong = hasLength && hasLetter && hasNumber

  return (
    <div className="space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Requisitos:</div>
      <div className="space-y-2">
        {[
          { met: hasLength, label: 'Mínimo 8 caracteres' },
          { met: hasLetter, label: 'Al menos una letra' },
          { met: hasNumber, label: 'Al menos un número' },
        ].map((req) => (
          <div key={req.label} className="flex items-center gap-2.5 text-xs">
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200 ${req.met ? 'bg-emerald-50' : 'bg-gray-50'}`}>
              {req.met ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <X className="w-3 h-3 text-gray-300" />
              )}
            </div>
            <span className={`transition-colors duration-200 ${req.met ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>

      {password && (
        <div className="mt-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isStrong ? 'bg-emerald-500 w-full' : 'bg-amber-400 w-2/3'
              }`}
            />
          </div>
          <p
            className={`text-[11px] font-semibold mt-1.5 ${
              isStrong ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {isStrong ? 'Contraseña fuerte' : 'Contraseña débil'}
          </p>
        </div>
      )}
    </div>
  )
}

function CreatePasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState('')
  const [isReset, setIsReset] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const t = searchParams.get('token')
    const reset = searchParams.get('reset') === 'true'
    setToken(t || '')
    setIsReset(reset)
  }, [searchParams])

  const hasLength = password.length >= 8
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const isPasswordValid = hasLength && hasLetter && hasNumber
  const passwordsMatch = password === confirmPassword && password.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !isPasswordValid || !passwordsMatch) return

    setLoading(true)
    setError('')

    try {
      const endpoint = isReset ? '/api/tokens/reset' : '/api/tokens/activate'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          ...(isReset && { resetToken: token }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al procesar la solicitud')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-100/50 p-8 text-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1e3a5f] rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-100/50 p-8 text-center space-y-6 animate-scale-in">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <Check className="w-7 h-7 text-emerald-500" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
            {isReset ? 'Contraseña actualizada' : 'Cuenta activada'}
          </h2>
          <p className="text-gray-500 text-sm">
            {isReset
              ? 'Tu contraseña ha sido restablecida. Redirigiendo...'
              : 'Tu cuenta ha sido activada. Redirigiendo...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-100/50 p-8">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          {isReset ? 'Nueva contraseña' : 'Activa tu cuenta'}
        </h2>
        <p className="text-gray-400 text-sm mt-1.5">
          {isReset ? 'Crea una nueva contraseña segura' : 'Crea tu contraseña para comenzar a usar ImpulsIA'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Nueva contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
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

        {password && <PasswordStrengthIndicator password={password} />}

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Confirmar contraseña</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-500 font-medium animate-fade-in">
              Las contraseñas no coinciden
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium animate-fade-in">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2a5080] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white h-10 rounded-xl shadow-md shadow-[#1e3a5f]/15 transition-all duration-300"
          disabled={loading || !isPasswordValid || !passwordsMatch}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            isReset ? 'Actualizar contraseña' : 'Activar cuenta'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#1e3a5f]/70 hover:text-[#1e3a5f] font-medium transition-colors duration-200">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-100/50 p-8 text-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1e3a5f] rounded-full animate-spin mx-auto" />
      </div>
    }>
      <CreatePasswordContent />
    </Suspense>
  )
}
