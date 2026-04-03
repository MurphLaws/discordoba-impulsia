import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ReportDownloadButton from '@/components/reports/ReportDownloadButton'
import { BarChart3, FileText, AlertTriangle, Activity } from 'lucide-react'

export default async function ReportsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const reports = [
    {
      id: 'portfolio_summary',
      title: 'Resumen del Portafolio',
      description: 'Vista general de todos los proyectos con información clave: etapa, estado, prioridad y fechas límite.',
      icon: BarChart3,
    },
    {
      id: 'stage_details',
      title: 'Detalle por Etapa',
      description: 'Análisis desglosado de proyectos agrupados por cada etapa del ciclo de vida.',
      icon: FileText,
    },
    {
      id: 'alerts_report',
      title: 'Reporte de Alertas',
      description: 'Listado completo de alertas activas clasificadas por severidad y tipo.',
      icon: AlertTriangle,
    },
    {
      id: 'activity_report',
      title: 'Reporte de Actividades',
      description: 'Actividades registradas en los últimos 30 días con detalle de usuarios y proyectos.',
      icon: Activity,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
        <p className="text-gray-600 mt-1">Analiza el desempeño del portafolio y descarga reportes en PDF o Excel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <div
              key={report.id}
              className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <ReportDownloadButton
                  type={report.id as any}
                  format="pdf"
                  label="Descargar PDF"
                  className="flex-1 justify-center"
                />
                <ReportDownloadButton
                  type={report.id as any}
                  format="xlsx"
                  label="Descargar Excel"
                  className="flex-1 justify-center"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
