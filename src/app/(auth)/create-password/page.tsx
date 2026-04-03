'use client'

import { useState, useEffect } from 'react'
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
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-600">Requisitos:</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          {hasLength ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <X className="w-4 h-4 text-gray-300" />
          )}
          <span className={hasLength ? 'text-green-700' : 'text-gray-600'}>
            Mínimo 8 caracteres
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {hasLetter ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <X className="w-4 h-4 text-gray-300" />
          )}
          <span className={hasLetter ? 'text-green-700' : 'text-gray-600'}>
            Al menos una letra
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {hasNumber ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <X className="w-4 h-4 text-gray-300" />
          )}
          <span className={hasNumber ? 'text-green-700' : 'text-gray-600'}>
            Al menos un número
          </span>
        </div>
      </div>

      {password && (
        <div className="mt-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isStrong ? 'bg-green-600 w-full' : 'bg-amber-500 w-2/3'
              }`}
            />
          </div>
          <p
            className={`text-xs mt-1 ${
              isStrong ? 'text-green-700' : 'text-amber-700'
            }`}
          >
            {isStrong ? 'Contraseña fuerte' : 'Contraseña débil'}
          </p>
        </div>
      )}
    </div>
  )
}

export default function CreatePasswordPage() {
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
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-green-50 p-3 rounded-full">
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isReset ? 'Contraseña actualizada' : '¡Cuenta activada!'}
          </h2>
          <p className="text-gray-600 text-sm">
            {isReset
              ? 'Tu contraseña ha sido restablecida. Redirigiendo...'
              : 'Tu cuenta ha sido activada. Redirigiendo...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">Nueva contraseña</Label>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {password && <PasswordStrengthIndicator password={password} />}

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar contraseña</Label>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-600">
              Las contraseñas no coinciden
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#1e3a5f] hover:bg-[#152d47] text-white h-9"
          disabled={loading || !isPasswordValid || !passwordsMatch}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            'Crear contraseña'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-[#1e3a5f] hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
