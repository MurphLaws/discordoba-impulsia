import { db } from '@/lib/db'
import { generateToken } from '@/lib/utils'
import { sendEmail, passwordResetEmailHtml } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, token: resetToken, password } = await request.json()

    // Case 1: Request password reset (email only)
    if (email && !resetToken && !password) {
      const user = await db.user.findUnique({
        where: { email },
      })

      // Don't reveal if email exists
      if (user) {
        try {
          const token = generateToken()
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

          await db.token.create({
            data: {
              userId: user.id,
              type: 'PASSWORD_RESET',
              token,
              expiresAt,
            },
          })

          const resetUrl = `${process.env.NEXTAUTH_URL}/create-password?token=${token}&reset=true`
          await sendEmail({
            to: email,
            subject: 'Recuperación de contraseña - ImpulsIA',
            html: passwordResetEmailHtml(resetUrl),
          })
        } catch (emailError) {
          console.error('Error sending reset email:', emailError)
          // Still return success to not reveal if email exists
        }
      }

      return Response.json({ success: true })
    }

    // Case 2: Actually reset password with token
    if (resetToken && password && !email) {
      if (!resetToken || !password) {
        return Response.json(
          { error: 'Token y contraseña son requeridos' },
          { status: 400 }
        )
      }

      const tokenRecord = await db.token.findUnique({
        where: { token: resetToken },
      })

      if (
        !tokenRecord ||
        tokenRecord.type !== 'PASSWORD_RESET' ||
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
          data: { passwordHash },
        }),
        db.token.update({
          where: { id: tokenRecord.id },
          data: { usedAt: new Date() },
        }),
      ])

      return Response.json({ success: true })
    }

    return Response.json(
      { error: 'Datos inválidos' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error en /api/tokens/reset:', error)
    return Response.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
