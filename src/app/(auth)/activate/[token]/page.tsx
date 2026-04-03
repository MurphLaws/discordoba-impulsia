import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function ActivatePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const tokenRecord = await db.token.findUnique({
    where: { token },
    include: { user: true },
  })

  const isValid =
    tokenRecord &&
    tokenRecord.type === 'ACTIVATION' &&
    !tokenRecord.usedAt &&
    tokenRecord.expiresAt > new Date()

  if (!isValid) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-100/50 p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
            Enlace inválido
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Este enlace de activación ha expirado o ya fue utilizado. Por favor,
            solicita un nuevo enlace de activación.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block bg-gradient-to-r from-[#1e3a5f] to-[#2a5080] text-white px-6 py-2.5 rounded-xl hover:from-[#162d4a] hover:to-[#1e3a5f] font-semibold text-sm transition-all duration-300 shadow-md shadow-[#1e3a5f]/15"
        >
          Ir al inicio de sesión
        </Link>
      </div>
    )
  }

  redirect(`/create-password?token=${token}`)
}
