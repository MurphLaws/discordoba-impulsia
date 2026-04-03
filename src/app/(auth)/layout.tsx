export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2a5080] shadow-lg shadow-[#1e3a5f]/20 mb-5">
            <span className="text-white font-bold text-lg">IA</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ImpulsIA</h1>
          <p className="text-gray-400 text-sm mt-1.5 font-medium">Discordoba S.A.S.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
