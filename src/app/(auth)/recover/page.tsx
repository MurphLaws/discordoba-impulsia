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
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-100/50 p-8 text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <Check className="w-7 h-7 text-emerald-500" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
            Correo enviado
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Revisa tu bandeja de correo. Te hemos enviado un enlace para
            restablecer tu contraseña. El enlace expira en 1 hora.
          </p>
          <p className="text-gray-400 text-xs">
            Si no ves el correo, verifica tu carpeta de spam.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => setSent(false)}
            className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2a5080] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white h-10 rounded-xl shadow-md shadow-[#1e3a5f]/15"
          >
            Intentar con otro correo
          </Button>
          <Link href="/login" className="block">
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-200 h-10 rounded-xl"
            >
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-100/50 p-8">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          Recupera tu acceso
        </h2>
        <p className="text-gray-400 text-sm mt-1.5">
          Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
        </p>
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
            disabled={loading}
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-[#1e3a5f] to-[#2a5080] hover:from-[#162d4a] hover:to-[#1e3a5f] text-white h-10 rounded-xl shadow-md shadow-[#1e3a5f]/15 transition-all duration-300"
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
        <Link href="/login" className="text-sm text-[#1e3a5f]/70 hover:text-[#1e3a5f] font-medium transition-colors duration-200">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
