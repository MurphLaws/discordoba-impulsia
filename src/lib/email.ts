import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = 'ImpulsIA <noreply@discordoba.co>'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  return resend.emails.send({ from: FROM, to, subject, html })
}

export function activationEmailHtml(activationUrl: string, name: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Bienvenido a ImpulsIA, ${name || 'nuevo usuario'}</h2>
      <p>Tu cuenta ha sido creada. Haz clic en el siguiente enlace para activarla y crear tu contraseña:</p>
      <a href="${activationUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Activar cuenta
      </a>
      <p style="color: #666; font-size: 14px;">Este enlace expira en 48 horas. Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
    </div>
  `
}

export function passwordResetEmailHtml(resetUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Recuperación de contraseña - ImpulsIA</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic aquí:</p>
      <a href="${resetUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Restablecer contraseña
      </a>
      <p style="color: #666; font-size: 14px;">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este mensaje.</p>
    </div>
  `
}

export function projectNotificationEmailHtml(projectTitle: string, message: string, link: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Actualización de proyecto - ImpulsIA</h2>
      <h3>${projectTitle}</h3>
      <p>${message}</p>
      <a href="${link}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Ver proyecto
      </a>
    </div>
  `
}

export function alertEmailHtml(projectTitle: string, alertMessage: string, severity: string) {
  const color = severity === 'RED' ? '#dc2626' : severity === 'AMBER' ? '#d97706' : '#16a34a'
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${color};">Alerta de proyecto - ImpulsIA</h2>
      <h3>${projectTitle}</h3>
      <p>${alertMessage}</p>
    </div>
  `
}
