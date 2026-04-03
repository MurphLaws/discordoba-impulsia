import SidebarNav from './SidebarNav'

interface Props {
  role: string
  userId: string
  userName?: string | null
  userEmail?: string
}

export default async function Sidebar({
  role,
  userId,
  userName,
  userEmail,
}: Props) {
  return (
    <aside className="w-64 bg-gradient-to-b from-[#1e3a5f] to-[#152d4a] flex flex-col shrink-0 shadow-xl">
      {/* Header */}
      <div className="px-6 py-7 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-tight">IA</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg tracking-tight">ImpulsIA</h1>
            <p className="text-white/40 text-[11px] font-medium tracking-wide uppercase">Discordoba S.A.S.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <SidebarNav role={role} />

      {/* User Info Footer */}
      <div className="mt-auto p-4 border-t border-white/8">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors duration-200">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
            <span className="text-xs font-semibold text-white/90">
              {(userName || userEmail || 'U')
                .substring(0, 2)
                .toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {userName && (
              <p className="text-sm font-medium text-white/90 truncate leading-tight">
                {userName}
              </p>
            )}
            <p className="text-[11px] text-white/40 truncate">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
