import { auth } from '@/auth'
import { db } from '@/lib/db'
import { generateToken } from '@/lib/utils'
import { sendEmail, activationEmailHtml } from '@/lib/email'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role === 'JAIRO') return Response.json({ error: 'Sin permisos' }, { status: 403 })

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, activated: true },
    orderBy: { name: 'asc' },
  })
  return Response.json({ users })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ARELIS') {
    return Response.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { name, email, role } = await request.json()
  if (!email || !role) return Response.json({ error: 'Email y rol requeridos' }, { status: 400 })

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return Response.json({ error: 'El email ya existe' }, { status: 409 })

  const user = await db.user.create({
    data: { name, email, role },
  })

  // Create activation token
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
  await db.token.create({
    data: { userId: user.id, type: 'ACTIVATION', token, expiresAt },
  })

  const activationUrl = `${process.env.NEXTAUTH_URL}/activate/${token}`
  await sendEmail({
    to: email,
    subject: 'Activación de cuenta - ImpulsIA',
    html: activationEmailHtml(activationUrl, name || ''),
  })

  return Response.json({ user }, { status: 201 })
}
