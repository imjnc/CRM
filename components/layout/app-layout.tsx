import { Sidebar } from "./sidebar"
import { SidebarProvider } from "./sidebar-context"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-white text-slate-900">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
