export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 font-sans">
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-gray-900">Design Builder</h1>
        </div>
        <div className="flex gap-2">
          <button className="rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-200">Preview</button>
          <button className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-black">Save Design</button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-gray-200 bg-white p-4 overflow-y-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Layers & Elements</h2>
          <div className="text-sm text-gray-400 italic">Coming soon...</div>
        </aside>
        
        <main className="flex-1 overflow-auto p-8 flex flex-col items-center">
          {children}
        </main>
        
        <aside className="w-64 border-l border-gray-200 bg-white p-4 overflow-y-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Properties</h2>
          <div className="text-sm text-gray-400 italic">Select an element to edit properties</div>
        </aside>
      </div>
    </div>
  )
}
