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
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-red-50 p-3 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Enlace inválido
          </h2>
          <p className="text-gray-600 text-sm">
            Este enlace de activación ha expirado o ya fue utilizado. Por favor,
            solicita un nuevo enlace de activación.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block bg-[#1e3a5f] text-white px-6 py-2 rounded-lg hover:bg-[#152d47] font-medium text-sm transition-colors"
        >
          Ir al inicio de sesión
        </Link>
      </div>
    )
  }

  // Redirect to create password page with token
  redirect(`/create-password?token=${token}`)
}
