export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f]">ImpulsIA</h1>
          <p className="text-gray-600 text-sm mt-1">Discordoba S.A.S.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
