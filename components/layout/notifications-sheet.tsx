"use client"

import { Bell } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function NotificationsSheet({ children }: { children?: React.ReactNode }) {
  // In a real app, you would fetch these from an API
  const notifications: any[] = [
    {
      id: "1",
      title: "New Lead Assigned",
      description: "Sarah Jenkins has been assigned to you.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: "2",
      title: "Meeting Reminder",
      description: "Quarterly review with TechCorp in 30 minutes.",
      time: "1 hour ago",
      unread: false,
    },
    {
      id: "3",
      title: "Deal Closed",
      description: "Acme Corp contract has been signed! 🎉",
      time: "Yesterday",
      unread: false,
    }
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <Bell size={16} />
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500"></span>
          </button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Stay updated with your latest alerts and messages.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-8">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 rounded-lg border border-gray-100 bg-gray-50/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 shadow-sm">
                <Bell className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">No new notifications</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-[250px] mx-auto">
                  You're all caught up! Check back later for new updates and alerts.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`relative rounded-lg p-4 transition-colors ${
                    notif.unread ? "bg-blue-50/50 hover:bg-blue-50/80" : "bg-white hover:bg-gray-50"
                  } border border-gray-100 shadow-sm`}
                >
                  {notif.unread && (
                    <span className="absolute top-4 right-4 flex h-2 w-2 rounded-full bg-blue-600"></span>
                  )}
                  <h4 className="text-sm font-semibold text-gray-900 pr-6">{notif.title}</h4>
                  <p className="mt-1 text-sm text-gray-600">{notif.description}</p>
                  <p className="mt-2 text-xs font-medium text-gray-400">{notif.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
