'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function RecoverPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tokens/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al enviar las instrucciones')
        return
      }

      setSent(true)
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-green-50 p-3 rounded-full">
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Correo enviado
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Revisa tu bandeja de correo. Te hemos enviado un enlace para
            restablecer tu contraseña. El enlace expira en 1 hora.
          </p>
          <p className="text-gray-600 text-xs mb-6">
            Si no ves el correo, verifica tu carpeta de spam.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => setSent(false)}
            className="w-full bg-[#1e3a5f] hover:bg-[#152d47] text-white h-9"
          >
            Intentar con otro correo
          </Button>
          <Link href="/login" className="block">
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-200 h-9"
            >
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Recupera tu contraseña
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Ingresa tu correo electrónico y te enviaremos instrucciones para
          restablecer tu contraseña.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#1e3a5f] hover:bg-[#152d47] text-white h-9"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar instrucciones'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-[#1e3a5f] hover:underline font-medium">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
