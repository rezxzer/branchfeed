export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="bg-gray-900/80 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-6 w-28 bg-gray-800 rounded" />
          <div className="flex items-center gap-3">
            <div className="h-6 w-16 bg-gray-800 rounded" />
            <div className="h-8 w-24 bg-gray-800 rounded" />
          </div>
        </div>
      </header>
      <section className="min-h-[60vh] flex items-center justify-center bg-gradient-brand px-4 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="h-12 bg-white/20 rounded mb-4" />
            <div className="h-6 bg-white/10 rounded mb-8 w-3/4" />
            <div className="flex gap-4">
              <div className="h-10 w-32 bg-white/10 rounded" />
              <div className="h-10 w-32 bg-white/10 rounded" />
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/10 rounded-2xl p-8 border border-white/20">
              <div className="aspect-video bg-white/10 rounded" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 bg-gray-800 rounded mx-auto mb-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <div className="h-10 w-10 bg-gray-700 rounded-full mx-auto mb-4" />
                <div className="h-5 bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-700/80 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-between">
          <div className="h-4 w-32 bg-gray-800 rounded" />
          <div className="h-4 w-16 bg-gray-800 rounded" />
        </div>
      </footer>
    </div>
  )
}
