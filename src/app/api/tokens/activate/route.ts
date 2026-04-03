import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return Response.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const tokenRecord = await db.token.findUnique({
      where: { token },
      include: { user: true },
    })

    if (
      !tokenRecord ||
      tokenRecord.type !== 'ACTIVATION' ||
      tokenRecord.usedAt ||
      tokenRecord.expiresAt < new Date()
    ) {
      return Response.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await db.$transaction([
      db.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash, activated: true },
      }),
      db.token.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      }),
    ])

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error en /api/tokens/activate:', error)
    return Response.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
