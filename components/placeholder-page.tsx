import { Plus, Search, Filter } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"

export function PlaceholderPage({ title, description, icon: Icon }: { title: string, description: string, icon: any }) {
  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-slate-50">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900">
              <Icon size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
              <p className="text-[13px] text-slate-500">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                className="h-9 w-64 rounded-md border border-slate-200 pl-9 pr-4 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 text-slate-600">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button size="sm" className="h-9 bg-gray-900 hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" /> New {title.replace(/s$/, '')}
            </Button>
          </div>
        </div>
        
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
              <Icon size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No {title.toLowerCase()} found</h3>
            <p className="text-slate-500 text-sm mb-6">
              Get started by creating a new {title.toLowerCase().replace(/s$/, '')}. All your {title.toLowerCase()} will appear here in a beautiful, organized view.
            </p>
            <Button className="bg-gray-900 hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" /> Create {title.replace(/s$/, '')}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
