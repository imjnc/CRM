import { Sidebar } from "./sidebar"
import { SidebarProvider } from "./sidebar-context"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full bg-[#F9FAFB] overflow-hidden">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto bg-[#F9FAFB]">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
