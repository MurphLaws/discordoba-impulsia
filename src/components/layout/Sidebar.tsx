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
    <aside className="w-60 bg-[#1e3a5f] flex flex-col shrink-0 border-r border-white/10">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-white font-bold text-xl">ImpulsIA</h1>
        <p className="text-white/50 text-xs mt-0.5">Discordoba S.A.S.</p>
      </div>

      {/* Navigation */}
      <SidebarNav role={role} />

      {/* User Info Footer */}
      <div className="mt-auto p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-white">
              {(userName || userEmail || 'U')
                .substring(0, 2)
                .toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {userName && (
              <p className="text-sm font-medium text-white truncate">
                {userName}
              </p>
            )}
            <p className="text-xs text-white/50 truncate">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
