import { auth } from '@/auth'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import type { Stage } from '@/generated/prisma'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })
  if (!['ARELIS', 'GERENCIA'].includes(session.user.role)) {
    return Response.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const body = await request.json()
  const { type, format } = body

  if (!type || !format || !['pdf', 'xlsx'].includes(format)) {
    return Response.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  try {
    let rows: any[][] = []
    let fileName = `${type}_${Date.now()}`
    let title = 'Reporte de ImpulsIA'

    if (type === 'portfolio_summary') {
      title = 'Resumen del Portafolio'
      const projects = await db.project.findMany({
        include: {
          owner: { select: { name: true } },
          leader: { select: { name: true } },
        },
        orderBy: { updatedAt: 'desc' },
      })

      rows = [
        ['Proyecto', 'Cliente', 'Etapa', 'Estado', 'Prioridad', 'Propietario', 'Líder', 'Fecha Límite'],
        ...projects.map((p) => [
          p.title,
          p.client,
          p.stage,
          p.status,
          p.priority,
          p.owner?.name || '',
          p.leader?.name || '',
          p.dueDate ? formatDate(p.dueDate) : 'N/A',
        ]),
      ]
    } else if (type === 'stage_details') {
      title = 'Detalle por Etapa'
      const stages: Stage[] = ['OPORTUNIDAD', 'VIABILIDAD_TECNICA', 'MUESTRA', 'VALIDACION', 'LANZAMIENTO']
      const stageLabels: Record<Stage, string> = {
        OPORTUNIDAD: 'Oportunidad',
        VIABILIDAD_TECNICA: 'Viabilidad Técnica',
        MUESTRA: 'Muestra',
        VALIDACION: 'Validación',
        LANZAMIENTO: 'Lanzamiento',
        DESCARTADO: 'Descartado',
      }

      rows = [['Etapa', 'Cantidad', 'Proyectos']]

      for (const stage of stages) {
        const projects = await db.project.findMany({
          where: { stage, status: { not: 'DISCARDED' } },
          select: { title: true },
        })
        rows.push([stageLabels[stage], projects.length, projects.map((p) => p.title).join(', ')])
      }
    } else if (type === 'alerts_report') {
      title = 'Reporte de Alertas'
      const alerts = await db.alert.findMany({
        where: { resolved: false },
        include: { project: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
      })

      rows = [
        ['Proyecto', 'Tipo', 'Severidad', 'Mensaje', 'Fecha'],
        ...alerts.map((a) => [
          a.project?.title || 'N/A',
          a.type,
          a.severity,
          a.message,
          formatDate(a.createdAt),
        ]),
      ]
    } else if (type === 'activity_report') {
      title = 'Reporte de Actividades'
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const activities = await db.activity.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        include: {
          project: { select: { title: true } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      rows = [
        ['Proyecto', 'Usuario', 'Tipo', 'Contenido', 'Fecha'],
        ...activities.map((a) => [
          a.project?.title || 'N/A',
          a.user?.name || 'N/A',
          a.type,
          a.content,
          formatDate(a.createdAt),
        ]),
      ]
    } else {
      return Response.json({ error: 'Tipo de reporte no válido' }, { status: 400 })
    }

    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(rows)

      // Auto-adjust column widths
      const colWidths = rows[0].map((_, colIndex) =>
        Math.max(...rows.map((row) => String(row[colIndex] || '').length))
      )
      ws['!cols'] = colWidths.map((width) => ({ wch: Math.min(width + 2, 50) }))

      XLSX.utils.book_append_sheet(wb, ws, 'Reporte')
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}.xlsx"`,
        },
      })
    }

    // PDF generation
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text(title, 14, 22)
    doc.setFontSize(10)
    doc.text(`Generado: ${formatDate(new Date())}`, 14, 32)

    let yPos = 42
    const pageHeight = doc.internal.pageSize.height
    const marginBottom = 10

    // Add table
    doc.setFontSize(10)

    // Header row
    doc.setFont(undefined, 'bold')
    rows[0].forEach((cell, index) => {
      const xPos = 14 + index * 35
      doc.text(String(cell), xPos, yPos, { maxWidth: 33 })
    })

    doc.setFont(undefined, 'normal')
    yPos += 7

    // Data rows
    for (let i = 1; i < rows.length; i++) {
      if (yPos > pageHeight - marginBottom) {
        doc.addPage()
        yPos = 14
      }

      rows[i].forEach((cell, index) => {
        const xPos = 14 + index * 35
        const text = String(cell).substring(0, 30)
        doc.text(text, xPos, yPos, { maxWidth: 33 })
      })

      yPos += 7
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return Response.json({ error: 'Error al generar reporte' }, { status: 500 })
  }
}
